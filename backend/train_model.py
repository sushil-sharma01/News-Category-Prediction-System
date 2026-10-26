"""Train the News Classifier.

Usage:
    python train_model.py
    python train_model.py --data path/to/news_dataset.csv --extra another.csv
    python train_model.py --data path/to/news_dataset.csv --keywords path/to/category_keywords.csv

CSV files need either Article/Heading and NewsType/category, or processed_text
and NewsType/category. The article_text/headline/clean_text/category format is
also supported. A keyword CSV may contain one column per supported category,
with one keyword per row.
By default, training merges the bundled datasets in ./data.
Outputs go to ./models (override with --out).
"""
import argparse
import json
import os
import time

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import LabelEncoder

from categories import SUPPORTED_CATEGORIES, normalize_category
from preprocessing import TextPreprocessor

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
EXPECTED_CATEGORIES = set(SUPPORTED_CATEGORIES)

parser = argparse.ArgumentParser()
parser.add_argument(
    "--data",
    default=os.environ.get(
        "NEWS_DATASET",
        os.path.join(DATA_DIR, "news_7_categories_dataset.csv"),
    ),
)
parser.add_argument(
    "--extra",
    nargs="*",
    default=[
        os.path.join(DATA_DIR, "news_climate_crime_dataset.csv"),
        os.path.join(DATA_DIR, "new_categories_raw.csv"),
        os.path.join(DATA_DIR, "news_dataset_fully_preprocessed.csv"),
    ],
    help="Additional CSV files with Article/Heading/NewsType or processed_text/NewsType",
)
parser.add_argument(
    "--keywords",
    default=os.environ.get("NEWS_KEYWORDS"),
    help="Optional CSV with one keyword column per supported category",
)
parser.add_argument("--out", default=os.path.join(BASE_DIR, "models"))
args = parser.parse_args()

os.makedirs(args.out, exist_ok=True)

print("=" * 60)
print("NEWS CLASSIFIER - MODEL TRAINING")
print("=" * 60)

# ---------------------------------------------------------------- load
preprocessor = TextPreprocessor()


def load_dataset(path):
    source = pd.read_csv(path)
    columns = {column.casefold(): column for column in source.columns}
    category_column = next(
        (columns[name] for name in ("newstype", "category") if name in columns),
        None,
    )
    article_column = next(
        (columns[name] for name in ("article", "article_text") if name in columns),
        None,
    )
    heading_column = next(
        (columns[name] for name in ("heading", "headline") if name in columns),
        None,
    )
    processed_column = next(
        (columns[name] for name in ("processed_text", "clean_text") if name in columns),
        None,
    )

    if category_column is None:
        raise ValueError(
            f"Required category column ('NewsType' or 'category') not found in {path}."
        )
    if article_column is not None:
        article = source[article_column].fillna("").astype(str).str.strip()
        heading = (
            source[heading_column].fillna("").astype(str).str.strip()
            if heading_column is not None
            else ""
        )
        source["text"] = (heading + " " + article).str.strip()
    elif processed_column is not None:
        source["text"] = source[processed_column].fillna("").astype(str).str.strip()
    else:
        raise ValueError(
            f"{path} must contain Article/article_text or processed_text/clean_text."
        )

    source["NewsType"] = (
        source[category_column].fillna("").astype(str).map(normalize_category)
    )
    use_provided_processed_text = processed_column is not None and not (
        processed_column.casefold() == "clean_text" and article_column is not None
    )
    if use_provided_processed_text:
        processed_text = source[processed_column].fillna("").astype(str).str.strip()
        source["processed_text"] = processed_text.where(
            processed_text.str.len() > 0,
            source["text"].apply(preprocessor.preprocess),
        )
    else:
        source["processed_text"] = source["text"].apply(preprocessor.preprocess)

    source = source[["text", "processed_text", "NewsType"]]
    return source[
        (source["processed_text"].str.len() > 0)
        & (source["NewsType"].str.len() > 0)
    ].reset_index(drop=True)


def load_keyword_dataset(path):
    source = pd.read_csv(path)
    keyword_columns = {}
    for column in source.columns:
        if column.casefold() in {"no", "number", "id"}:
            continue
        category = normalize_category(column)
        if category not in EXPECTED_CATEGORIES:
            continue
        if category in keyword_columns:
            raise ValueError(
                f"Multiple keyword columns map to category '{category}' in {path}."
            )
        keyword_columns[category] = column

    missing_categories = sorted(EXPECTED_CATEGORIES - set(keyword_columns))
    if missing_categories:
        raise ValueError(
            f"Keyword dataset {path} is missing category columns: {missing_categories}."
        )

    keyword_rows = [
        {
            "text": str(keyword).strip(),
            "processed_text": preprocessor.preprocess(str(keyword).strip()),
            "NewsType": category,
        }
        for category, column in keyword_columns.items()
        for keyword in source[column].dropna()
        if str(keyword).strip()
    ]
    keywords = pd.DataFrame(keyword_rows)
    keywords = keywords[keywords["processed_text"].str.len() > 0].reset_index(drop=True)
    if keywords.empty:
        raise ValueError(f"No usable category keywords were found in {path}.")
    return keywords


data_paths = [args.data, *args.extra]
df = pd.concat([load_dataset(path) for path in data_paths], ignore_index=True)
rows_loaded = len(df)
keyword_df = load_keyword_dataset(args.keywords) if args.keywords else pd.DataFrame(
    columns=["text", "processed_text", "NewsType"]
)
keyword_samples_added = len(keyword_df)

# Keep only the supported taxonomy; for example, discard legacy India rows.
unsupported_rows = int((~df["NewsType"].isin(EXPECTED_CATEGORIES)).sum())
df = df[df["NewsType"].isin(EXPECTED_CATEGORIES)].reset_index(drop=True)
if df.empty:
    raise ValueError("No rows matched the supported news categories.")

# Dataset statistics (raw text, before dedupe)
word_counts = df["text"].str.split().str.len()
raw_stats = {
    "avg_article_words": round(float(word_counts.mean()), 1),
    "median_article_words": round(float(word_counts.median()), 1),
}

# ------------------------------------------------------------- dedupe
# Exact duplicates (after preprocessing) in both train and test inflate accuracy.
before = len(df)
df = df.drop_duplicates(subset="processed_text").reset_index(drop=True)
duplicates_removed = before - len(df)
print(f"Rows loaded: {rows_loaded} | duplicates removed: {duplicates_removed} | kept: {len(df)}")
print(f"Unsupported-category rows excluded: {unsupported_rows}")

categories = sorted(df["NewsType"].unique())
actual_categories = set(categories)
missing_categories = sorted(EXPECTED_CATEGORIES - actual_categories)
unsupported_categories = sorted(actual_categories - EXPECTED_CATEGORIES)
if missing_categories or unsupported_categories:
    raise ValueError(
        f"Merged datasets must contain all {len(EXPECTED_CATEGORIES)} supported categories. "
        f"Missing: {missing_categories or 'none'}; "
        f"unsupported: {unsupported_categories or 'none'}."
    )

category_counts = df["NewsType"].value_counts().add(
    keyword_df["NewsType"].value_counts(), fill_value=0
).astype(int).to_dict()
for name, count in category_counts.items():
    print(f"  {name}: {count}")
if args.keywords:
    print(f"Keyword training examples added: {keyword_samples_added}")

# --------------------------------------------------------------- split
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(df["NewsType"])
X = df["processed_text"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"Train: {len(X_train)} | Test: {len(X_test)}")
X_model_train = pd.concat(
    [X_train.reset_index(drop=True), keyword_df["processed_text"]],
    ignore_index=True,
)
y_model_train = np.concatenate(
    [
        y_train,
        label_encoder.transform(keyword_df["NewsType"])
        if keyword_samples_added
        else np.array([], dtype=int),
    ]
)
print(f"Final model training examples: {len(X_model_train)}")


def make_vectorizer():
    return TfidfVectorizer(
        lowercase=False,
        ngram_range=(1, 2),
        min_df=1 if keyword_samples_added else 2,
        max_features=50000,
        sublinear_tf=True,
    )


def make_classifier():
    return LogisticRegression(C=2.0, max_iter=2000, class_weight="balanced")


# ------------------------------------------------- cross-validation
# Vectorizer is refit inside each fold, so there is no leakage.
print("\nRunning 5-fold cross-validation on the training set...")
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(
    make_pipeline(make_vectorizer(), make_classifier()),
    X_train, y_train, cv=cv, scoring="accuracy",
)
print(f"CV accuracy: {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f})")

# --------------------------------------------------------------- train
vectorizer = make_vectorizer()
X_train_vec = vectorizer.fit_transform(X_model_train)
X_test_vec = vectorizer.transform(X_test)

classifier = make_classifier()
start = time.time()
classifier.fit(X_train_vec, y_model_train)
training_time = time.time() - start

# ------------------------------------------------ near-duplicate check
# Share of test articles that are almost identical to a training article.
# TF-IDF rows are L2-normalised, so the dot product is cosine similarity.
max_sim = np.asarray((X_test_vec @ X_train_vec.T).max(axis=1).todense()).ravel()
near_duplicate_pct = round(float((max_sim >= 0.90).mean()) * 100, 1)
print(f"Test articles with a >=0.90 similar training article: {near_duplicate_pct}%")

# ------------------------------------------------------------ evaluate
y_pred = classifier.predict(X_test_vec)
accuracy = accuracy_score(y_test, y_pred)
report = classification_report(
    y_test, y_pred, target_names=label_encoder.classes_,
    output_dict=True, zero_division=0,
)
print(f"\nTEST ACCURACY: {accuracy * 100:.2f}%\n")
print(classification_report(
    y_test, y_pred, target_names=label_encoder.classes_, zero_division=0
))

# ---------------------------------------------------------------- save
joblib.dump(classifier, os.path.join(args.out, "news_classifier.pkl"))
joblib.dump(vectorizer, os.path.join(args.out, "tfidf_vectorizer.pkl"))
joblib.dump(label_encoder, os.path.join(args.out, "label_encoder.pkl"))

performance = {
    "accuracy": round(float(accuracy) * 100, 2),
    "cv_accuracy_mean": round(float(cv_scores.mean()) * 100, 2),
    "cv_accuracy_std": round(float(cv_scores.std()) * 100, 2),
    "near_duplicate_test_pct": near_duplicate_pct,
    "duplicates_removed": int(duplicates_removed),
    "unsupported_rows_removed": unsupported_rows,
    "source_datasets": [
        *[os.path.basename(path) for path in data_paths],
        *([os.path.basename(args.keywords)] if args.keywords else []),
    ],
    "keyword_samples_added": int(keyword_samples_added),
    "training_samples": int(len(X_model_train)),
    "testing_samples": int(len(X_test)),
    "total_samples": int(len(df) + keyword_samples_added),
    "vocabulary_size": int(len(vectorizer.vocabulary_)),
    "training_time_seconds": round(float(training_time), 2),
    "avg_article_words": raw_stats["avg_article_words"],
    "median_article_words": raw_stats["median_article_words"],
    "category_counts": {str(k): int(v) for k, v in category_counts.items()},
    "categories": [str(c) for c in label_encoder.classes_],
    "classification_report": report,
}

with open(os.path.join(args.out, "performance.json"), "w", encoding="utf-8") as f:
    json.dump(performance, f, indent=4)

print(f"Saved model files to {args.out}")
import json
import os
import re

import joblib
import numpy as np

from categories import SUPPORTED_CATEGORIES
from preprocessing import TextPreprocessor


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
WEATHER_TOPIC_PATTERN = re.compile(
    r"\b(?:weather|forecast|rain|rainfall|storm|temperature|heatwave|"
    r"wind|snowfall|flood|drought|hurricane|tornado|blizzard|"
    r"precipitation|meteorological)\b",
    re.IGNORECASE,
)
SPORTS_CONTEXT_PATTERN = re.compile(
    r"\b(?:cricket|football|soccer|basketball|tennis|rugby|baseball|"
    r"match|tournament|league|player|team|coach|innings|championship|"
    r"wicket|goal|score|athlete|stadium|race)\b",
    re.IGNORECASE,
)


class ClassifierService:
    def __init__(self):
        self.preprocessor = TextPreprocessor()

        classifier_path = os.path.join(MODEL_DIR, "news_classifier.pkl")
        vectorizer_path = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")
        encoder_path = os.path.join(MODEL_DIR, "label_encoder.pkl")

        if not os.path.exists(classifier_path):
            raise FileNotFoundError(f"Classifier not found: {classifier_path}")

        if not os.path.exists(vectorizer_path):
            raise FileNotFoundError(
                f"TF-IDF vectorizer not found: {vectorizer_path}"
            )

        if not os.path.exists(encoder_path):
            raise FileNotFoundError(f"Label encoder not found: {encoder_path}")

        self.classifier = joblib.load(classifier_path)
        self.vectorizer = joblib.load(vectorizer_path)
        self.label_encoder = joblib.load(encoder_path)
        self.performance = self._load_performance()

    def _load_performance(self):
        path = os.path.join(MODEL_DIR, "performance.json")

        if not os.path.exists(path):
            return {}

        try:
            with open(path, "r", encoding="utf-8") as file:
                return json.load(file)
        except (OSError, json.JSONDecodeError):
            return {}

    def predict(self, text: str):
        if not text or not text.strip():
            raise ValueError("News text cannot be empty.")

        cleaned_text = self.preprocessor.preprocess(text)

        if not cleaned_text.strip():
            raise ValueError("No meaningful text remained after preprocessing.")

        vector = self.vectorizer.transform([cleaned_text])

        if hasattr(self.classifier, "predict_proba"):
            probabilities = self.classifier.predict_proba(vector)[0]
        else:
            decision_scores = self.classifier.decision_function(vector)

            if decision_scores.ndim == 1:
                decision_scores = np.column_stack(
                    [-decision_scores, decision_scores]
                )

            exp_scores = np.exp(
                decision_scores
                - np.max(decision_scores, axis=1, keepdims=True)
            )
            probabilities = (
                exp_scores / exp_scores.sum(axis=1, keepdims=True)
            )[0]

        categories = self.label_encoder.classes_
        predictions = [
            {
                "category": str(category),
                "confidence": round(float(probability) * 100, 2),
            }
            for category, probability in zip(categories, probabilities)
        ]
        predictions.sort(key=lambda item: item["confidence"], reverse=True)

        supported_predictions = [
            item for item in predictions
            if item["category"] in SUPPORTED_CATEGORIES
        ]
        if not supported_predictions or predictions[0]["category"] not in SUPPORTED_CATEGORIES:
            raise ValueError("The model could not assign this article to a supported category.")

        weather_topic = (
            WEATHER_TOPIC_PATTERN.search(text) is not None
            and SPORTS_CONTEXT_PATTERN.search(text) is None
        )
        climate_prediction = next(
            (
                item for item in supported_predictions
                if item["category"] == "Climate"
            ),
            None,
        )
        primary = (
            climate_prediction
            if weather_topic and climate_prediction is not None
            else supported_predictions[0]
        )
        ranked_predictions = [
            primary,
            *(
                item for item in supported_predictions
                if item["category"] != primary["category"]
            ),
        ]
        primary_confidence = primary["confidence"]

        if primary_confidence >= 75:
            confidence_level = "High"
        elif primary_confidence >= 50:
            confidence_level = "Medium"
        else:
            confidence_level = "Low"

        message = (
            "Weather-related text is routed to Climate unless it has clear "
            "sports context. Confidence remains the model's Climate probability. "
            if weather_topic and climate_prediction is not None
            else "Primary category selected from the highest model confidence. "
        )

        return {
            "primary_category": primary["category"],
            "confidence": primary_confidence,
            "confidence_level": confidence_level,
            "related_categories": [
                item for item in ranked_predictions[1:4] if item["confidence"] >= 8
            ],
            "top_predictions": ranked_predictions[:5],
            "cleaned_text": cleaned_text,
            "message": message + "Related categories show other meaningful predictions.",
        }

    def get_pipeline_details(self, text: str):
        if not text or not text.strip():
            raise ValueError("News text cannot be empty.")

        cleaned_text = self.preprocessor.preprocess(text)
        if not cleaned_text.strip():
            raise ValueError("No meaningful text remained after preprocessing.")

        vector = self.vectorizer.transform([cleaned_text])
        feature_names = self.vectorizer.get_feature_names_out()

        cx = vector.tocoo()
        tfidf_terms = []
        for idx, val in zip(cx.col, cx.data):
            tfidf_terms.append({
                "term": str(feature_names[idx]),
                "score": round(float(val), 4),
                "is_ngram": " " in str(feature_names[idx]),
            })
        tfidf_terms.sort(key=lambda item: item["score"], reverse=True)

        prediction_result = self.predict(text)

        return {
            "cleaned_text": cleaned_text,
            "tokens": cleaned_text.split(),
            "tfidf_terms": tfidf_terms,
            "total_vocab_size": len(feature_names),
            "matched_terms_count": len(tfidf_terms),
            "prediction": prediction_result,
        }

    def get_model_performance(self):
        return self.performance

    def get_statistics(self):
        categories = [
            str(category)
            for category in self.label_encoder.classes_
            if str(category) in SUPPORTED_CATEGORIES
        ]
        category_counts = {
            category: int(count)
            for category, count in self.performance.get("category_counts", {}).items()
            if category in categories
        }
        return {
            "categories": categories,
            "category_count": len(categories),
            "total_samples": int(self.performance.get("total_samples", 0)),
            "supported_samples": sum(category_counts.values()),
            "category_counts": category_counts,
        }


classifier_service = ClassifierService()

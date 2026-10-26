# News Category Prediction System
> **An AI-powered Natural Language Processing (NLP) and Machine Learning dashboard for automated news classification into 12 distinct categories.**

---

## 1. Project Overview

The **News Category Prediction System** is a full-stack machine learning application designed to classify news articles and headlines with high precision and speed. The system implements a robust NLP preprocessing pipeline, TF-IDF vectorization, and a multiclass Logistic Regression classifier, complete with confidence scoring and secondary category distributions.

### Supported News Categories (12)
1. **Technology** (AI, chips, software, cloud, cybersecurity)
2. **Sports** (Cricket, football, tournaments, athletics)
3. **Business** (Markets, stocks, economy, inflation, commerce)
4. **Politics** (Elections, diplomacy, policy, governance)
5. **Health** (Clinical trials, medicine, oncology, healthcare)
6. **Science** (Astrophysics, exoplanets, physics, space)
7. **Entertainment** (Cinema, music, festivals, media)
8. **World** (International treaties, global summits, geopolitics)
9. **Climate** (Global warming, emissions, extreme weather)
10. **Environment** (Conservation, renewables, biodiversity)
11. **Crime** (Law enforcement, court trials, investigations)
12. **Education** (Universities, academic research, STEM pedagogy)

---

## 2. Key Features

- **End-to-End NLP Pipeline:** Automated lowercase normalization, HTML/URL stripping, punctuation handling, custom stopword removal, and n-gram TF-IDF feature extraction.
- **Trained Machine Learning Model:** Scikit-Learn multiclass Logistic Regression (`C=2.0`, `balanced` weighting) with evaluation values recorded in `backend/models/performance.json` (see [Evaluation Methodology and Limitations](#11-evaluation-methodology-and-limitations)).
- **Confidence Scoring & Ranking:** Model probability scores display the primary prediction, a confidence tier (`High`, `Medium`, `Low`), and secondary categories. These scores are not separately calibrated.
- **Multi-Format Input:** Supports manual typing of headlines & body text, one-click verified demo samples, and instant document parsing (`.pdf` and `.docx`).
- **Interactive Analytics Dashboard:** Live distribution charts, corpus class share, vocabulary insights, and evaluation benchmarks.
- **RESTful API with Swagger:** FastAPI backend providing `/predict`, `/preprocess`, `/health`, and `/statistics` endpoints with automatic OpenAPI documentation.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons |
| **Backend** | FastAPI, Uvicorn, Pydantic v2 |
| **Machine Learning** | Scikit-Learn, TF-IDF Vectorizer (1-2 ngrams), Logistic Regression, Joblib |
| **Document Processing** | PDF.js (`pdfjs-dist`), Mammoth (`.docx` parser) |
| **Data Storage** | Serialized Joblib artifacts (`.pkl`), JSON metrics, CSV datasets |

---

## 4. Project Directory Structure

```
news-classifier/
├── backend/
│   ├── main.py                  # FastAPI server entry point and API routes
│   ├── model_utils.py           # ClassifierService for loading models & inference
│   ├── preprocessing.py         # TextPreprocessor (cleaning & tokenization)
│   ├── categories.py            # Taxonomy definitions & normalization
│   ├── train_model.py           # Training script with cross-validation & metrics
│   ├── data/                    # Datasets and sample files
│   │   ├── demo_samples.json    # Verified sample articles for live demonstration
│   │   └── ...                  # Training CSVs
│   └── models/                  # Serialized trained artifacts
│       ├── news_classifier.pkl  # Trained Logistic Regression classifier
│       ├── tfidf_vectorizer.pkl # Fitted TF-IDF Vectorizer
│       ├── label_encoder.pkl    # Category label encoder
│       └── performance.json     # Evaluated metrics and classification report
├── src/
│   ├── App.tsx                  # Root component and layout router
│   ├── index.css                # Global stylesheet and Tailwind tokens
│   ├── components/              # Reusable UI components
│   │   ├── NewsPredictionCard.tsx  # Main interactive prediction form
│   │   ├── MetricCards.tsx         # Dashboard summary counters
│   │   ├── TrendingNews.tsx        # News feed with quick testing
│   │   ├── NLPPipeline.tsx         # Architecture visualization
│   │   ├── CategoryDistribution.tsx# Visual category distribution bar chart
│   │   └── Sidebar.tsx             # Navigation with live backend health monitor
│   ├── views/                   # Application views (Dashboard, Predict, Pipeline, etc.)
│   ├── data/                    # Demo data, categories metadata, and benchmarks
│   ├── utils/                   # API clients and document extractors
│   └── types/                   # TypeScript interfaces (news.ts)
├── .env.example                 # Environment configuration template
├── package.json                 # Frontend dependencies and run scripts
├── requirements.txt             # Python backend dependencies
└── README.md                    # Project documentation
```

---

## 5. Prerequisites

Before running the project, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher) and **npm**
- **Python** (v3.10, v3.11, or v3.12)
- Modern web browser (Chrome, Edge, Firefox, or Safari)

---

## 6. Setup & Installation

### Step 1: Clone or Open the Repository
```bash
cd news-classifier
```

### Step 2: Set Up Python Backend Environment
```bash
# Optional: Create and activate virtual environment
python -m venv .venv

# Windows (PowerShell):
.venv\Scripts\Activate.ps1

# Linux / macOS:
source .venv/bin/activate

# Install required Python dependencies:
pip install -r requirements.txt
```

### Step 3: Install Frontend Dependencies
```bash
npm install
```

---

## 7. Running the Application

Open **two separate terminal windows**:

### Terminal 1: Start the FastAPI Backend
```bash
cd backend
python -m uvicorn main:app --reload --port 8001
```
- **Backend API URL:** `http://127.0.0.1:8001`
- **Interactive Swagger Documentation:** `http://127.0.0.1:8001/docs`
- **Alternative ReDoc Documentation:** `http://127.0.0.1:8001/redoc`

### Terminal 2: Start the React Frontend
```bash
npm run dev
```
- **Frontend Dashboard URL:** `http://localhost:3000` (or `http://localhost:5173`)

---

## 8. Verifying & Testing a Prediction

### Method 1: Using the Web UI
1. Open `http://localhost:3000` in your browser.
2. Verify that the Sidebar status indicator displays **Model Connected (12 Classes)**.
3. Navigate to **Predict News** or use the card on the **Dashboard**.
4. Click any of the **Load Demo Sample** buttons (`Technology`, `Sports`, `Business`, `Health`, `Science`, `Climate`) to autofill a verified test article.
5. Click **Predict Category** to see the predicted class, confidence percentage, confidence tier, and preprocessed NLP tokens.

### Method 2: Testing via cURL or Terminal
```bash
curl -X POST "http://127.0.0.1:8001/predict" \
     -H "Content-Type: application/json" \
     -d "{\"headline\": \"New AI chip accelerates computing\", \"text\": \"Researchers develop custom semiconductor silicon reducing deep learning inference latency by 40 percent.\"}"
```

### Expected Response:
```json
{
  "primary_category": "Technology",
  "confidence": 98.4,
  "confidence_level": "High",
  "related_categories": [],
  "top_predictions": [
    {"category": "Technology", "confidence": 98.4},
    {"category": "Science", "confidence": 1.2}
  ],
  "cleaned_text": "researchers develop custom semiconductor silicon reducing deep learning inference latency 40 percent",
  "message": "Primary category selected from the highest model confidence."
}
```

---

## 9. Common Errors & Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"Backend Disconnected" in UI** | FastAPI server is not running on port 8001. | Open a terminal, `cd backend`, and run `python -m uvicorn main:app --reload --port 8001`. |
| **CORS policy error in browser console** | Origin mismatch or custom frontend port. | `backend/main.py` is configured with wildcard localhost regex. Ensure you access frontend via `http://localhost:...` or `http://127.0.0.1:...`. |
| **"Article text must contain at least 5 characters"** | Empty or single-word text was submitted. | Provide at least 5 characters of article body text. |
| **"No meaningful text remained after preprocessing"** | Input contained only punctuation or stopwords. | Enter realistic natural language sentences containing descriptive nouns or verbs. |
| **Port 8001 is already in use** | An old instance of uvicorn is still running. | Stop previous instances or run on another port: `uvicorn main:app --port 8002` and set `VITE_API_URL=http://127.0.0.1:8002` in `.env.local`. |

---

## 10. College Viva & Evaluation Reference

- **Why TF-IDF + Logistic Regression?**
  *Logistic Regression is computationally lightweight, fast to train, highly explainable, and excels on high-dimensional sparse text representations produced by TF-IDF n-grams without requiring expensive GPU compute.*
- **What vocabulary size is recorded?**
  *The checked-in `performance.json` records 18,249 unigrams and bigrams. See the provenance caveat below before treating this as reproducible from the bundled inputs.*
- **How is Class Imbalance Handled?**
  *Balanced class weighting (`class_weight='balanced'`) is used in Logistic Regression to penalize misclassifications proportionally.*
- **How is Inference Confidence Calculated?**
  *The classifier's `predict_proba()` output is displayed as a percentage. Scores $\ge 75\%$ are categorized as High confidence, $50\text{--}74\%$ as Medium, and $<50\%$ as Low. The scores are not independently calibrated and should not be interpreted as guaranteed probabilities of correctness.*

## 11. Evaluation Methodology and Limitations

The current `backend/train_model.py` training procedure removes exact duplicate preprocessed text, makes an 80/20 stratified train/test split with `random_state=42`, and runs 5-fold stratified cross-validation on the training partition. The TF-IDF vectorizer is fit inside each cross-validation fold. It also reports the share of test examples with a training example at cosine similarity of at least 0.90.

The checked-in `backend/models/performance.json` records **99.67% test accuracy**, **99.89% mean cross-validation accuracy (0.04 percentage-point standard deviation)**, and **0.4% near-duplicate test examples**. These are the values in that artifact, not results independently reproduced as part of this repository preparation.

**Reproducibility caveat:** `performance.json` names `news_dataset_12_categories_7200.csv`, `news_dataset_final_3060.csv`, and `category_keywords_100_each.csv` as its source datasets, but those files are not present in the bundled `backend/data/` directory. The current training script's bundled defaults therefore do not reproduce the exact recorded run from the files in this repository. The source files or original training arguments are needed to reproduce those reported metrics.

The evaluation uses a split from the available corpus and is not an independent external benchmark. Results may not generalize to other publishers, time periods, writing styles, languages, or class distributions. The model only supports the 12 configured categories, and its probability scores are not separately calibrated. Review the dataset sources and their redistribution terms before publishing the bundled article text.

"""FastAPI Server for News Category Prediction System.

Provides endpoints for news text classification, text preprocessing,
health monitoring, taxonomy retrieval, and model performance metrics.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from model_utils import classifier_service


app = FastAPI(
    title="News Category Prediction API",
    description="NLP & Machine Learning system classifying news articles into 12 categories.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Allow requests from frontend development servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class NewsRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=5,
        description="News article content body",
    )
    headline: str | None = Field(
        default=None,
        description="Optional news headline",
    )


@app.get("/", summary="API Root")
def root():
    return {
        "name": "News Category Prediction API",
        "version": "1.0.0",
        "status": "running",
        "documentation": "/docs",
    }


@app.get("/health", summary="Service Health & Model Status")
def health():
    try:
        model_ready = classifier_service.classifier is not None
        categories = list(classifier_service.label_encoder.classes_) if model_ready else []
        return {
            "status": "healthy",
            "model_ready": model_ready,
            "model_type": "Logistic Regression + TF-IDF",
            "categories_count": len(categories),
            "categories": categories,
            "version": "1.0.0",
        }
    except Exception as exc:
        return {
            "status": "degraded",
            "model_ready": False,
            "error": str(exc),
        }


@app.post("/predict", summary="Predict Category for News Article")
def predict_news(payload: NewsRequest):
    try:
        headline = (payload.headline or "").strip()
        text = payload.text.strip()

        if len(text) < 5:
            raise HTTPException(
                status_code=400,
                detail="Article text must contain at least 5 characters.",
            )

        content = f"{headline} {text}".strip()
        return classifier_service.predict(content)
    except HTTPException:
        raise
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Prediction processing failed. Please ensure the text contains valid language content.",
        ) from error


@app.post("/preprocess", summary="NLP Preprocessing Inspection")
def preprocess_news(payload: NewsRequest):
    try:
        headline = (payload.headline or "").strip()
        text = payload.text.strip()
        content = f"{headline} {text}".strip()
        cleaned = classifier_service.preprocessor.preprocess(content)
        return {
            "original_text": content,
            "cleaned_text": cleaned,
            "tokens": cleaned.split() if cleaned else [],
            "token_count": len(cleaned.split()) if cleaned else 0,
        }
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Preprocessing failed: {str(error)}",
        ) from error


@app.post("/pipeline-inspect", summary="Full NLP Pipeline Inspection with TF-IDF and Prediction")
def pipeline_inspect(payload: NewsRequest):
    try:
        headline = (payload.headline or "").strip()
        text = payload.text.strip()
        if len(text) < 5:
            raise HTTPException(
                status_code=400,
                detail="Article text must contain at least 5 characters.",
            )
        content = f"{headline} {text}".strip()
        return classifier_service.get_pipeline_details(content)
    except HTTPException:
        raise
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline inspection failed: {str(error)}",
        ) from error


@app.get("/categories", summary="Supported Categories & Counts")
def get_categories():
    return classifier_service.get_statistics()


@app.get("/model-performance", summary="Evaluation & Benchmark Metrics")
def model_performance():
    return classifier_service.get_model_performance()


@app.get("/statistics", summary="Training Corpus Statistics")
def statistics():
    return classifier_service.get_statistics()

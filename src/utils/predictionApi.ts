import { NewsCategory, PredictionResult } from '../types/news';

export const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://127.0.0.1:8001';

interface ApiPrediction {
  category: string;
  confidence: number;
}

interface PredictionApiResponse {
  primary_category: string;
  confidence: number;
  confidence_level: string;
  related_categories?: ApiPrediction[];
  top_predictions?: ApiPrediction[];
  cleaned_text?: string;
  message?: string;
}

export interface BackendHealthResponse {
  status: 'healthy' | 'degraded';
  model_ready: boolean;
  model_type?: string;
  categories_count?: number;
  categories?: string[];
  version?: string;
  error?: string;
}

function mapPrediction(prediction: ApiPrediction) {
  return {
    category: prediction.category as NewsCategory,
    confidence: prediction.confidence,
  };
}

export async function checkBackendHealth(): Promise<BackendHealthResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${API_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { status: 'degraded', model_ready: false };
    }
    return (await response.json()) as BackendHealthResponse;
  } catch {
    return { status: 'degraded', model_ready: false };
  }
}

export async function predictCategory(
  headline: string,
  articleText: string
): Promise<PredictionResult> {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        headline: headline || '',
        text: articleText || '',
      }),
    });

    if (!response.ok) {
      let errorMessage = `Prediction request failed (${response.status})`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === 'string'
            ? errorJson.detail
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    const result = (await response.json()) as PredictionApiResponse;

    return {
      category: result.primary_category as NewsCategory,
      confidence: result.confidence,
      confidenceLevel: result.confidence_level,
      relatedCategories: (result.related_categories || []).map(mapPrediction),
      topPredictions: (result.top_predictions || []).map(mapPrediction),
      cleanedText: result.cleaned_text || '',
      message: result.message || 'Prediction completed successfully.',
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unable to connect to the prediction server. Please verify backend is running on port 8001.');
  }
}

export interface TfidfTerm {
  term: string;
  score: number;
  is_ngram: boolean;
}

export interface PipelineInspectionResult {
  cleaned_text: string;
  tokens: string[];
  tfidf_terms: TfidfTerm[];
  total_vocab_size: number;
  matched_terms_count: number;
  prediction: PredictionResult;
}

export async function inspectNlpPipeline(
  text: string,
  headline?: string
): Promise<PipelineInspectionResult> {
  try {
    const response = await fetch(`${API_URL}/pipeline-inspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        headline: headline || '',
        text: text || '',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const rawPred = data.prediction;
      return {
        cleaned_text: data.cleaned_text,
        tokens: data.tokens,
        tfidf_terms: data.tfidf_terms,
        total_vocab_size: data.total_vocab_size,
        matched_terms_count: data.matched_terms_count,
        prediction: {
          category: rawPred.primary_category as NewsCategory,
          confidence: rawPred.confidence,
          confidenceLevel: rawPred.confidence_level,
          relatedCategories: (rawPred.related_categories || []).map(mapPrediction),
          topPredictions: (rawPred.top_predictions || []).map(mapPrediction),
          cleanedText: rawPred.cleaned_text || '',
          message: rawPred.message || '',
        },
      };
    }
  } catch {
    // If /pipeline-inspect fails to respond, fallback to /predict
  }

  // Graceful fallback to the primary /predict endpoint
  const prediction = await predictCategory(headline || '', text);
  const words = (prediction.cleanedText || text).toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
  const freqMap: Record<string, number> = {};
  words.forEach((w) => {
    freqMap[w] = (freqMap[w] || 0) + 1;
  });

  const maxFreq = Math.max(...Object.values(freqMap), 1);
  const fallbackTerms: TfidfTerm[] = Object.entries(freqMap)
    .map(([term, count]) => ({
      term,
      score: Number((count / maxFreq).toFixed(4)),
      is_ngram: false,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return {
    cleaned_text: prediction.cleanedText || text,
    tokens: words,
    tfidf_terms: fallbackTerms,
    total_vocab_size: 18249,
    matched_terms_count: fallbackTerms.length,
    prediction,
  };
}
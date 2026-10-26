import { ModelMetric } from '../types/news';

// Fallback baseline data mirroring backend/models/performance.json
export const MODEL_PERFORMANCE_DATA: ModelMetric[] = [
  {
    model: 'Logistic Regression',
    accuracy: 99.67,
    precision: 99.70,
    recall: 99.68,
    f1Score: 99.68,
    isBest: true
  }
];

export interface DetailedModelReport {
  name: string;
  hyperparameters: Record<string, string>;
  trainingSamples: number;
  testingSamples: number;
  vocabularySize: number;
  trainingTimeSec: number;
}

export const DETAILED_MODEL_CONFIGS: Record<string, DetailedModelReport> = {
  'Logistic Regression': {
    name: 'Scikit-learn LogisticRegression (TF-IDF)',
    hyperparameters: {
      'C': '2.0',
      'Solver': 'lbfgs',
      'Max iterations': '2,000',
      'Class weight': 'balanced',
      'N-gram range': '(1, 2)',
      'Sublinear TF': 'true'
    },
    trainingSamples: 7344,
    testingSamples: 1536,
    vocabularySize: 18249,
    trainingTimeSec: 1.31
  }
};

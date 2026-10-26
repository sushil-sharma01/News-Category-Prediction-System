import { API_URL } from './predictionApi';

export interface ClassificationMetrics {
  precision?: number;
  recall?: number;
  'f1-score'?: number;
}

export interface DashboardPerformance {
  accuracy?: number;
  cv_accuracy_mean?: number;
  cv_accuracy_std?: number;
  training_samples?: number;
  testing_samples?: number;
  total_samples?: number;
  categories?: string[];
  vocabulary_size?: number;
  training_time_seconds?: number;
  avg_article_words?: number;
  median_article_words?: number;
  near_duplicate_test_pct?: number;
  duplicates_removed?: number;
  unsupported_rows_removed?: number;
  classification_report?: Record<string, ClassificationMetrics>;
}

export interface DashboardStatistics {
  categories: string[];
  category_count: number;
  total_samples: number;
  supported_samples: number;
  category_counts: Record<string, number>;
}

export interface DashboardData {
  performance: DashboardPerformance;
  statistics: DashboardStatistics;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Dashboard data request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [performance, statistics] = await Promise.all([
    fetchJson<DashboardPerformance>('/model-performance'),
    fetchJson<DashboardStatistics>('/statistics'),
  ]);

  return { performance, statistics };
}
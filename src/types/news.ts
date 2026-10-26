export type NewsCategory = 
  | 'Technology' 
  | 'World' 
  | 'Business' 
  | 'Politics' 
  | 'Sports' 
  | 'Health' 
  | 'Science' 
  | 'Entertainment' 
  | 'Crime'
  | 'Climate'
  | 'Education' 
  | 'Environment';

export interface CategoryInfo {
  name: NewsCategory;
  count: number;
  percentage: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  keywords: string[];
}

export interface PredictionResult {
  category: NewsCategory;
  confidence: number;
  confidenceLevel: string;
  relatedCategories: {
    category: NewsCategory;
    confidence: number;
  }[];
  topPredictions: {
    category: NewsCategory;
    confidence: number;
  }[];
  cleanedText: string;
  message: string;
}

export interface TrendingArticle {
  id: string;
  category: NewsCategory;
  headline: string;
  article: string;
  timestamp: string;
  imageUrl: string;
}

export interface ModelMetric {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  isBest?: boolean;
}

export type NavTab = 
  | 'Dashboard' 
  | 'Predict News' 
  | 'NLP Pipeline' 
  | 'Model Performance' 
  | 'Dataset Statistics' 
  | 'Categories';

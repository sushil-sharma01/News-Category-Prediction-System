import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { MetricCards } from '../components/MetricCards';
import { NewsPredictionCard } from '../components/NewsPredictionCard';
import { TrendingNews } from '../components/TrendingNews';
import { NLPPipeline } from '../components/NLPPipeline';
import { CategoryDistribution } from '../components/CategoryDistribution';
import { CategoryShare } from '../components/CategoryShare';
import { ModelPerformance } from '../components/ModelPerformance';
import { BottomSection } from '../components/BottomSection';
import { CategoryTrainingTable } from '../components/CategoryTrainingTable';
import { getCategoryDistribution } from '../data/categoriesData';
import { DashboardData, fetchDashboardData } from '../utils/dashboardApi';
import { TrendingArticle } from '../types/news';

interface DashboardViewProps {
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToTab }) => {
  const [selectedArticle, setSelectedArticle] = useState<{ headline: string; article: string } | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState(false);

  useEffect(() => {
    let active = true;

    fetchDashboardData()
      .then((data) => {
        if (active) setDashboardData(data);
      })
      .catch(() => {
        if (active) setDashboardError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const totalSamples = dashboardData?.statistics.total_samples ?? 0;
  const chartCategories = getCategoryDistribution(
    dashboardData?.statistics.category_counts,
    totalSamples
  );

  const handleSelectTrending = (article: TrendingArticle) => {
    setSelectedArticle({
      headline: article.headline,
      article: article.article
    });
    // Smooth scroll to prediction card
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <DashboardHeader />
      {dashboardError && (
        <p className="text-xs text-rose-600" role="status">
          Live dashboard metrics are unavailable. Check that the backend is running.
        </p>
      )}

      {/* Row 1 — Key Metrics */}
      <MetricCards data={dashboardData} />

      {/* Row 2 — Primary Features (News Prediction & Trending News) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (Main / Larger Card) — News Prediction (~60% width) */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
          <NewsPredictionCard
            initialHeadline={selectedArticle?.headline}
            initialArticle={selectedArticle?.article}
          />
        </div>

        {/* Right — Trending News (~40% width) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
          <TrendingNews
            onSelectArticle={handleSelectTrending}
            onViewAll={() => onNavigateToTab('Predict News')}
          />
        </div>
      </div>

      {/* Row 3 — NLP Pipeline */}
      <NLPPipeline onExplore={() => onNavigateToTab('NLP Pipeline')} />

      {/* Row 4 — Analytics (Category Distribution & Category Share) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <CategoryDistribution
          categories={chartCategories}
          totalArticles={totalSamples}
        />
        <CategoryShare
          categories={chartCategories}
          totalArticles={totalSamples}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between gap-3 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Training Samples by Category</h2>
            <p className="text-xs text-slate-500">Live class counts from the active model after duplicate removal.</p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {dashboardData?.statistics.total_samples.toLocaleString() ?? '—'} samples
          </span>
        </div>
        <CategoryTrainingTable
          categories={chartCategories}
          totalSamples={totalSamples}
        />
      </div>

      {/* Row 5 — Model Performance */}
      <ModelPerformance
        performance={dashboardData?.performance ?? null}
        onSelectModel={() => onNavigateToTab('Model Performance')}
      />

      {/* BottomSection */}
      <BottomSection data={dashboardData} />
    </div>
  );
};

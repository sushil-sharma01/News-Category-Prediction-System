import React from 'react';
import { Newspaper, Tag, Target, Cpu } from 'lucide-react';
import { SELECTED_MODEL } from '../data/categoriesData';
import { DashboardData } from '../utils/dashboardApi';

interface MetricCardsProps {
  data: DashboardData | null;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ data }) => {
  const performance = data?.performance;
  const statistics = data?.statistics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Total Articles */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
          <Newspaper className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">Total Articles</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
            {statistics?.total_samples?.toLocaleString() ?? '—'}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-0.5">
            <span>
              {performance?.duplicates_removed != null
                ? `${performance.duplicates_removed.toLocaleString()} duplicate rows removed`
                : 'Active training samples'}
            </span>
          </div>
        </div>
      </div>

      {/* Metric 2: Categories */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
          <Tag className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">Categories</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
            {statistics?.category_count ?? '—'}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-0.5">
            <span>{performance?.categories?.length ?? '—'} categories in active model</span>
          </div>
        </div>
      </div>

      {/* Metric 3: Accuracy */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
          <Target className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">Accuracy</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
            {performance?.accuracy != null ? `${performance.accuracy.toFixed(2)}%` : '—'}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-0.5">
            <span>
              {performance?.categories?.length ? `${performance.categories.length}-category evaluation · ` : ''}
              CV {performance?.cv_accuracy_mean != null ? `${performance.cv_accuracy_mean.toFixed(2)}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Metric 4: Selected Model */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0">
          <Cpu className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">Selected Model</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight truncate">
            {SELECTED_MODEL}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-0.5">
            <span>{performance?.vocabulary_size?.toLocaleString() ?? '—'} TF-IDF terms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

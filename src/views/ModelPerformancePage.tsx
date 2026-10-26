import React, { useEffect, useState } from 'react';
import { Award, Shield, Sliders, TrendingUp } from 'lucide-react';
import { CategoryTrainingTable } from '../components/CategoryTrainingTable';
import { getCategoryDistribution, SELECTED_MODEL } from '../data/categoriesData';
import { DashboardData, fetchDashboardData } from '../utils/dashboardApi';

export const ModelPerformanceView: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchDashboardData()
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const performance = data?.performance;
  const macroMetrics = performance?.classification_report?.['macro avg'];
  const formatMetric = (value: number | undefined) => value == null ? '—' : `${(value * 100).toFixed(2)}%`;
  const categories = getCategoryDistribution(
    data?.statistics.category_counts,
    data?.statistics.total_samples ?? 0
  );

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Model Performance &amp; Benchmark Analysis</h1>
        <p className="text-sm text-slate-500">
          {performance
            ? `Saved evaluation: ${performance.testing_samples?.toLocaleString() ?? '—'} held-out rows across ${performance.categories?.length ?? '—'} trained categories.`
            : 'Live evaluation metrics for the active classification model.'}
        </p>
      </div>
      {error && <p className="text-xs text-rose-600" role="status">Live model metrics are unavailable. Check that the backend is running.</p>}

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" /> Evaluation Metrics
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead><tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <th className="py-3 px-4">Model</th><th className="py-3 px-4 text-right">Accuracy</th><th className="py-3 px-4 text-right">Precision</th><th className="py-3 px-4 text-right">Recall</th><th className="py-3 px-4 text-right">F1 Score</th>
            </tr></thead>
            <tbody className="font-mono tabular-nums"><tr className="bg-blue-50/70 font-semibold">
              <td className="py-3.5 px-4 font-sans font-medium flex items-center gap-2">
                {SELECTED_MODEL}<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800"><Award className="w-3 h-3" />Active</span>
              </td>
              <td className="py-3.5 px-4 text-right text-blue-700">{performance?.accuracy != null ? `${performance.accuracy.toFixed(2)}%` : '—'}</td>
              <td className="py-3.5 px-4 text-right">{formatMetric(macroMetrics?.precision)}</td>
              <td className="py-3.5 px-4 text-right">{formatMetric(macroMetrics?.recall)}</td>
              <td className="py-3.5 px-4 text-right text-blue-700">{formatMetric(macroMetrics?.['f1-score'])}</td>
            </tr></tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Sliders className="w-4 h-4 text-blue-600" />Model Configuration</h3>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 font-mono text-xs space-y-2">
            <p className="text-slate-500 font-sans font-semibold">LogisticRegression + TF-IDF</p>
            <p>C: 2.0</p><p>Max iterations: 2,000</p><p>N-gram range: 1-2</p><p>Class weighting: balanced</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-600" />Training Report</h3>
          <div className="space-y-3 text-xs">
            <p>Training samples: <strong>{performance?.training_samples?.toLocaleString() ?? '—'}</strong></p>
            <p>Test samples: <strong>{performance?.testing_samples?.toLocaleString() ?? '—'}</strong></p>
            <p>Vocabulary size: <strong>{performance?.vocabulary_size?.toLocaleString() ?? '—'}</strong></p>
            <p>Training time: <strong>{performance?.training_time_seconds != null ? `${performance.training_time_seconds} s` : '—'}</strong></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">Saved Articles by Category</h2>
        <p className="text-xs text-slate-500 mb-4">Live category counts from the active training corpus after duplicate removal.</p>
        <CategoryTrainingTable categories={categories} totalSamples={data?.statistics.total_samples ?? 0} />
      </div>
    </div>
  );
};
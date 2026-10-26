import React, { useEffect, useState } from 'react';
import { Database } from 'lucide-react';
import { getCategoryDistribution } from '../data/categoriesData';
import { DashboardData, fetchDashboardData } from '../utils/dashboardApi';

export const DatasetStatsView: React.FC = () => {
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

  const statistics = data?.statistics;
  const performance = data?.performance;
  const total = statistics?.total_samples ?? 0;
  const categories = getCategoryDistribution(statistics?.category_counts, total);
  const maxPercentage = Math.max(...categories.map((category) => category.percentage), 0);

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dataset Statistics & Corpus Composition
        </h1>
        <p className="text-sm text-slate-500">
          Training corpus counts from the active model after duplicate removal.
        </p>
      </div>
      {error && (
        <p className="text-xs text-rose-600" role="status">
          Live model metrics and category counts are unavailable. Check that the backend is running.
        </p>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Corpus Documents</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{statistics?.total_samples.toLocaleString() ?? '—'}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active training samples</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Unique Vocabulary Terms</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{performance?.vocabulary_size?.toLocaleString() ?? '—'}</p>
          <p className="text-[11px] text-slate-500 mt-1">Terms selected by TF-IDF</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Avg Article Length</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{performance?.avg_article_words != null ? `${performance.avg_article_words} words` : '—'}</p>
          <p className="text-[11px] text-slate-500 mt-1">Median: {performance?.median_article_words != null ? `${performance.median_article_words} words` : '—'}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Target Classes</p>
          <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{statistics?.category_count ?? '—'} Classes</p>
          <p className="text-[11px] text-slate-500 mt-1">{statistics?.category_count ?? '—'} categories in active model</p>
        </div>
      </div>

      {/* Class Distribution Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <span>Category Distribution Breakdown</span>
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Article Count</th>
                <th className="py-3 px-4 text-right">Corpus Share</th>
                <th className="py-3 px-4">Relative Visual Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {categories.map((cat) => (
                <tr key={cat.name} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-sans font-medium flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className="text-slate-800">{cat.name}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">{cat.count.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{cat.percentage.toFixed(1)}%</td>
                  <td className="py-3 px-4">
                    <div className="w-full max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${maxPercentage > 0 ? (cat.percentage / maxPercentage) * 100 : 0}%`,
                          backgroundColor: cat.color,
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td className="py-6 px-4 text-center text-slate-400" colSpan={4}>
                    No saved article counts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

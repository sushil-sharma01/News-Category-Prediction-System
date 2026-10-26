import React from 'react';
import { TrendingUp, Award } from 'lucide-react';
import { SELECTED_MODEL } from '../data/categoriesData';
import { DashboardPerformance } from '../utils/dashboardApi';

interface ModelPerformanceProps {
  onSelectModel?: (modelName: string) => void;
  performance: DashboardPerformance | null;
}

export const ModelPerformance: React.FC<ModelPerformanceProps> = ({ onSelectModel, performance }) => {
  const macroMetrics = performance?.classification_report?.['macro avg'];
  const formatMetric = (value: number | undefined) => value == null ? '—' : `${(value * 100).toFixed(2)}%`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-5">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Model Performance
            </h2>
            <p className="text-xs text-slate-500">
              Saved backend evaluation metrics for the active model.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-400 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg self-start sm:self-center">
          Test Set: {performance?.testing_samples?.toLocaleString() ?? '—'} Articles
          {performance?.categories?.length ? ` · ${performance.categories.length}-category evaluation` : ''}
        </span>
      </div>

      {/* Metrics Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/70">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200/70">
              <th className="py-3 px-4">Model</th>
              <th className="py-3 px-4 text-right">Accuracy</th>
              <th className="py-3 px-4 text-right">Precision</th>
              <th className="py-3 px-4 text-right">Recall</th>
              <th className="py-3 px-4 text-right">F1 Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
            {[{ model: SELECTED_MODEL, isBest: true }].map((item) => {
              const isBest = item.isBest;
              return (
                <tr
                  key={item.model}
                  onClick={() => onSelectModel && onSelectModel(item.model)}
                  className={`transition-colors cursor-pointer ${
                    isBest
                      ? 'bg-blue-50/40 hover:bg-blue-50/70 font-semibold text-slate-900'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <td className="py-3.5 px-4 font-sans font-medium flex items-center gap-2">
                    <span>{item.model}</span>
                    {isBest && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100/80 text-emerald-800">
                        <Award className="w-3 h-3" />
                        Selected
                      </span>
                    )}
                  </td>
                  <td className={`py-3.5 px-4 text-right ${isBest ? 'text-blue-700 font-bold' : ''}`}>
                    {performance?.accuracy != null ? `${performance.accuracy.toFixed(2)}%` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">{formatMetric(macroMetrics?.precision)}</td>
                  <td className="py-3.5 px-4 text-right">{formatMetric(macroMetrics?.recall)}</td>
                  <td className={`py-3.5 px-4 text-right ${isBest ? 'text-blue-700 font-bold' : ''}`}>
                    {formatMetric(macroMetrics?.['f1-score'])}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

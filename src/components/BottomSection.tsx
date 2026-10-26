import React from 'react';
import { Database, ShieldCheck, Zap, Activity } from 'lucide-react';
import { DashboardData } from '../utils/dashboardApi';

interface BottomSectionProps {
  data: DashboardData | null;
}

export const BottomSection: React.FC<BottomSectionProps> = ({ data }) => {
  const performance = data?.performance;

  return (
    <div className="pt-2 pb-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Item 1 */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Production Engine</p>
              <p className="text-[11px] text-slate-500">Logistic Regression + TF-IDF ({performance?.vocabulary_size?.toLocaleString() ?? '—'} terms)</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center gap-3 px-2 py-1 pt-3 md:pt-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Corpus Integrity</p>
              <p className="text-[11px] text-slate-500">
                {data?.statistics.total_samples.toLocaleString() ?? '—'} training samples ({data?.statistics.category_count ?? '—'} categories)
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center gap-3 px-2 py-1 pt-3 md:pt-1">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Validation Protocol</p>
              <p className="text-[11px] text-slate-500">5-fold CV: {performance?.cv_accuracy_mean != null ? `${performance.cv_accuracy_mean.toFixed(2)}%` : '—'}</p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex items-center gap-3 px-2 py-1 pt-3 md:pt-1">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Inference Latency</p>
              <p className="text-[11px] text-slate-500">{performance?.near_duplicate_test_pct != null ? `${performance.near_duplicate_test_pct.toFixed(1)}% near-duplicate test rows` : 'Near-duplicate data unavailable'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

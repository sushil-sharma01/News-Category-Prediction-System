import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { CATEGORIES_DATA, getCategoryDistribution } from '../data/categoriesData';
import { DashboardData, fetchDashboardData } from '../utils/dashboardApi';

export const CategoriesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
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

  const categories = getCategoryDistribution(
    data?.statistics.category_counts,
    data?.statistics.total_samples ?? 0
  ).map((category) => ({
    ...category,
    isTrained: data?.statistics.categories.includes(category.name) ?? false,
  }));

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.keywords.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            News Classification Taxonomy
          </h1>
          <p className="text-sm text-slate-500">
            {data
              ? `${data.statistics.category_count} categories and ${data.statistics.total_samples.toLocaleString()} active training samples.`
              : `Explore ${CATEGORIES_DATA.length} news classification categories.`}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category or keyword..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>
      {error && (
        <p className="text-xs text-rose-600" role="status">
          Live category data is unavailable. Check that the backend is running.
        </p>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((cat) => (
          <div
            key={cat.name}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cat.badgeBg}`}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  {cat.name}
                </span>
                <div className="flex flex-col items-end gap-0.5 text-right">
                  <span className="text-[10px] font-semibold text-slate-500">
                    {cat.percentage.toFixed(1)}% ({cat.count.toLocaleString()} training samples)
                  </span>
                  <span className={`text-[10px] font-medium ${cat.isTrained ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {data
                      ? cat.isTrained
                        ? 'In active model'
                        : 'Not in active model'
                      : 'Model status unavailable'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {cat.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Key Discriminative Vocabulary
              </p>
              <div className="flex flex-wrap gap-1">
                {cat.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-mono"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-slate-400">
            No categories match this search.
          </p>
        )}
      </div>
    </div>
  );
};

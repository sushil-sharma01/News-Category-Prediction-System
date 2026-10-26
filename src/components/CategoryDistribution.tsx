import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { CategoryInfo } from '../types/news';

interface CategoryDistributionProps {
  categories: CategoryInfo[];
  totalArticles: number;
}

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({ categories, totalArticles }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const displayCategories = categories.slice(0, 5);
  const maxPercentage = Math.max(10, Math.ceil(Math.max(...displayCategories.map((category) => category.percentage), 0) / 10) * 10);
  const axisValues = [4, 3, 2, 1, 0].map((step) => Math.round(maxPercentage * step / 4));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Category Distribution
            </h2>
          </div>
          {hoveredCategory && (
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full animate-in fade-in">
              {hoveredCategory}
            </span>
          )}
        </div>

        {/* Chart Canvas */}
        <div className="relative pt-6 pb-2">
          {/* Y Axis Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] font-mono tabular-nums text-slate-300">
            {axisValues.map((val) => (
              <div key={val} className="flex items-center gap-2 w-full">
                <span className="w-5 text-right text-slate-400">{val}</span>
                <div className="flex-1 border-b border-slate-100"></div>
              </div>
            ))}
          </div>

          {/* Bars Grid */}
          <div className="relative h-48 ml-8 flex items-end justify-around gap-2 pt-4">
            {displayCategories.map((cat) => {
              const heightPercent = (cat.percentage / maxPercentage) * 100;
              const isHovered = hoveredCategory === cat.name;

              return (
                <div
                  key={cat.name}
                  onMouseEnter={() => setHoveredCategory(`${cat.name}: ${cat.count.toLocaleString()} articles (${cat.percentage}%)`)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Percentage on top */}
                  <span className={`text-xs font-bold font-mono tabular-nums transition-all mb-1 ${
                    isHovered ? 'text-slate-900 scale-110' : 'text-slate-600'
                  }`}>
                    {cat.percentage}%
                  </span>

                  {/* Colored Bar */}
                  <div className="w-full max-w-[54px] rounded-t-lg transition-all duration-300 relative overflow-hidden"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: cat.color,
                      opacity: isHovered ? 1 : 0.88,
                      transform: isHovered ? 'scaleY(1.02)' : 'none',
                      transformOrigin: 'bottom'
                    }}
                  >
                    {/* Subtle internal gradient shine */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/20"></div>
                  </div>

                  {/* Label */}
                  <span className={`text-xs mt-3 truncate font-medium transition-colors ${
                    isHovered ? 'text-slate-900 font-bold' : 'text-slate-600'
                  }`}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Sample: {totalArticles.toLocaleString()} supported articles</span>
        <span className="font-mono">Top 5 classes shown</span>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { CategoryInfo } from '../types/news';

interface CategoryShareProps {
  categories: CategoryInfo[];
  totalArticles: number;
}

export const CategoryShare: React.FC<CategoryShareProps> = ({ categories, totalArticles }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const topCategories = categories.slice(0, 5);

  // SVG Donut calculation
  const radius = 64;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative offsets
  let accumulatedPercent = 0;
  const segments = topCategories.map((cat) => {
    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += cat.percentage;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });
  const topFiveShare = topCategories.reduce((total, category) => total + category.percentage, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Category Share
            </h2>
          </div>
          {hoveredCategory && (
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full animate-in fade-in">
              {hoveredCategory}
            </span>
          )}
        </div>

        {/* Donut and Legend Layout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          {/* Donut Chart SVG */}
          <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />
              {/* Slices */}
              {segments.map((segment) => {
                const isHovered = hoveredCategory === segment.name;
                return (
                  <circle
                    key={segment.name}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={segment.strokeDasharray}
                    strokeDashoffset={segment.strokeDashoffset}
                    className="cursor-pointer transition-all duration-300"
                    style={{
                      opacity: hoveredCategory && !isHovered ? 0.6 : 1,
                    }}
                    onMouseEnter={() => setHoveredCategory(segment.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                );
              })}
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-lg font-bold font-mono text-slate-900 tracking-tight">
                {totalArticles.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Supported Articles
              </span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="flex-1 w-full space-y-2.5">
            {topCategories.map((cat) => {
              const isHovered = hoveredCategory === cat.name;
              return (
                <div
                  key={cat.name}
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between p-1.5 px-2 rounded-lg cursor-pointer transition-colors text-xs ${
                    isHovered ? 'bg-slate-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <span className={`font-medium ${isHovered ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-slate-800 font-bold">
                    {cat.percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Supported category distribution</span>
        <span className="font-mono">{topFiveShare.toFixed(1)}% top five</span>
      </div>
    </div>
  );
};

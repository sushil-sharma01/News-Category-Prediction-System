import React from 'react';
import { Flame, ArrowRight } from 'lucide-react';
import { TRENDING_NEWS } from '../data/trendingNewsData';
import { TrendingArticle } from '../types/news';
import { getCategoryBadgeStyle } from '../data/categoriesData';

interface TrendingNewsProps {
  onSelectArticle?: (article: TrendingArticle) => void;
  onViewAll?: () => void;
}

export const TrendingNews: React.FC<TrendingNewsProps> = ({ onSelectArticle, onViewAll }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Trending News
            </h2>
          </div>
          <button
            onClick={onViewAll}
            type="button"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All
          </button>
        </div>

        {/* List of Trending Items */}
        <div className="space-y-3">
          {TRENDING_NEWS.map((item) => {
            const badgeStyle = getCategoryBadgeStyle(item.category);
            return (
              <div
                key={item.id}
                onClick={() => onSelectArticle && onSelectArticle(item)}
                className="group p-2 rounded-xl hover:bg-slate-50/90 border border-transparent hover:border-slate-200/60 cursor-pointer transition-all flex items-center gap-3.5"
                title="Click to test in prediction pipeline"
              >
                {/* Thumbnail Image */}
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200/60 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.headline}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback gradient if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeStyle.bg}`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1 mt-0.5">
                    {item.headline}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {item.article}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.timestamp}
                  </p>
                </div>

                {/* Arrow Action */}
                <div className="shrink-0 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Curated from global wire feeds</span>
        <span className="font-mono">Updated 10m ago</span>
      </div>
    </div>
  );
};

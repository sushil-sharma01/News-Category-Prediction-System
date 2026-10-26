import React from 'react';
import { CategoryInfo } from '../types/news';

interface CategoryTrainingTableProps {
  categories: CategoryInfo[];
  totalSamples: number;
}

export const CategoryTrainingTable: React.FC<CategoryTrainingTableProps> = ({ categories, totalSamples }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/70">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/70">
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4 text-right">Training Samples</th>
            <th className="py-3 px-4 text-right">Training Share</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
          {categories.map((category) => (
            <tr key={category.name} className="hover:bg-slate-50">
              <td className="py-3 px-4 font-sans font-medium flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                <span>{category.name}</span>
              </td>
              <td className="py-3 px-4 text-right font-semibold">
                {category.count.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-right text-slate-600">
                {category.percentage.toFixed(1)}%
              </td>
            </tr>
          ))}
          <tr className="bg-slate-50 font-semibold">
            <td className="py-3 px-4 font-sans">Total training samples</td>
            <td className="py-3 px-4 text-right">{totalSamples.toLocaleString()}</td>
            <td className="py-3 px-4 text-right">100.0%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

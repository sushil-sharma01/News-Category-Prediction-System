import React from 'react';

export const DashboardHeader: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
          News Classification Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Analyze, classify and explore the latest news using NLP and Machine Learning.
        </p>
      </div>

      {/* Real NLP Pipeline Badge */}
      <div className="flex items-center self-start sm:self-center">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Real NLP Pipeline
        </span>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { PredictNewsView } from './views/PredictNewsView';
import { NLPPipelineView } from './views/NLPPipelineView';
import { ModelPerformanceView } from './views/ModelPerformancePage';
import { DatasetStatsView } from './views/DatasetStatsView';
import { CategoriesView } from './views/CategoriesView';
import { NavTab } from './types/news';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row antialiased text-slate-800">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0B132B] text-white sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">
            NC
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">News Classifier</h1>
            <p className="text-[10px] text-slate-400">NLP Analysis</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative z-10 w-72 h-full">
            <Sidebar currentTab={currentTab} onTabChange={handleTabChange} />
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block sticky top-0 h-screen">
        <Sidebar currentTab={currentTab} onTabChange={handleTabChange} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {currentTab === 'Dashboard' && <DashboardView onNavigateToTab={handleTabChange} />}
        {currentTab === 'Predict News' && <PredictNewsView />}
        {currentTab === 'NLP Pipeline' && <NLPPipelineView />}
        {currentTab === 'Model Performance' && <ModelPerformanceView />}
        {currentTab === 'Dataset Statistics' && <DatasetStatsView />}
        {currentTab === 'Categories' && <CategoriesView />}
      </main>
    </div>
  );
}

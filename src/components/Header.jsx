import React from 'react';
import { Swords, RefreshCw, Search, BookOpen, LayoutDashboard } from 'lucide-react';

export default function Header({ 
  patch, 
  onRefresh, 
  isRefreshing, 
  isCompareMode, 
  setIsCompareMode,
  onOpenSearch,
  activeTab = 'calculator',
  setActiveTab
}) {
  return (
    <header className="border-b border-[#16181f] bg-[#07080b]/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        
        {/* Brand & Tabs */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setActiveTab('calculator')}
            className="flex items-center cursor-pointer"
          >
            <span className="font-bold tracking-tight text-white text-xs sm:text-sm">
              lol<span className="text-[#4a82e8]">cooldowns</span>
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-[#0d0f15] p-0.5 rounded-lg border border-[#1a1e28]">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                activeTab === 'calculator'
                  ? 'bg-[#181d29] text-white shadow-xs'
                  : 'text-[#6e7a8e] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3 h-3" />
              <span>Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('explanation')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                activeTab === 'explanation'
                  ? 'bg-[#4a82e8] text-white shadow-xs'
                  : 'text-[#6e7a8e] hover:text-white'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Explanation</span>
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          
          {/* Quick Search Shortcut */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-[#0e1017] border border-[#1d202a] text-[11px] text-[#8a94a6] hover:text-white transition"
            title="Search champion (Shortcut: /)"
          >
            <Search className="w-3 h-3 text-[#5e6678]" />
            <span>Search</span>
            <kbd className="text-[9px] bg-[#161922] border border-[#242938] px-1 py-0.2 rounded tabular-nums text-[#6c768a]">
              /
            </kbd>
          </button>

          {/* Patch Badge */}
          <button 
            onClick={onRefresh}
            title="Refresh latest patch from Riot CDN"
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#0e1017] border border-[#1d202a] text-[11px] tabular-nums text-[#7e899e] hover:text-white transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4a82e8]"></span>
            <span>{patch || '...'}</span>
            <RefreshCw className={`w-2.5 h-2.5 text-[#525a6c] ${isRefreshing ? 'animate-spin text-[#4a82e8]' : ''}`} />
          </button>

          {/* Mode Switcher */}
          {activeTab === 'calculator' && (
            <button
              onClick={() => setIsCompareMode(!isCompareMode)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition ${
                isCompareMode
                  ? 'bg-[#c8aa6e]/15 text-[#f0e6d2] border-[#c8aa6e]/40 shadow-xs'
                  : 'bg-[#0e1017] text-[#8a94a6] border-[#1d202a] hover:text-white'
              }`}
            >
              <Swords className={`w-3 h-3 ${isCompareMode ? 'text-[#c8aa6e]' : 'text-[#636c80]'}`} />
              <span>{isCompareMode ? '1v1 Active' : 'Versus'}</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}

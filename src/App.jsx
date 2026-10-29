import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Header from './components/Header';
import ChampionBanner from './components/ChampionBanner';
import HasteControls from './components/HasteControls';
import SpellCard from './components/SpellCard';
import PassiveCard from './components/PassiveCard';
import MatchupCompare from './components/MatchupCompare';
import ChampionSearchModal from './components/ChampionSearchModal';
import Footer from './components/Footer';
import { 
  getLatestPatch, 
  getChampionList, 
  getChampionDetails 
} from './services/riotApi';
import { Loader2, AlertCircle, RefreshCw, LayoutGrid, Rows } from 'lucide-react';

// Vercel Best Practice: bundle-dynamic-imports
// Lazy-load the heavy secondary Explanation tab to reduce initial bundle size
const ExplanationPage = lazy(() => import('./components/ExplanationPage'));

export default function App() {
  const [patch, setPatch] = useState('');
  const [champions, setChampions] = useState([]);
  const [selectedChampId, setSelectedChampId] = useState('Aatrox');
  const [championData, setChampionData] = useState(null);
  
  // Navigation: 'calculator' | 'explanation'
  const [activeTab, setActiveTab] = useState('calculator');

  // Spells layout view: 'list' | 'grid'
  const [spellsLayout, setSpellsLayout] = useState('list');

  // Haste state
  const [abilityHaste, setAbilityHaste] = useState(0);
  const [ultHaste, setUltHaste] = useState(0);

  // Matchup Mode state
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [champBId, setChampBId] = useState('Zed');
  const [champBData, setChampBData] = useState(null);
  const [hasteB, setHasteB] = useState(0);

  // Modals & UI status
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchBModalOpen, setSearchBModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Keyboard shortcut '/' to trigger search
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === '/' && !searchModalOpen && !searchBModalOpen) {
        const tagName = document.activeElement?.tagName;
        if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
          e.preventDefault();
          setSearchModalOpen(true);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, searchBModalOpen]);

  // Vercel Best Practice: async-parallel
  // Parallelize independent fetches with Promise.all() to eliminate waterfalls
  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      // 1. Fetch latest active patch
      const latestPatch = await getLatestPatch(forceRefresh);
      setPatch(latestPatch);

      // 2. Concurrently fetch champion list, primary details, and opponent details
      const [champList, primaryDetails, opponentDetails] = await Promise.all([
        getChampionList(latestPatch, forceRefresh),
        getChampionDetails(selectedChampId, latestPatch),
        getChampionDetails(champBId, latestPatch)
      ]);

      setChampions(champList);
      setChampionData(primaryDetails);
      setChampBData(opponentDetails);

    } catch (err) {
      console.error('Failed to load League data:', err);
      setError('Could not connect to Riot Games Data Dragon. Please check your network connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedChampId, champBId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Primary champion selection
  const handleSelectChampion = async (champId) => {
    setSelectedChampId(champId);
    try {
      const details = await getChampionDetails(champId, patch);
      setChampionData(details);
    } catch (err) {
      console.error(`Failed to load ${champId}:`, err);
    }
  };

  // Opponent champion selection
  const handleSelectChampB = async (champId) => {
    setChampBId(champId);
    try {
      const details = await getChampionDetails(champId, patch);
      setChampBData(details);
    } catch (err) {
      console.error(`Failed to load opponent ${champId}:`, err);
    }
  };

  const handleRefresh = () => {
    loadData(true);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#e2e8f0] flex flex-col font-sans selection:bg-[#4a82e8]/25 selection:text-[#4a82e8]">
      
      {/* Header with Navigation Tabs */}
      <Header 
        patch={patch}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        isCompareMode={isCompareMode}
        setIsCompareMode={setIsCompareMode}
        onOpenSearch={() => setSearchModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content strictly capped at max-width 1000px */}
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 sm:px-6 py-4">
        
        {/* Loading State - Vercel Best Practice: rendering-conditional-render */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-7 h-7 text-[#4a82e8] animate-spin mb-3" />
            <p className="text-xs font-semibold text-white">Loading Data Dragon...</p>
          </div>
        ) : null}

        {/* Error State */}
        {error && !isLoading ? (
          <div className="p-4 rounded-xl bg-[#0f090c] border border-[#3b1218] text-center max-w-md mx-auto my-8">
            <AlertCircle className="w-7 h-7 text-[#f43f5e] mx-auto mb-2" />
            <h3 className="text-xs font-bold text-white mb-1">Failed to Connect</h3>
            <p className="text-[11px] text-[#9aa2b1] mb-3">{error}</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#f43f5e] text-white text-xs font-bold hover:bg-[#e11d48] transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        ) : null}

        {/* Active View: Calculator vs Lazy-loaded Explanation */}
        {!isLoading && !error && championData ? (
          <>
            {activeTab === 'explanation' ? (
              <Suspense fallback={
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-7 h-7 text-[#4a82e8] animate-spin mb-3" />
                  <p className="text-xs text-[#6e7a8e]">Loading Architecture & Documentation...</p>
                </div>
              }>
                <ExplanationPage 
                  championData={championData}
                  patch={patch}
                  champions={champions}
                  onBackToCalculator={() => setActiveTab('calculator')}
                />
              </Suspense>
            ) : (
              /* Ultra-compact Dashboard (fits 1000px height / 1080p monitors) */
              <div className="space-y-2">
                
                {/* Compact Champion Banner */}
                <ChampionBanner 
                  champion={championData}
                  patch={patch}
                  onOpenSearch={() => setSearchModalOpen(true)}
                  onSelectQuickChamp={handleSelectChampion}
                />

                {/* Matchup Comparison (Versus 1v1) */}
                {isCompareMode ? (
                  <MatchupCompare 
                    champA={championData}
                    champB={champBData}
                    hasteA={abilityHaste}
                    hasteB={hasteB}
                    setHasteB={setHasteB}
                    patch={patch}
                    onOpenSearchB={() => setSearchBModalOpen(true)}
                    onClose={() => setIsCompareMode(false)}
                  />
                ) : null}

                {/* Compact Haste Controller */}
                <HasteControls 
                  haste={abilityHaste}
                  setHaste={setAbilityHaste}
                  ultHaste={ultHaste}
                  setUltHaste={setUltHaste}
                />

                {/* Slim Innate Passive Strip */}
                {championData.passive ? (
                  <PassiveCard 
                    passive={championData.passive} 
                    patch={patch} 
                  />
                ) : null}

                {/* Spells Header with Layout Toggle (List vs 2x2 Grid) */}
                <div className="flex items-center justify-between px-1 pt-1 pb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#525d72]">
                      Abilities Q, W, E, R
                    </span>
                    <span className="text-[10px] tabular-nums text-[#4a82e8] bg-[#4a82e8]/10 px-1.5 py-0.2 rounded border border-[#4a82e8]/25">
                      {abilityHaste} AH Active
                    </span>
                  </div>

                  {/* Grid vs List toggle */}
                  <div className="flex items-center gap-1 bg-[#0d0f15] p-0.5 rounded border border-[#1a1e28]">
                    <button
                      onClick={() => setSpellsLayout('list')}
                      className={`p-1 rounded text-[10px] transition ${
                        spellsLayout === 'list' ? 'bg-[#1e2433] text-white' : 'text-[#5f687a] hover:text-white'
                      }`}
                      title="Single column list view"
                    >
                      <Rows className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setSpellsLayout('grid')}
                      className={`p-1 rounded text-[10px] transition ${
                        spellsLayout === 'grid' ? 'bg-[#1e2433] text-white' : 'text-[#5f687a] hover:text-white'
                      }`}
                      title="2x2 Compact Grid view"
                    >
                      <LayoutGrid className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Compact Spells */}
                <div className={spellsLayout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-2" : "space-y-2"}>
                  {championData.spells?.map((spell, index) => (
                    <SpellCard 
                      key={spell.id || index}
                      spell={spell}
                      index={index}
                      patch={patch}
                      abilityHaste={abilityHaste}
                      ultHaste={ultHaste}
                    />
                  ))}
                </div>

              </div>
            )}
          </>
        ) : null}

      </main>

      {/* Footer */}
      <Footer patch={patch} />

      {/* Primary Champion Search Modal */}
      <ChampionSearchModal 
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        champions={champions}
        onSelectChampion={handleSelectChampion}
        currentChampionId={selectedChampId}
        patch={patch}
        title="Select Champion"
      />

      {/* Opponent Champion Search Modal */}
      <ChampionSearchModal 
        isOpen={searchBModalOpen}
        onClose={() => setSearchBModalOpen(false)}
        champions={champions}
        onSelectChampion={handleSelectChampB}
        currentChampionId={champBId}
        patch={patch}
        title="Select Opponent Champion"
      />

    </div>
  );
}

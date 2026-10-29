import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import { Search, X, Users, CornerDownLeft } from 'lucide-react';
import { getChampionIconUrl } from '../services/riotApi';

const ROLES = ['All', 'Assassin', 'Fighter', 'Mage', 'Marksman', 'Support', 'Tank'];

export default function ChampionSearchModal({ 
  isOpen, 
  onClose, 
  champions, 
  onSelectChampion, 
  currentChampionId,
  patch,
  title = "Select Champion"
}) {
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Vercel Best Practice: rerender-use-deferred-value
  // Keep text input responsive at 60fps during quick typing across 173 champions
  const deferredQuery = useDeferredValue(query);

  const inputRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setFocusedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  // Optimized memoized search filter using deferred query
  const filtered = useMemo(() => {
    if (!champions || champions.length === 0) return [];
    const q = deferredQuery.trim().toLowerCase();
    return champions.filter(champ => {
      const matchesQuery = !q || champ.name.toLowerCase().includes(q) || champ.id.toLowerCase().includes(q);
      const matchesRole = selectedRole === 'All' || (champ.tags && champ.tags.includes(selectedRole));
      return matchesQuery && matchesRole;
    });
  }, [champions, deferredQuery, selectedRole]);

  // Reset focused item to 0 on search query or role change
  useEffect(() => {
    setFocusedIndex(0);
  }, [query, selectedRole]);

  // Auto-scroll the focused item into view
  useEffect(() => {
    if (itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [focusedIndex]);

  // Global keydown handler (Escape to close, Arrows & Enter handled in modal)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Keyboard navigation on input
  const handleKeyDown = (e) => {
    if (filtered.length === 0) return;

    // Arrow navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(filtered.length - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(filtered.length - 1, prev + 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(0, prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filtered[focusedIndex] || filtered[0];
      if (target) {
        onSelectChampion(target.id);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-[680px] bg-[#090b10] border border-[#1c202b] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10">
        
        {/* Top Header & Search Bar */}
        <div className="p-4 border-b border-[#141720] bg-[#0c0e14]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4a82e8]" />
              {title}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-[#5e6678]">
              <span className="hidden sm:inline text-[11px]">Użyj strzałek ↑ ↓ i Enter</span>
              <button 
                onClick={onClose}
                className="p-1 rounded text-[#5e6678] hover:text-white transition"
                title="Zamknij (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Input with Keyboard Listener */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#5e6678] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Wpisz nazwę (np. Sett, Aatrox, Lee Sin)... Wciśnij Enter aby wybrać"
              className="w-full pl-9 pr-14 py-2 bg-[#07080c] border border-[#1d222f] rounded-lg text-xs sm:text-sm text-white placeholder-[#50596c] focus:outline-none focus:border-[#4a82e8] transition"
            />
            {query ? (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5e6678] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-[#4a5568] pointer-events-none">
                <CornerDownLeft className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-0.5 scrollbar-none">
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-2 py-0.5 text-xs rounded font-medium whitespace-nowrap transition-all ${
                  selectedRole === role
                    ? 'bg-[#4a82e8] text-white font-bold'
                    : 'bg-[#10131b] text-[#717b90] border border-[#191d26] hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Champions Grid with Keyboard Selection Highlight */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-[#555e71] text-xs">
              Nie znaleziono bohatera pasującego do "{query}"
            </div>
          ) : (
            filtered.map((champ, idx) => {
              const isSelected = champ.id === currentChampionId;
              const isFocused = idx === focusedIndex;

              return (
                <button
                  key={champ.id}
                  ref={el => itemRefs.current[idx] = el}
                  onClick={() => {
                    onSelectChampion(champ.id);
                    onClose();
                  }}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  className={`group relative flex flex-col items-center p-2 rounded-lg border text-center transition-all ${
                    isFocused
                      ? 'bg-[#4a82e8]/20 border-[#4a82e8] ring-1 ring-[#4a82e8] shadow-md scale-[1.03] z-10'
                      : isSelected
                      ? 'bg-[#4a82e8]/10 border-[#4a82e8]/40'
                      : 'bg-[#0c0e14] border-[#181c25] hover:border-[#2d3446] hover:bg-[#10131b]'
                  }`}
                >
                  <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded overflow-hidden border transition-all ${
                    isFocused ? 'border-[#4a82e8]' : 'border-[#1d222e] group-hover:border-[#4a82e8]/60'
                  }`}>
                    <img 
                      src={getChampionIconUrl(champ.id, patch)} 
                      alt={champ.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                      onError={(e) => {
                        e.target.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/29.jpg';
                      }}
                    />
                  </div>
                  <span className={`mt-1.5 text-xs font-bold truncate w-full ${
                    isFocused ? 'text-white' : 'text-slate-200 group-hover:text-white'
                  }`}>
                    {champ.name}
                  </span>
                  {isFocused && (
                    <span className="text-[9px] text-[#78a5f5] font-medium tracking-tight truncate w-full">
                      Enter ↵
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

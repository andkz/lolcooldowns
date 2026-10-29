import React from 'react';
import { Search } from 'lucide-react';
import { getChampionIconUrl } from '../services/riotApi';

const QUICK_CHAMPS = [
  { id: 'Aatrox', name: 'Aatrox' },
  { id: 'Ahri', name: 'Ahri' },
  { id: 'LeeSin', name: 'Lee Sin' },
  { id: 'Yasuo', name: 'Yasuo' },
  { id: 'Zed', name: 'Zed' },
  { id: 'Jinx', name: 'Jinx' },
  { id: 'Thresh', name: 'Thresh' }
];

export default function ChampionBanner({ 
  champion, 
  patch, 
  onOpenSearch, 
  onSelectQuickChamp 
}) {
  if (!champion) return null;

  return (
    <div className="rounded-lg border border-[#161922] bg-[#090b10] px-3.5 py-2 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      
      {/* Left: Avatar & Identity inline */}
      <div className="flex items-center gap-2.5">
        <button 
          onClick={onOpenSearch}
          className="relative group shrink-0"
          title="Click to change champion (or press /)"
        >
          <div className="w-9 h-9 rounded-md overflow-hidden border border-[#222736] bg-[#0e1017] group-hover:border-[#4a82e8] transition-all">
            <img 
              src={getChampionIconUrl(champion.id, patch)} 
              alt={champion.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/29.jpg';
              }}
            />
          </div>
        </button>

        <div className="flex items-baseline gap-2 flex-wrap min-w-0">
          <span className="text-sm font-bold text-white tracking-tight">
            {champion.name}
          </span>
          <span className="text-xs text-[#6e778a] hidden md:inline truncate max-w-[200px]">
            {champion.title}
          </span>

          {/* Tags */}
          <div className="flex items-center gap-1 text-[10px]">
            {champion.tags?.slice(0, 2).map(tag => (
              <span 
                key={tag}
                className="px-1.5 py-0.2 rounded bg-[#0e1118] border border-[#1a1e28] text-[#7d8799]"
              >
                {tag}
              </span>
            ))}
            <span className="px-1.5 py-0.2 rounded bg-[#0e1118] border border-[#1a1e28] text-[#4a82e8] tabular-nums">
              {champion.partype || 'Manaless'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick Picks & Change Button */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto overflow-x-auto max-w-full pb-0.5 scrollbar-none">
        <span className="text-[10px] text-[#4d5668] hidden lg:inline mr-1">Quick:</span>
        {QUICK_CHAMPS.map(c => (
          <button
            key={c.id}
            onClick={() => onSelectQuickChamp(c.id)}
            className={`text-[10px] px-1.5 py-0.5 rounded border transition-all ${
              c.id === champion.id
                ? 'bg-[#4a82e8]/15 text-[#4a82e8] border-[#4a82e8]/40 font-bold'
                : 'bg-[#0e1017] text-[#697387] border-[#181c25] hover:text-white hover:border-[#222736]'
            }`}
          >
            {c.name}
          </button>
        ))}

        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#10131c] border border-[#1e2433] text-[11px] font-medium text-slate-200 hover:text-white hover:border-[#4a82e8] transition shrink-0 ml-1"
        >
          <Search className="w-3 h-3 text-[#4a82e8]" />
          <span>All ({173})</span>
        </button>
      </div>

    </div>
  );
}

import React, { useState, memo } from 'react';
import { calculateCooldown, getSpellIconUrl } from '../services/riotApi';
import { Info, X } from 'lucide-react';

const KEY_LABELS = ['Q', 'W', 'E', 'R'];

// Vercel Best Practice: js-hoist-regexp
// Hoist regular expressions to module scope to avoid re-compilation on every render
const HTML_TAGS_REGEX = /<[^>]*>/g;

function SpellCardComponent({ 
  spell, 
  index, 
  patch, 
  abilityHaste, 
  ultHaste = 0 
}) {
  const isUlt = index === 3;
  const effectiveHaste = isUlt ? (abilityHaste + ultHaste) : abilityHaste;
  const keyLabel = KEY_LABELS[index] || `S${index + 1}`;

  const cooldowns = spell.cooldown || [];
  const maxRank = cooldowns.length || 5;

  const [selectedRank, setSelectedRank] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  const activeRankIndex = Math.min(selectedRank, maxRank - 1);
  const baseCd = cooldowns[activeRankIndex] ?? 0;
  const reducedCd = calculateCooldown(baseCd, effectiveHaste);
  const timeSaved = Math.max(0, Number((baseCd - reducedCd).toFixed(2)));
  const percentSaved = baseCd > 0 ? Math.round((timeSaved / baseCd) * 100) : 0;

  const cleanDescription = (spell.description || '')
    .replace(HTML_TAGS_REGEX, '')
    .trim();

  return (
    <div className={`relative rounded-lg border transition-all duration-150 overflow-hidden ${
      isUlt 
        ? 'bg-[#0a0c12] border-[#c8aa6e]/35' 
        : 'bg-[#090b10] border-[#181c26] hover:border-[#283042]'
    }`}>
      
      {/* Main Compact Row */}
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
        
        {/* Left: Icon + Key Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-[#232938] bg-[#07080c]">
              <img 
                src={getSpellIconUrl(spell.image.full, patch)} 
                alt={spell.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/29.jpg';
                }}
              />
            </div>

            {/* Key Badge */}
            <div className={`absolute -top-1.5 -left-1.5 w-4 h-4 rounded flex items-center justify-center font-black text-[10px] border shadow-xs ${
              isUlt
                ? 'bg-[#c8aa6e] text-black border-[#f0e6d2]'
                : 'bg-[#0d1017] text-[#4a82e8] border-[#4a82e8]'
            }`}>
              {keyLabel}
            </div>
          </div>

          {/* Middle: Name & Highly Legible Level Rank Chips */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight truncate">
                {spell.name}
              </h3>
              {isUlt && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#c8aa6e]/15 text-[#c8aa6e] border border-[#c8aa6e]/30">
                  R
                </span>
              )}
              {/* Info Icon Button */}
              <button
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-[#64748b] hover:text-white transition p-0.5"
                title="Toggle spell details"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* High-Legibility Rank Level Chips (Increased Size, Contrast & Opacity) */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1">
                {cooldowns.map((c, rIdx) => {
                  const isCurrent = rIdx === activeRankIndex;
                  const rankReduced = calculateCooldown(c, effectiveHaste);
                  return (
                    <button
                      key={rIdx}
                      onClick={() => setSelectedRank(rIdx)}
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-xs tabular-nums font-bold transition-all shadow-xs ${
                        isCurrent
                          ? 'bg-[#4a82e8] text-white ring-1 ring-[#73a2f5] scale-105 z-10'
                          : 'bg-[#131622] text-slate-100 border border-[#232938] hover:bg-[#1a2030] hover:text-white hover:border-[#38435d]'
                      }`}
                      title={`Rank ${rIdx + 1}: ${rankReduced}s`}
                    >
                      <span className={`${isCurrent ? 'text-white/80' : 'text-[#8594ad]'} text-[11px] font-medium mr-1`}>
                        L{rIdx + 1}:
                      </span>
                      <span>{rankReduced}s</span>
                    </button>
                  );
                })}
              </div>

              {/* Resource & Range */}
              <span className="text-[11px] text-[#6e7b91] hidden md:inline tabular-nums">
                {spell.costBurn && spell.costBurn !== '0' ? `• ${spell.costBurn} Cost` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Big Cooldown Readout */}
        <div className="text-right shrink-0 min-w-[90px] sm:min-w-[115px]">
          <div className="flex items-baseline justify-end gap-1.5">
            <span className="text-2xl sm:text-3xl tabular-nums font-black text-white leading-none">
              {reducedCd}<span className="text-xs font-normal text-[#64748b] ml-0.5">s</span>
            </span>

            {baseCd > 0 && effectiveHaste > 0 ? (
              <span className="text-xs line-through text-[#64748b] tabular-nums">
                {baseCd}s
              </span>
            ) : null}
          </div>

          {effectiveHaste > 0 && baseCd > 0 ? (
            <div className="text-[11px] tabular-nums text-[#10b981] mt-1 font-bold">
              -{timeSaved}s ({percentSaved}%)
            </div>
          ) : (
            <div className="text-[10px] uppercase font-bold text-[#556075] mt-1">
              BASE CD
            </div>
          )}
        </div>

      </div>

      {/* Proportional Reduction Micro-Bar (2px at bottom) */}
      {baseCd > 0 ? (
        <div className="w-full h-[2px] bg-[#12151d] overflow-hidden flex">
          <div 
            className="h-full bg-[#4a82e8] transition-all duration-200"
            style={{ width: `${Math.min(100, Math.max(3, (reducedCd / baseCd) * 100))}%` }}
          />
          <div 
            className="h-full bg-[#10b981]/30 transition-all duration-200"
            style={{ width: `${Math.max(0, (timeSaved / baseCd) * 100)}%` }}
          />
        </div>
      ) : null}

      {/* Dropdown description tooltip when toggled */}
      {showTooltip ? (
        <div className="p-3 bg-[#07080c] border-t border-[#161a25] text-xs text-[#9aa7bd] leading-relaxed flex items-start justify-between gap-3 animate-in fade-in duration-100">
          <p className="flex-1">{cleanDescription || 'No description available.'}</p>
          <button 
            onClick={() => setShowTooltip(false)}
            className="text-[#64748b] hover:text-white p-0.5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : null}

    </div>
  );
}

export default memo(SpellCardComponent);

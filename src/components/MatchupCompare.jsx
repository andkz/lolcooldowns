import React, { useState } from 'react';
import { Swords, Clock, Search, X } from 'lucide-react';
import { calculateCooldown, abilityHasteToCdr, getChampionIconUrl, getSpellIconUrl } from '../services/riotApi';

const KEYS = ['Q', 'W', 'E', 'R'];

export default function MatchupCompare({
  champA,
  champB,
  hasteA,
  hasteB,
  setHasteB,
  patch,
  onOpenSearchB,
  onClose
}) {
  const [selectedSpellKeyA, setSelectedSpellKeyA] = useState('Q');
  const [selectedSpellKeyB, setSelectedSpellKeyB] = useState('Q');
  const [rankA, setRankA] = useState(0);
  const [rankB, setRankB] = useState(0);

  if (!champA || !champB) return null;

  const getSpell = (champ, key) => {
    const idx = KEYS.indexOf(key);
    return champ?.spells?.[idx] || null;
  };

  const spellA = getSpell(champA, selectedSpellKeyA);
  const spellB = getSpell(champB, selectedSpellKeyB);

  const cdA = spellA?.cooldown?.[Math.min(rankA, (spellA.cooldown?.length || 1) - 1)] || 0;
  const cdB = spellB?.cooldown?.[Math.min(rankB, (spellB.cooldown?.length || 1) - 1)] || 0;

  const reducedCdA = calculateCooldown(cdA, hasteA);
  const reducedCdB = calculateCooldown(cdB, hasteB);

  const diff = Number((reducedCdA - reducedCdB).toFixed(2));
  const diffAbs = Math.abs(diff);

  return (
    <div className="rounded-xl border border-[#1d222e] bg-[#090b10] p-4 sm:p-5 mb-5 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#14161f] mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#c8aa6e]/15 border border-[#c8aa6e]/30 flex items-center justify-center text-[#c8aa6e]">
            <Swords className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white">
              1v1 Matchup Trading Window
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-[11px] text-[#626c80] hover:text-white px-2 py-0.5 rounded bg-[#10131b] border border-[#191d26] transition"
        >
          Close
        </button>
      </div>

      {/* Symmetric Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
        
        {/* Left: Your Champion */}
        <div className="bg-[#07080c] rounded-lg p-3.5 border border-[#161922] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <img 
                  src={getChampionIconUrl(champA.id, patch)} 
                  alt={champA.name} 
                  className="w-8 h-8 rounded border border-[#4a82e8]/60"
                />
                <div>
                  <span className="text-[9px] text-[#4a82e8] font-bold uppercase tracking-wider block">Your Champion</span>
                  <span className="text-xs font-bold text-white">{champA.name}</span>
                </div>
              </div>
              <span className="text-[11px] tabular-nums text-[#4a82e8]">
                {hasteA} AH
              </span>
            </div>

            {/* Spell Key Switcher */}
            <div className="flex items-center gap-1 mb-2.5">
              {KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setSelectedSpellKeyA(k);
                    setRankA(0);
                  }}
                  className={`flex-1 py-1 rounded text-xs font-bold transition ${
                    selectedSpellKeyA === k 
                      ? 'bg-[#4a82e8] text-white font-extrabold' 
                      : 'bg-[#0e1017] text-[#5e6678] border border-[#161a24] hover:text-white'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Spell Details */}
            {spellA && (
              <div className="flex items-center gap-2 bg-[#0a0c12] p-2 rounded border border-[#151821]">
                <img 
                  src={getSpellIconUrl(spellA.image.full, patch)} 
                  alt={spellA.name} 
                  className="w-7 h-7 rounded"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white truncate">{spellA.name}</div>
                  <div className="flex items-center gap-1 text-[10px] text-[#5e6678]">
                    <span>Rank:</span>
                    {spellA.cooldown?.map((_, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => setRankA(rIdx)}
                        className={`px-1 rounded tabular-nums ${
                          rankA === rIdx ? 'bg-[#4a82e8] text-white font-bold' : 'text-[#5e6678]'
                        }`}
                      >
                        {rIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#13161f] flex items-baseline justify-between">
            <span className="text-[11px] text-[#555e71]">Cooldown:</span>
            <span className="text-xl tabular-nums font-extrabold text-white">
              {reducedCdA}s
            </span>
          </div>
        </div>

        {/* Right: Opponent */}
        <div className="bg-[#07080c] rounded-lg p-3.5 border border-[#161922] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <img 
                  src={getChampionIconUrl(champB.id, patch)} 
                  alt={champB.name} 
                  className="w-8 h-8 rounded border border-[#c8aa6e]/60"
                />
                <div>
                  <span className="text-[9px] text-[#c8aa6e] font-bold uppercase tracking-wider block">Opponent</span>
                  <span className="text-xs font-bold text-white">{champB.name}</span>
                </div>
              </div>

              <button
                onClick={onOpenSearchB}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[#10131b] text-[#717b90] border border-[#191d26] hover:text-white"
              >
                <Search className="w-3 h-3" />
                <span>Switch</span>
              </button>
            </div>

            {/* Opponent Haste Slider */}
            <div className="flex items-center gap-2 mb-2.5 bg-[#0a0c12] p-1.5 rounded border border-[#151821]">
              <span className="text-[10px] text-[#5e6678]">AH:</span>
              <input
                type="range"
                min="0"
                max="140"
                step="5"
                value={hasteB}
                onChange={(e) => setHasteB(Number(e.target.value))}
                className="flex-1 h-1 bg-[#141822] accent-[#c8aa6e]"
              />
              <span className="text-xs tabular-nums text-[#c8aa6e] font-bold w-10 text-right">
                {hasteB}
              </span>
            </div>

            {/* Spell Key Switcher */}
            <div className="flex items-center gap-1 mb-2.5">
              {KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setSelectedSpellKeyB(k);
                    setRankB(0);
                  }}
                  className={`flex-1 py-1 rounded text-xs font-bold transition ${
                    selectedSpellKeyB === k 
                      ? 'bg-[#c8aa6e] text-black font-extrabold' 
                      : 'bg-[#0e1017] text-[#5e6678] border border-[#161a24] hover:text-white'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Spell Details */}
            {spellB && (
              <div className="flex items-center gap-2 bg-[#0a0c12] p-2 rounded border border-[#151821]">
                <img 
                  src={getSpellIconUrl(spellB.image.full, patch)} 
                  alt={spellB.name} 
                  className="w-7 h-7 rounded"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white truncate">{spellB.name}</div>
                  <div className="flex items-center gap-1 text-[10px] text-[#5e6678]">
                    <span>Rank:</span>
                    {spellB.cooldown?.map((_, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => setRankB(rIdx)}
                        className={`px-1 rounded tabular-nums ${
                          rankB === rIdx ? 'bg-[#c8aa6e] text-black font-bold' : 'text-[#5e6678]'
                        }`}
                      >
                        {rIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#13161f] flex items-baseline justify-between">
            <span className="text-[11px] text-[#555e71]">Cooldown:</span>
            <span className="text-xl tabular-nums font-extrabold text-white">
              {reducedCdB}s
            </span>
          </div>
        </div>

      </div>

      {/* Trade Window Result */}
      <div className="mt-3 p-2.5 rounded-lg bg-[#07080c] border border-[#161922] flex items-center justify-between text-xs">
        <span className="text-[#647087]">Trade Window:</span>
        <div className="tabular-nums font-semibold">
          {diff < 0 ? (
            <span className="text-[#10b981]">
              Advantage You: Your {selectedSpellKeyA} is ready {diffAbs}s before enemy {selectedSpellKeyB}
            </span>
          ) : diff > 0 ? (
            <span className="text-[#f43f5e]">
              Enemy Advantage: Enemy {selectedSpellKeyB} is ready {diffAbs}s before your {selectedSpellKeyA}
            </span>
          ) : (
            <span className="text-[#8e9ab2]">
              Tied Cooldown: Both abilities ready in {reducedCdA}s
            </span>
          )}
        </div>
      </div>

    </div>
  );
}

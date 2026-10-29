import React, { useState } from 'react';
import { Zap, Plus, Minus, RotateCcw, Package, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { abilityHasteToCdr, getCastMultiplier } from '../services/riotApi';
import { HASTE_ITEMS, HASTE_RUNES_BUFFS } from '../data/itemsHaste';

const PRESETS = [0, 15, 30, 50, 75, 100, 130];

export default function HasteControls({ 
  haste, 
  setHaste, 
  ultHaste, 
  setUltHaste 
}) {
  const [showItemBuilder, setShowItemBuilder] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const cdrPercent = abilityHasteToCdr(haste);
  const castRate = getCastMultiplier(haste);
  const totalUltHaste = haste + ultHaste;
  const ultCdrPercent = abilityHasteToCdr(totalUltHaste);

  const handleSliderChange = (e) => {
    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
    setHaste(val);
  };

  const handleInputChange = (e) => {
    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
    setHaste(val);
  };

  const adjustHaste = (amount) => {
    setHaste(prev => Math.max(0, prev + amount));
  };

  const handleToggleItem = (item) => {
    const nextSelected = new Set(selectedItems);
    let newHaste = 0;
    let newUltHaste = 0;

    if (nextSelected.has(item.id)) {
      nextSelected.delete(item.id);
    } else {
      nextSelected.add(item.id);
    }

    setSelectedItems(nextSelected);

    const allOptions = [...HASTE_ITEMS, ...HASTE_RUNES_BUFFS];
    allOptions.forEach(opt => {
      if (nextSelected.has(opt.id)) {
        newHaste += opt.haste || 0;
        if (opt.ultHaste) newUltHaste += opt.ultHaste;
      }
    });

    setHaste(newHaste);
    if (newUltHaste > 0) {
      setUltHaste(newUltHaste);
    }
  };

  const handleReset = () => {
    setHaste(0);
    setUltHaste(0);
    setSelectedItems(new Set());
  };

  return (
    <div className="rounded-lg border border-[#161922] bg-[#090b10] px-3.5 py-2.5 mb-3">
      
      {/* Streamlined Single-Row Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Stepper + Slider + Input */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-bold text-white whitespace-nowrap hidden md:inline">
            Ability Haste:
          </span>

          <button
            onClick={() => adjustHaste(-5)}
            className="w-6 h-6 rounded bg-[#0e1118] border border-[#1c202b] flex items-center justify-center text-slate-300 hover:text-white transition shrink-0"
            title="-5 Haste"
          >
            <Minus className="w-3 h-3" />
          </button>

          <input
            type="range"
            min="0"
            max="160"
            step="1"
            value={haste}
            onChange={handleSliderChange}
            className="flex-1 max-w-[220px] h-1.5 bg-[#141822] rounded-lg appearance-none cursor-pointer accent-[#4a82e8]"
          />

          <button
            onClick={() => adjustHaste(5)}
            className="w-6 h-6 rounded bg-[#0e1118] border border-[#1c202b] flex items-center justify-center text-slate-300 hover:text-white transition shrink-0"
            title="+5 Haste"
          >
            <Plus className="w-3 h-3" />
          </button>

          <input
            type="number"
            min="0"
            max="300"
            value={haste}
            onChange={handleInputChange}
            className="w-13 text-center py-0.5 px-1 rounded bg-[#07080c] border border-[#1f2432] text-white tabular-nums font-bold text-xs focus:outline-none focus:border-[#4a82e8]"
          />
          <span className="text-xs tabular-nums text-[#6c778c]">AH</span>

          {/* Quick Presets Inline */}
          <div className="hidden lg:flex items-center gap-1 ml-2">
            {PRESETS.map(preset => (
              <button
                key={preset}
                onClick={() => setHaste(preset)}
                className={`px-1.5 py-0.5 rounded text-[10px] tabular-nums transition-all ${
                  haste === preset
                    ? 'bg-[#4a82e8] text-white font-bold'
                    : 'bg-[#0e1017] text-[#697387] border border-[#181c25] hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
            <button
              onClick={handleReset}
              className="text-[#555e71] hover:text-white p-0.5 transition"
              title="Reset"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: CDR % Readout + Item Builder Toggle */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* CDR Badge */}
          <div className="flex items-center gap-1.5 bg-[#0d0f15] px-2.5 py-1 rounded border border-[#181c26] text-xs tabular-nums">
            <span className="text-[#555e71] text-[10px] uppercase font-bold">CDR:</span>
            <span className="font-extrabold text-[#4a82e8]">{cdrPercent}%</span>
            <span className="text-[#4b5569] text-[10px] hidden sm:inline">({castRate}× casts)</span>
          </div>

          {/* Items Drawer trigger */}
          <button
            onClick={() => setShowItemBuilder(!showItemBuilder)}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-medium transition ${
              selectedItems.size > 0 || showItemBuilder
                ? 'bg-[#4a82e8]/15 border-[#4a82e8]/40 text-[#4a82e8]'
                : 'bg-[#0e1017] border-[#181c25] text-[#717b90] hover:text-white'
            }`}
          >
            <Package className="w-3 h-3" />
            <span>Items ({selectedItems.size})</span>
            {showItemBuilder ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

      </div>

      {/* Expandable Item Builder when opened */}
      {showItemBuilder && (
        <div className="mt-2.5 pt-2 border-t border-[#141720] space-y-2 animate-in fade-in duration-100">
          <div className="flex items-center justify-between text-[11px] text-[#647187]">
            <span>Click LoL items/runes to auto-sum Ability Haste:</span>
            <button 
              onClick={() => setSelectedItems(new Set())}
              className="text-[#4a82e8] hover:underline"
            >
              Clear items
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
            {[...HASTE_ITEMS, ...HASTE_RUNES_BUFFS].map(item => {
              const isEquipped = selectedItems.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleToggleItem(item)}
                  className={`flex items-center justify-between p-1.5 rounded text-left text-[11px] border transition-all ${
                    isEquipped
                      ? 'bg-[#4a82e8]/15 border-[#4a82e8]/60 text-white font-medium'
                      : 'bg-[#0e1017] border-[#181c25] text-[#717b90] hover:text-white'
                  }`}
                >
                  <span className="truncate pr-1">{item.name}</span>
                  <span className="tabular-nums text-[#4a82e8] font-bold text-[10px] shrink-0">
                    +{item.haste}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

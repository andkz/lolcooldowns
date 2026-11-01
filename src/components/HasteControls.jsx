import React, { useState } from 'react';
import { Zap, Plus, Minus, RotateCcw, Package, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { abilityHasteToCdr, getCastMultiplier } from '../services/riotApi';
import { HASTE_ITEMS, HASTE_RUNES_BUFFS } from '../data/itemsHaste';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
        if (opt.isUltOnly) {
          newUltHaste += opt.haste;
        } else {
          newHaste += opt.haste;
        }
      }
    });

    setHaste(newHaste);
    setUltHaste(newUltHaste);
  };

  const resetAll = () => {
    setHaste(0);
    setUltHaste(0);
    setSelectedItems(new Set());
  };

  return (
    <Card className="rounded-lg border-border bg-card p-3 mb-3">
      
      {/* Top Header Row: Main Input & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Input, -/+, Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground">Haste:</span>
            
            {/* Quick Step Buttons */}
            <div className="flex items-center gap-0.5">
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => adjustHaste(-10)}
                className="w-6 h-6 border-border bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
                title="-10 Haste"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => adjustHaste(10)}
                className="w-6 h-6 border-border bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
                title="+10 Haste"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            {/* Direct Number Input */}
            <Input
              type="number" 
              min="0"
              max="300"
              value={haste === 0 ? '0' : haste} 
              onChange={handleInputChange}
              className="w-14 h-6 text-center text-xs font-bold bg-background border-border text-foreground rounded focus-visible:ring-1 focus-visible:ring-primary p-0"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1">
            {PRESETS.map((p) => {
              const isSelected = haste === p;
              return (
                <Button
                  key={p}
                  variant={isSelected ? 'default' : 'outline'}
                  size="xs"
                  onClick={() => setHaste(p)}
                  className={`h-6 px-1.5 text-[11px] font-semibold transition ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                      : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {p}
                </Button>
              );
            })}
          </div>

          {/* Reset button */}
          {(haste > 0 || ultHaste > 0) && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={resetAll}
              title="Reset to 0"
              className="w-6 h-6 text-muted-foreground hover:text-foreground hover:bg-secondary/60 ml-0.5"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Right: Key Stats / CDR Output */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5 bg-background/80 px-2.5 py-1 rounded border border-border">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Cooldown Reduction:</span>
            <span className="text-sm font-black text-primary">
              -{cdrPercent}%
            </span>
            <span className="text-[10px] text-muted-foreground/80 font-mono">
              ({castRate}x casts)
            </span>
          </div>

          {/* Ultimate Haste indicator if active */}
          {ultHaste > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 bg-amber-500/10 border-amber-500/30 px-2 py-0.5 text-amber-300 text-[10px]">
              <Flame className="w-2.5 h-2.5 text-amber-400" />
              <span>Ult: {totalUltHaste} AH (-{ultCdrPercent}%)</span>
            </Badge>
          )}

          {/* Item Builder Toggle Button */}
          <Button
            variant={showItemBuilder ? 'secondary' : 'outline'}
            size="xs"
            onClick={() => setShowItemBuilder(!showItemBuilder)}
            className="h-6 px-2 text-[11px] font-medium gap-1 text-muted-foreground hover:text-foreground border-border bg-secondary/60"
          >
            <Package className="w-3 h-3 text-primary" />
            <span>Items</span>
            {selectedItems.size > 0 && (
              <Badge className="h-4 px-1 text-[9px] bg-primary text-primary-foreground">
                {selectedItems.size}
              </Badge>
            )}
            {showItemBuilder ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
          </Button>
        </div>

      </div>

      {/* Slider Bar */}
      <div className="mt-2.5 flex items-center gap-2">
        <input 
          type="range"
          min="0"
          max="150"
          step="5"
          value={haste}
          onChange={handleSliderChange}
          className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      {/* Item Builder Collapsible Drawer */}
      {showItemBuilder && (
        <div className="mt-2.5 pt-2 border-t border-border/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Popular Haste Items & Buffs
            </span>
            <span className="text-[10px] text-muted-foreground">
              Click to toggle & stack
            </span>
          </div>

          <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto pr-1">
            {[...HASTE_ITEMS, ...HASTE_RUNES_BUFFS].map(item => {
              const isSelected = selectedItems.has(item.id);
              return (
                <Button
                  key={item.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="xs"
                  onClick={() => handleToggleItem(item)}
                  className={`h-5 px-1.5 text-[10px] font-medium transition ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' 
                      : 'border-border bg-background/80 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className={`text-[9px] font-mono ml-0.5 ${isSelected ? 'text-primary-foreground/90' : 'text-primary'}`}>
                    +{item.haste}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

    </Card>
  );
}

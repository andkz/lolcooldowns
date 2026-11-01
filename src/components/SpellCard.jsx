import React, { useState, memo } from 'react';
import { calculateCooldown, getSpellIconUrl } from '../services/riotApi';
import { Info, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <Card className={`relative rounded-lg border transition-all duration-150 overflow-hidden ${
      isUlt 
        ? 'bg-card border-amber-500/40 shadow-xs' 
        : 'bg-card border-border hover:border-primary/40'
    }`}>
      
      {/* Main Compact Row */}
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
        
        {/* Left: Icon + Key Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className={`w-9 h-9 rounded-md overflow-hidden border ${
              isUlt ? 'border-amber-500/60' : 'border-border'
            } bg-muted`}>
              <img 
                src={getSpellIconUrl(spell.image.full, patch)} 
                alt={spell.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/29.jpg';
                }}
              />
            </div>
            {/* Key Badge in bottom corner */}
            <span className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded text-[9px] font-black flex items-center justify-center border font-mono shadow-xs ${
              isUlt 
                ? 'bg-amber-500 text-black border-amber-300' 
                : 'bg-primary text-primary-foreground border-primary/80'
            }`}>
              {keyLabel}
            </span>
          </div>

          {/* Spell Name & Cooldown Progression */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground truncate">
                {spell.name}
              </span>
              {isUlt && (
                <Badge variant="outline" className="text-[9px] font-bold text-amber-300 bg-amber-500/10 border-amber-500/30 px-1 py-0 uppercase">
                  Ultimate
                </Badge>
              )}
            </div>

            {/* Rank Selectors */}
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-muted-foreground mr-0.5">Lv:</span>
              <div className="flex items-center gap-1">
                {cooldowns.map((cd, rankIdx) => {
                  const isSelected = rankIdx === activeRankIndex;
                  return (
                    <Button
                      key={rankIdx}
                      variant={isSelected ? (isUlt ? 'secondary' : 'default') : 'outline'}
                      size="xs"
                      onClick={() => setSelectedRank(rankIdx)}
                      className={`h-5 min-w-[34px] px-1 text-[11px] font-semibold border transition font-mono ${
                        isSelected 
                          ? (isUlt ? 'bg-amber-500 text-black border-amber-400 font-bold hover:bg-amber-400' : 'bg-primary text-primary-foreground border-primary')
                          : 'border-border bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      {cd}s
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Big Impactful Timer & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Real-time Result */}
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1 font-mono">
              <span className={`text-xl sm:text-2xl font-black tracking-tight ${
                isUlt ? 'text-amber-300' : 'text-primary'
              }`}>
                {reducedCd}s
              </span>
            </div>

            {/* Saved info */}
            <div className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
              {timeSaved > 0 ? (
                <>
                  <span className="text-emerald-400 font-medium">-{timeSaved}s</span>
                  <span>(-{percentSaved}%)</span>
                </>
              ) : (
                <span className="text-muted-foreground/60">base cd</span>
              )}
            </div>
          </div>

          {/* Info Toggle Button */}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowTooltip(!showTooltip)}
            title="Szczegóły skilla"
            className={`w-7 h-7 rounded-md transition ${
              showTooltip 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {showTooltip ? <X className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
          </Button>

        </div>

      </div>

      {/* Expanded Tooltip / Skill Description */}
      {showTooltip && (
        <div className="px-3.5 py-2.5 border-t border-border/80 bg-secondary/30 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-foreground">Opis umiejętności:</span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Koszt: {spell.costBurn ? `${spell.costBurn} many/en` : 'Brak'} | Zasięg: {spell.rangeBurn || 'Brak'}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/90">{cleanDescription}</p>
        </div>
      )}

    </Card>
  );
}

const SpellCard = memo(SpellCardComponent);
export default SpellCard;

import React, { useState } from 'react';
import { Swords, Clock, Search, X } from 'lucide-react';
import { calculateCooldown, abilityHasteToCdr, getChampionIconUrl, getSpellIconUrl } from '../services/riotApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
    <Card className="rounded-xl border-border bg-card p-4 sm:p-5 mb-5 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Swords className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Matchup Duel / Trade Window
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Porównaj okna cooldownów dwóch umiejętności w pojedynku 1v1
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground h-7 w-7"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Two Champions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CHAMPION A (YOU) */}
        <div className="p-3.5 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md overflow-hidden border border-border bg-muted">
                <img 
                  src={getChampionIconUrl(champA.id, patch)} 
                  alt={champA.name}
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">
                  {champA.name} <span className="text-[10px] text-primary">(Ty)</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Haste: {hasteA} (-{abilityHasteToCdr(hasteA)}%)
                </span>
              </div>
            </div>

            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary bg-primary/10">
              Twoja postać
            </Badge>
          </div>

          {/* Spell Selector */}
          <div className="flex items-center gap-1.5 mb-2.5">
            {KEYS.map((k, i) => {
              const sp = champA?.spells?.[i];
              const isSelected = selectedSpellKeyA === k;
              return (
                <Button
                  key={k}
                  variant={isSelected ? 'default' : 'outline'}
                  size="xs"
                  onClick={() => {
                    setSelectedSpellKeyA(k);
                    setRankA(0);
                  }}
                  className={`flex-1 h-7 text-xs font-bold font-mono transition ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' 
                      : 'border-border bg-background/80 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {k}
                </Button>
              );
            })}
          </div>

          {/* Rank Selector */}
          {spellA && (
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground text-[11px] truncate max-w-[130px] font-medium">
                {spellA.name}
              </span>
              <div className="flex items-center gap-1">
                {spellA.cooldown?.map((cd, idx) => (
                  <Button
                    key={idx}
                    variant={rankA === idx ? 'default' : 'outline'}
                    size="xs"
                    onClick={() => setRankA(idx)}
                    className={`h-5 px-1.5 text-[10px] font-mono border transition ${
                      rankA === idx
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    r{idx + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Cooldown Output */}
          <div className="pt-2 border-t border-border flex items-baseline justify-between font-mono">
            <span className="text-[11px] text-muted-foreground">Aktualny CD:</span>
            <span className="text-lg font-black text-primary">
              {reducedCdA}s
            </span>
          </div>
        </div>

        {/* CHAMPION B (OPPONENT) */}
        <div className="p-3.5 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md overflow-hidden border border-border bg-muted">
                <img 
                  src={getChampionIconUrl(champB.id, patch)} 
                  alt={champB.name}
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">
                  {champB.name} <span className="text-[10px] text-destructive">(Przeciwnik)</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Haste: {hasteB} (-{abilityHasteToCdr(hasteB)}%)
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={onOpenSearchB}
              className="h-6 px-2 text-[10px] border-border bg-background/80 hover:bg-secondary text-muted-foreground hover:text-foreground gap-1"
            >
              <Search className="w-2.5 h-2.5" />
              <span>Zmień</span>
            </Button>
          </div>

          {/* Spell Selector */}
          <div className="flex items-center gap-1.5 mb-2.5">
            {KEYS.map((k, i) => {
              const sp = champB?.spells?.[i];
              const isSelected = selectedSpellKeyB === k;
              return (
                <Button
                  key={k}
                  variant={isSelected ? 'destructive' : 'outline'}
                  size="xs"
                  onClick={() => {
                    setSelectedSpellKeyB(k);
                    setRankB(0);
                  }}
                  className={`flex-1 h-7 text-xs font-bold font-mono transition ${
                    isSelected 
                      ? 'bg-destructive text-white border-destructive hover:bg-destructive/90' 
                      : 'border-border bg-background/80 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {k}
                </Button>
              );
            })}
          </div>

          {/* Rank Selector & Haste slider for opponent */}
          {spellB && (
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground text-[11px] truncate max-w-[130px] font-medium">
                {spellB.name}
              </span>
              <div className="flex items-center gap-1">
                {spellB.cooldown?.map((cd, idx) => (
                  <Button
                    key={idx}
                    variant={rankB === idx ? 'destructive' : 'outline'}
                    size="xs"
                    onClick={() => setRankB(idx)}
                    className={`h-5 px-1.5 text-[10px] font-mono border transition ${
                      rankB === idx
                        ? 'bg-destructive text-white border-destructive'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    r{idx + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Opponent haste control bar */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-muted-foreground shrink-0">Haste wroga:</span>
            <input 
              type="range"
              min="0"
              max="150"
              step="5"
              value={hasteB}
              onChange={(e) => setHasteB(parseInt(e.target.value, 10) || 0)}
              className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-destructive"
            />
            <Input 
              type="number"
              min="0"
              max="250"
              value={hasteB}
              onChange={(e) => setHasteB(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-10 h-5 text-center text-[10px] font-bold bg-background border-border text-foreground rounded p-0"
            />
          </div>

          {/* Cooldown Output */}
          <div className="pt-2 border-t border-border flex items-baseline justify-between font-mono">
            <span className="text-[11px] text-muted-foreground">Aktualny CD:</span>
            <span className="text-lg font-black text-destructive">
              {reducedCdB}s
            </span>
          </div>
        </div>

      </div>

      {/* Trade Window Verdict Banner */}
      <div className="mt-4 p-3 rounded-lg border border-border bg-background/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <span className="text-foreground">
            {diff === 0 ? (
              <span>Obie umiejętności mają dokładnie taki sam cooldown!</span>
            ) : diff < 0 ? (
              <span>
                Twój <strong className="text-primary font-mono">{selectedSpellKeyA}</strong> wraca o{' '}
                <strong className="text-emerald-400 font-mono">{diffAbs}s szybciej</strong> niż przeciwnika {selectedSpellKeyB}!
              </span>
            ) : (
              <span>
                <strong className="text-destructive font-mono">Uwaga:</strong> Skill przeciwnika{' '}
                wraca o <strong className="text-destructive font-mono">{diffAbs}s szybciej</strong> niż Twój {selectedSpellKeyA}!
              </span>
            )}
          </span>
        </div>

        <Badge variant="outline" className={`font-mono text-xs px-2.5 py-1 ${
          diff <= 0 
            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' 
            : 'text-destructive border-destructive/30 bg-destructive/10'
        }`}>
          Δ {diff > 0 ? `+${diff}s` : `${diff}s`}
        </Badge>
      </div>

    </Card>
  );
}

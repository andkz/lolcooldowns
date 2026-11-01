import React from 'react';
import { Search } from 'lucide-react';
import { getChampionIconUrl } from '../services/riotApi';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
    <Card className="rounded-lg border-border bg-card px-3.5 py-2 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      
      {/* Left: Avatar & Identity inline */}
      <div className="flex items-center gap-2.5">
        <button 
          onClick={onOpenSearch}
          className="relative group shrink-0"
          title="Click to change champion (or press /)"
        >
          <div className="w-9 h-9 rounded-md overflow-hidden border border-border bg-muted group-hover:border-primary transition-all">
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
          <span className="text-sm font-bold text-foreground tracking-tight">
            {champion.name}
          </span>
          <span className="text-xs text-muted-foreground hidden md:inline truncate max-w-[200px]">
            {champion.title}
          </span>

          {/* Role tags rendered with shadcn Badge */}
          <div className="flex items-center gap-1">
            {champion.tags?.map((tag) => (
              <Badge 
                key={tag}
                variant="outline"
                className="text-[9px] font-medium px-1.5 py-0 border-border bg-secondary/60 text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Change champion button */}
        <Button
          variant="outline"
          size="xs"
          onClick={onOpenSearch}
          className="h-6 px-2 text-[11px] font-medium text-primary hover:text-primary-foreground border-border bg-secondary/40 hover:bg-primary gap-1 ml-1"
        >
          <Search className="w-2.5 h-2.5" />
          <span>Change</span>
        </Button>
      </div>

      {/* Right: Quick Champion Switchers */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
        <span className="text-[10px] text-muted-foreground uppercase font-bold shrink-0 tracking-wider">
          Quick:
        </span>
        <div className="flex items-center gap-1">
          {QUICK_CHAMPS.map((qc) => {
            const isActive = qc.id.toLowerCase() === champion.id.toLowerCase();
            return (
              <Button
                key={qc.id}
                variant={isActive ? 'default' : 'ghost'}
                size="xs"
                onClick={() => onSelectQuickChamp(qc.id)}
                className={`h-6 px-2 text-[11px] font-medium transition ${
                  isActive
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                }`}
              >
                {qc.name}
              </Button>
            );
          })}
        </div>
      </div>

    </Card>
  );
}

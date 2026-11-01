import React, { useState, memo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getPassiveIconUrl } from '../services/riotApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Vercel Best Practice: js-hoist-regexp
const HTML_TAGS_REGEX = /<[^>]*>/g;

function PassiveCardComponent({ passive, patch }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!passive) return null;

  const cleanDescription = (passive.description || '')
    .replace(HTML_TAGS_REGEX, '')
    .trim();

  return (
    <Card className="rounded-lg border-border bg-card px-3.5 py-2 mb-2.5 transition-all">
      <div className="flex items-center justify-between text-xs">
        
        {/* Left: Icon, Name & Preview */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 rounded overflow-hidden border border-border shrink-0">
            <img 
              src={getPassiveIconUrl(passive.image.full, patch)} 
              alt={passive.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/29.jpg';
              }}
            />
          </div>
          <span className="font-bold text-foreground text-xs truncate">
            Passive: {passive.name}
          </span>
          {!showDetails ? (
            <span className="text-muted-foreground text-[11px] hidden md:inline truncate max-w-md">
              — {cleanDescription}
            </span>
          ) : null}
        </div>

        {/* Right: Expand / Collapse Toggle Button */}
        <Button 
          variant="ghost"
          size="xs"
          onClick={() => setShowDetails(!showDetails)}
          className="h-6 px-2 text-xs text-primary hover:text-foreground shrink-0 ml-2 gap-1 font-medium transition"
        >
          <span>{showDetails ? 'Zwiń' : 'Rozwiń'}</span>
          {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </div>

      {/* Expanded details */}
      {showDetails && (
        <div className="mt-2 pt-2 border-t border-border/80 text-[11px] text-muted-foreground leading-relaxed animate-in fade-in duration-150">
          <p>{cleanDescription}</p>
        </div>
      )}
    </Card>
  );
}

const PassiveCard = memo(PassiveCardComponent);
export default PassiveCard;

import React, { useState, memo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getPassiveIconUrl } from '../services/riotApi';

// Vercel Best Practice: js-hoist-regexp
const HTML_TAGS_REGEX = /<[^>]*>/g;

function PassiveCardComponent({ passive, patch }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!passive) return null;

  const cleanDescription = (passive.description || '')
    .replace(HTML_TAGS_REGEX, '')
    .trim();

  return (
    <div className="rounded-lg border border-[#161922] bg-[#090b10] px-3.5 py-2 mb-2.5 transition-all">
      <div className="flex items-center justify-between text-xs">
        
        {/* Left: Icon, Name & Preview */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 rounded overflow-hidden border border-[#202533] shrink-0">
            <img 
              src={getPassiveIconUrl(passive.image.full, patch)} 
              alt={passive.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/29.jpg';
              }}
            />
          </div>
          <span className="font-bold text-white text-xs truncate">
            Passive: {passive.name}
          </span>
          {!showDetails ? (
            <span className="text-[#647187] text-[11px] hidden md:inline truncate max-w-md">
              — {cleanDescription}
            </span>
          ) : null}
        </div>

        {/* Right: Expand / Collapse Toggle Button */}
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-[#4a82e8] hover:text-white shrink-0 ml-2 flex items-center gap-1 font-medium transition"
        >
          <span>{showDetails ? 'Zwiń' : 'Rozwiń'}</span>
          {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Clean inline expansion inside container */}
      {showDetails ? (
        <div className="mt-2 pt-2 border-t border-[#141720] text-xs text-[#9aa7bd] leading-relaxed animate-in fade-in duration-150">
          <strong className="text-white block mb-0.5">{passive.name}</strong>
          {cleanDescription}
        </div>
      ) : null}
    </div>
  );
}

export default memo(PassiveCardComponent);

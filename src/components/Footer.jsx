import React from 'react';
import { Database } from 'lucide-react';

export default function Footer({ patch }) {
  return (
    <footer className="mt-10 py-6 border-t border-[#13151c] text-center text-[11px] text-[#4d5669]">
      <div className="max-w-[1000px] mx-auto px-4 space-y-1.5">
        <div className="flex items-center justify-center gap-3 text-[#647189]">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-[#4a82e8]" />
            Riot Games Data Dragon CDN
          </span>
          <span>•</span>
          <span className="tabular-nums">Patch {patch || 'Live'}</span>
          <span>•</span>
          <span className="tabular-nums text-[#545e73]">CD = Base × 100/(100+AH)</span>
        </div>

        <p className="text-[#3b4252] max-w-lg mx-auto">
          League Cooldowns isn't endorsed by Riot Games and doesn't reflect the views of Riot Games or its affiliates.
        </p>
      </div>
    </footer>
  );
}

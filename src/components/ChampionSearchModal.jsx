import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import { Search, X, Users, CornerDownLeft } from 'lucide-react';
import { getChampionIconUrl } from '../services/riotApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ROLES = ['All', 'Assassin', 'Fighter', 'Mage', 'Marksman', 'Support', 'Tank'];

export default function ChampionSearchModal({ 
  isOpen, 
  onClose, 
  champions, 
  onSelectChampion, 
  currentChampionId,
  patch,
  title = "Select Champion"
}) {
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Vercel Best Practice: rerender-use-deferred-value
  const deferredQuery = useDeferredValue(query);

  const inputRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setFocusedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  // Optimized memoized search filter using deferred query
  const filtered = useMemo(() => {
    if (!champions || champions.length === 0) return [];
    const q = deferredQuery.trim().toLowerCase();
    return champions.filter(champ => {
      const matchesQuery = !q || champ.name.toLowerCase().includes(q) || champ.id.toLowerCase().includes(q);
      const matchesRole = selectedRole === 'All' || (champ.tags && champ.tags.includes(selectedRole));
      return matchesQuery && matchesRole;
    });
  }, [champions, deferredQuery, selectedRole]);

  // Reset focused item to 0 on search query or role change
  useEffect(() => {
    setFocusedIndex(0);
  }, [query, selectedRole]);

  // Ensure active keyboard-selected item is visible in scroll container
  useEffect(() => {
    if (itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [focusedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetChamp = filtered[focusedIndex] || filtered[0];
      if (targetChamp) {
        onSelectChampion(targetChamp.id);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-2xl bg-card border-border text-foreground p-0 overflow-hidden shadow-2xl rounded-xl gap-0"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Search and pick a champion</DialogDescription>
        </DialogHeader>

        {/* Search Input Bar */}
        <div className="p-3 border-b border-border bg-card flex items-center gap-3">
          <Search className="w-4 h-4 text-primary shrink-0 ml-1" />
          <Input 
            ref={inputRef}
            type="text"
            placeholder="Type champion name (e.g. Sett, Ahri)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none p-0 h-auto shadow-none"
          />
          {query && (
            <Button 
              variant="ghost"
              size="icon-xs"
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground h-6 w-6"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
          <Badge variant="outline" className="hidden sm:flex text-[10px] text-muted-foreground border-border bg-secondary/50 font-mono gap-1 px-1.5 py-0.5">
            <span>Esc</span> to close
          </Badge>
        </div>

        {/* Roles Filter Bar */}
        <div className="px-3 py-2 bg-secondary/30 border-b border-border/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider shrink-0 mr-1">
            Role:
          </span>
          {ROLES.map((role) => {
            const isSelected = selectedRole === role;
            return (
              <Button
                key={role}
                variant={isSelected ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setSelectedRole(role)}
                className={`h-5 px-2 text-[10px] font-semibold transition ${
                  isSelected
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {role}
              </Button>
            );
          })}
        </div>

        {/* Champions Grid List */}
        <div className="p-3 max-h-[380px] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs">Nie znaleziono bohatera dla "{query}"</p>
            </div>
          ) : (
            filtered.map((champ, index) => {
              const isSelected = champ.id === currentChampionId;
              const isKeyboardFocused = index === focusedIndex;

              return (
                <button
                  key={champ.id}
                  ref={(el) => (itemRefs.current[index] = el)}
                  onClick={() => {
                    onSelectChampion(champ.id);
                    onClose();
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all ${
                    isKeyboardFocused
                      ? 'bg-primary/15 border-primary ring-1 ring-primary/40'
                      : isSelected 
                        ? 'bg-secondary border-primary/40' 
                        : 'bg-card border-border/60 hover:bg-secondary/70 hover:border-border'
                  }`}
                >
                  <div className="w-7 h-7 rounded overflow-hidden border border-border bg-muted shrink-0">
                    <img 
                      src={getChampionIconUrl(champ.id, patch)} 
                      alt={champ.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/29.jpg';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold truncate ${
                        isKeyboardFocused ? 'text-primary' : 'text-foreground'
                      }`}>
                        {champ.name}
                      </span>
                      {isKeyboardFocused && (
                        <CornerDownLeft className="w-2.5 h-2.5 text-primary shrink-0 opacity-80" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate block">
                      {champ.title}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer hint */}
        <div className="px-3 py-1.5 bg-secondary/50 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span>{filtered.length} champions</span>
          <div className="flex items-center gap-2">
            <span>↓↑ browse</span>
            <span>↵ select</span>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

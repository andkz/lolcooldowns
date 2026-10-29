import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  Cpu, 
  Zap, 
  Swords, 
  Sliders, 
  Search, 
  Code2, 
  CheckCircle2, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import Header from './Header';
import ChampionBanner from './ChampionBanner';
import HasteControls from './HasteControls';
import SpellCard from './SpellCard';
import PassiveCard from './PassiveCard';
import MatchupCompare from './MatchupCompare';
import ChampionSearchModal from './ChampionSearchModal';
import Footer from './Footer';

export default function ExplanationPage({ 
  championData, 
  patch, 
  champions, 
  onBackToCalculator 
}) {
  // Demo interactive states
  const [demoHaste, setDemoHaste] = useState(30);
  const [demoUltHaste, setDemoUltHaste] = useState(0);
  const [demoSearchOpen, setDemoSearchOpen] = useState(false);
  const [demoCompareOpen, setDemoCompareOpen] = useState(true);
  const [demoHasteB, setDemoHasteB] = useState(15);

  const sampleSpell = championData?.spells?.[0] || {
    id: 'AatroxQ',
    name: 'The Darkin Blade',
    cooldown: [14, 12, 10, 8, 6],
    cooldownBurn: '14/12/10/8/6',
    costBurn: '0',
    rangeBurn: '25000',
    description: 'Aatrox slams his greatsword, dealing physical damage.',
    image: { full: 'AatroxQ.png' }
  };

  const samplePassive = championData?.passive || {
    name: 'Deathbringer Stance',
    description: 'Periodically, Aatrox next basic attack deals bonus physical damage.',
    image: { full: 'Aatrox_Passive.png' }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Hero Banner */}
      <div className="rounded-xl border border-[#1b212f] bg-[#090b10] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded bg-[#4a82e8]/15 border border-[#4a82e8]/30 text-[#4a82e8] text-[11px] font-bold uppercase tracking-wider">
                Technical Architecture
              </span>
              <span className="text-xs text-[#5f6b80]">React 19 • Tailwind v4</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Jak Został Zbudowany Projekt League Cooldowns
            </h1>
            <p className="text-xs sm:text-sm text-[#7f8ba0] mt-1 max-w-2xl leading-relaxed">
              Kompleksowy przegląd architektury aplikacji, integracji z oficjalnym CDN-em Riot Games Data Dragon, formuł matematycznych oraz interaktywny katalog każdego komponentu.
            </p>
          </div>

          <button
            onClick={onBackToCalculator}
            className="self-start sm:self-center px-4 py-2 rounded-lg bg-[#4a82e8] text-white text-xs font-bold hover:bg-[#3b72d6] transition flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <span>Wróć do Kalkulatora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Section 1: Data Pipeline & Riot API Flow */}
      <div className="rounded-xl border border-[#161922] bg-[#090b10] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-[#4a82e8]" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Rurociąg Danych (Data Dragon Pipeline)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-4">
          <div className="p-3 bg-[#07080c] rounded-lg border border-[#151821]">
            <div className="text-[#4a82e8] font-bold mb-1">Krok 1: Patch Detector</div>
            <p className="text-[#7f8ba0] leading-relaxed">
              Aplikacja odpytuje <code className="text-[#a1b0cc]">versions.json</code>. Pierwszy element tablicy to zawsze najnowszy patch (np. <code className="text-white">{patch || '14.10.1'}</code>). Brak wpisywania patcha na sztywno.
            </p>
          </div>

          <div className="p-3 bg-[#07080c] rounded-lg border border-[#151821]">
            <div className="text-[#4a82e8] font-bold mb-1">Krok 2: Katalog Bohaterów</div>
            <p className="text-[#7f8ba0] leading-relaxed">
              Pobranie <code className="text-[#a1b0cc]">champion.json</code> (173 postaci). Zapis w pamięci podręcznej <code className="text-white">localStorage</code> z 12h TTL eliminuje zbędne zapytania sieciowe.
            </p>
          </div>

          <div className="p-3 bg-[#07080c] rounded-lg border border-[#151821]">
            <div className="text-[#4a82e8] font-bold mb-1">Krok 3: Szczegóły Umiejętności</div>
            <p className="text-[#7f8ba0] leading-relaxed">
              Pobranie <code className="text-[#a1b0cc]">champion/[ID].json</code>. Wyciągnięcie tablic <code className="text-white">cooldown[]</code> dla Q, W, E, R oraz pasywki.
            </p>
          </div>
        </div>

        {/* Formula Explainer */}
        <div className="p-3.5 bg-[#0e1118] rounded-lg border border-[#1a1f2c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-white block mb-0.5">Oficjalna Formuła Redukcji Cooldownu Riot Games:</span>
            <span className="text-[#4a82e8] text-sm font-semibold">
              Rzeczywisty Cooldown = Bazowy Cooldown × [100 / (100 + Ability Haste)]
            </span>
          </div>
          <div className="text-[11px] text-[#717d94] sm:text-right tabular-nums">
            100 AH = 50% CDR (2x częściej)<br />
            50 AH = 33.3% CDR (1.5x częściej)
          </div>
        </div>
      </div>

      {/* Section 2: Interactive Component Catalog */}
      <div className="space-y-6">
        
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#4a82e8]" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Katalog Komponentów (Interactive Showcase & Playground)
          </h2>
        </div>

        {/* COMPONENT 1: SpellCard */}
        <div className="rounded-xl border border-[#161922] bg-[#090b10] p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#141720] pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">SpellCard.jsx</span>
                <span className="px-1.5 py-0.2 rounded bg-[#4a82e8]/15 text-[#4a82e8] text-[10px]">React.memo</span>
              </div>
              <p className="text-xs text-[#6e7a8e] mt-0.5">
                Kompaktowa karta umiejętności (Q/W/E/R) z dynamicznym przeliczaniem rangi, mikropaskiem proporcji i czasem zaoszczędzonym.
              </p>
            </div>
            <div className="text-[11px] text-[#545e73]">
              Props: spell, index, patch, abilityHaste, ultHaste
            </div>
          </div>

          {/* Interactive Live Demo */}
          <div className="p-3 bg-[#050608] rounded-lg border border-[#141720]">
            <span className="text-[10px] uppercase font-bold text-[#444c5e] block mb-2">Podgląd na żywo ({demoHaste} AH):</span>
            <SpellCard 
              spell={sampleSpell}
              index={0}
              patch={patch}
              abilityHaste={demoHaste}
              ultHaste={demoUltHaste}
            />
          </div>
        </div>

        {/* COMPONENT 2: HasteControls */}
        <div className="rounded-xl border border-[#161922] bg-[#090b10] p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#141720] pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">HasteControls.jsx</span>
                <span className="px-1.5 py-0.2 rounded bg-[#4a82e8]/15 text-[#4a82e8] text-[10px]">Silnik Haste</span>
              </div>
              <p className="text-xs text-[#6e7a8e] mt-0.5">
                Pasek sterowania Ability Haste: suwak, stepper +/-, pole numeryczne, presety oraz rozwijany kalkulator przedmiotów i run.
              </p>
            </div>
            <div className="text-[11px] text-[#545e73]">
              Props: haste, setHaste, ultHaste, setUltHaste
            </div>
          </div>

          <div className="p-3 bg-[#050608] rounded-lg border border-[#141720]">
            <span className="text-[10px] uppercase font-bold text-[#444c5e] block mb-2">Podgląd na żywo:</span>
            <HasteControls 
              haste={demoHaste}
              setHaste={setDemoHaste}
              ultHaste={demoUltHaste}
              setUltHaste={setDemoUltHaste}
            />
          </div>
        </div>

        {/* COMPONENT 3: ChampionBanner */}
        <div className="rounded-xl border border-[#161922] bg-[#090b10] p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#141720] pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">ChampionBanner.jsx</span>
                <span className="px-1.5 py-0.2 rounded bg-[#4a82e8]/15 text-[#4a82e8] text-[10px]">Header Bohatera</span>
              </div>
              <p className="text-xs text-[#6e7a8e] mt-0.5">
                Kompaktowy pasek tożsamości postaci: awatar, nazwa, role, typ zasobu oraz szybkie przełączniki popularnych czempionów.
              </p>
            </div>
            <div className="text-[11px] text-[#545e73]">
              Props: champion, patch, onOpenSearch, onSelectQuickChamp
            </div>
          </div>

          <div className="p-3 bg-[#050608] rounded-lg border border-[#141720]">
            <span className="text-[10px] uppercase font-bold text-[#444c5e] block mb-2">Podgląd na żywo:</span>
            {championData && (
              <ChampionBanner 
                champion={championData}
                patch={patch}
                onOpenSearch={() => setDemoSearchOpen(true)}
                onSelectQuickChamp={() => {}}
              />
            )}
          </div>
        </div>

        {/* COMPONENT 4: PassiveCard */}
        <div className="rounded-xl border border-[#161922] bg-[#090b10] p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#141720] pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">PassiveCard.jsx</span>
                <span className="px-1.5 py-0.2 rounded bg-[#4a82e8]/15 text-[#4a82e8] text-[10px]">Pasywka</span>
              </div>
              <p className="text-xs text-[#6e7a8e] mt-0.5">
                Lekki, jednolinijkowy pasek umiejętności wrodzonej (Innate Passive) z możliwością rozwinięcia pełnego opisu.
              </p>
            </div>
            <div className="text-[11px] text-[#545e73]">
              Props: passive, patch
            </div>
          </div>

          <div className="p-3 bg-[#050608] rounded-lg border border-[#141720]">
            <span className="text-[10px] uppercase font-bold text-[#444c5e] block mb-2">Podgląd na żywo:</span>
            <PassiveCard passive={samplePassive} patch={patch} />
          </div>
        </div>

        {/* COMPONENT 5: MatchupCompare */}
        <div className="rounded-xl border border-[#161922] bg-[#090b10] p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#141720] pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">MatchupCompare.jsx</span>
                <span className="px-1.5 py-0.2 rounded bg-[#c8aa6e]/15 text-[#c8aa6e] text-[10px]">Versus 1v1</span>
              </div>
              <p className="text-xs text-[#6e7a8e] mt-0.5">
                Symetryczny moduł pojedynku – pozwala zestawić czar Twojej postaci z czarem przeciwnika i wylicza okno na darmową wymianę (*Trade Window*).
              </p>
            </div>
            <div className="text-[11px] text-[#545e73]">
              Props: champA, champB, hasteA, hasteB, setHasteB, patch, onOpenSearchB, onClose
            </div>
          </div>

          <div className="p-3 bg-[#050608] rounded-lg border border-[#141720]">
            <span className="text-[10px] uppercase font-bold text-[#444c5e] block mb-2">Podgląd na żywo:</span>
            {championData && (
              <MatchupCompare 
                champA={championData}
                champB={championData}
                hasteA={demoHaste}
                hasteB={demoHasteB}
                setHasteB={setDemoHasteB}
                patch={patch}
                onOpenSearchB={() => setDemoSearchOpen(true)}
                onClose={() => {}}
              />
            )}
          </div>
        </div>

        {/* COMPONENT 6: ChampionSearchModal */}
        <div className="rounded-xl border border-[#161922] bg-[#090b10] p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#141720] pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">ChampionSearchModal.jsx</span>
                <span className="px-1.5 py-0.2 rounded bg-[#4a82e8]/15 text-[#4a82e8] text-[10px]">useMemo + Kbd</span>
              </div>
              <p className="text-xs text-[#6e7a8e] mt-0.5">
                Modal wyszukiwania zoptymalizowany dla 173 postaci, filtrowaniem po rolach i obsługą klawiszy (Esc do zamknięcia, / do otwarcia).
              </p>
            </div>
            <button
              onClick={() => setDemoSearchOpen(true)}
              className="px-3 py-1.5 rounded bg-[#10131c] border border-[#222736] text-xs font-bold text-[#4a82e8] hover:bg-[#4a82e8] hover:text-white transition"
            >
              Przetestuj Modal Wyszukiwarki
            </button>
          </div>
        </div>

      </div>

      {/* Demo Search Modal */}
      <ChampionSearchModal 
        isOpen={demoSearchOpen}
        onClose={() => setDemoSearchOpen(false)}
        champions={champions}
        onSelectChampion={() => setDemoSearchOpen(false)}
        currentChampionId={championData?.id || 'Aatrox'}
        patch={patch}
        title="Demo: Wybierz Bohatera"
      />

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Compass, Play, Lock, X, ChevronLeft, ChevronRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { getLevel, type LevelData } from '../game/levels';
import { triggerHaptic } from '../utils/haptics';

interface SagaMapScreenProps {
  currentLevel: number;
  unlockedLevel: number;
  levelStars: Record<number, number>;
  onPlayLevel: (lvl: number) => void;
}

export interface WorldInfo {
  id: number;
  name: string;
  theme: string;
  start: number;
  end: number;
  color: string;
  badgeColor: string;
  icon: string;
}

export const WORLDS: WorldInfo[] = [
  {
    id: 1,
    name: 'Heritage Club',
    theme: 'Classic Timber Boards & Standard Rebounds',
    start: 1,
    end: 50,
    color: 'from-amber-600 to-yellow-600',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: '🏛️',
  },
  {
    id: 2,
    name: 'Magnetic Flux',
    theme: 'Dynamic Trajectories & High-Speed Cushion Play',
    start: 51,
    end: 150,
    color: 'from-cyan-600 to-blue-600',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: '⚡',
  },
  {
    id: 3,
    name: 'Glazed Marble Arena',
    theme: 'Low-Friction Smooth Glaze & Precision Banks',
    start: 151,
    end: 300,
    color: 'from-emerald-600 to-teal-600',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: '🧊',
  },
  {
    id: 4,
    name: 'Pinball Bumpers',
    theme: 'Lively Corner Rebounds & Multi-Angle Pockets',
    start: 301,
    end: 500,
    color: 'from-orange-600 to-rose-600',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    icon: '🎪',
  },
  {
    id: 5,
    name: 'Singularity Vortex',
    theme: 'Central Gravity Wells & Curved Trajectories',
    start: 501,
    end: 750,
    color: 'from-purple-600 to-pink-600',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: '🌀',
  },
  {
    id: 6,
    name: 'Grandmaster Odyssey',
    theme: 'Master-Tier Precision Challenges & Queen Snipes',
    start: 751,
    end: 999,
    color: 'from-yellow-500 to-amber-700',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    icon: '👑',
  },
];

export const SagaMapScreen: React.FC<SagaMapScreenProps> = ({
  currentLevel,
  unlockedLevel,
  levelStars,
  onPlayLevel,
}) => {
  // Determine initial world based on player's current unlocked level
  const initialWorldId = WORLDS.find(w => unlockedLevel >= w.start && unlockedLevel <= w.end)?.id || 1;
  const [selectedWorldId, setSelectedWorldId] = useState<number>(initialWorldId);
  const [showWorldDropdown, setShowWorldDropdown] = useState<boolean>(false);
  const [selectedPreview, setSelectedPreview] = useState<LevelData | null>(null);
  const activeNodeRef = useRef<HTMLDivElement | null>(null);

  const activeWorld = WORLDS.find(w => w.id === selectedWorldId) || WORLDS[0];

  // Auto-scroll to active unlocked level within the current world
  useEffect(() => {
    if (activeNodeRef.current) {
      activeNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedWorldId]);

  // Compute stars and cleared stats for active world
  const totalLevelsInWorld = activeWorld.end - activeWorld.start + 1;
  let clearedInWorld = 0;
  let starsInWorld = 0;
  for (let l = activeWorld.start; l <= activeWorld.end; l++) {
    const s = levelStars[l] || 0;
    if (s > 0) clearedInWorld++;
    starsInWorld += s;
  }
  const maxPossibleStars = totalLevelsInWorld * 3;

  const handlePrevWorld = () => {
    if (selectedWorldId > 1) {
      triggerHaptic.light();
      setSelectedWorldId(prev => prev - 1);
    }
  };

  const handleNextWorld = () => {
    if (selectedWorldId < WORLDS.length) {
      triggerHaptic.light();
      setSelectedWorldId(prev => prev + 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0814] text-white select-none overflow-hidden max-w-md mx-auto relative">
      {/* Top Universal Map Bar */}
      <div className="px-3.5 py-2.5 bg-[#161224] border-b border-purple-900/40 flex justify-between items-center z-10 shadow-md">
        <div className="flex items-center gap-2">
          <Compass className="text-amber-400" size={18} />
          <h2 className="text-xs font-black text-white tracking-wide uppercase">SAGA MAP</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
          <span>Max Unlocked:</span>
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black">
            Stage {unlockedLevel}
          </span>
        </div>
      </div>

      {/* World Selector Ribbon */}
      <div className="px-3 py-2 bg-gradient-to-b from-[#1c132b] to-[#120a20] border-b border-purple-900/30 flex items-center justify-between gap-1.5 shadow-inner">
        {/* Previous World Button */}
        <button
          onClick={handlePrevWorld}
          disabled={selectedWorldId <= 1}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            selectedWorldId > 1
              ? 'bg-purple-900/60 border border-purple-700/50 text-white active:scale-95 hover:bg-purple-800'
              : 'opacity-30 text-gray-600 cursor-not-allowed'
          }`}
          aria-label="Previous World"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Center World Selector Dropdown Pill */}
        <button
          onClick={() => {
            triggerHaptic.light();
            setShowWorldDropdown(true);
          }}
          className="flex-1 py-1.5 px-3 rounded-2xl bg-[#24173b] border border-amber-500/40 hover:border-amber-400 active:scale-98 transition-all flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-2 text-left overflow-hidden">
            <span className="text-lg">{activeWorld.icon}</span>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-300 truncate">
                  World {activeWorld.id}: {activeWorld.name}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-gray-300 font-bold shrink-0">
                  {activeWorld.start}–{activeWorld.end}
                </span>
              </div>
              <p className="text-[10px] text-gray-300 font-semibold truncate">
                ⭐ {starsInWorld}/{maxPossibleStars} Stars • {clearedInWorld}/{totalLevelsInWorld} Cleared
              </p>
            </div>
          </div>
          <ChevronDown size={15} className="text-amber-400 shrink-0 ml-1" />
        </button>

        {/* Next World Button */}
        <button
          onClick={handleNextWorld}
          disabled={selectedWorldId >= WORLDS.length}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            selectedWorldId < WORLDS.length
              ? 'bg-purple-900/60 border border-purple-700/50 text-white active:scale-95 hover:bg-purple-800'
              : 'opacity-30 text-gray-600 cursor-not-allowed'
          }`}
          aria-label="Next World"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* World Levels Grid (Renders ALL levels of selected world - No DOM overload!) */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3 relative scrollbar-none">
        {/* World Theme Sub-Banner */}
        <div
          className={`p-2.5 rounded-2xl bg-gradient-to-r ${activeWorld.color} text-white shadow-md flex items-center justify-between`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeWorld.icon}</span>
            <div>
              <span className="text-xs font-black uppercase tracking-wider block">
                World {activeWorld.id} • {activeWorld.name}
              </span>
              <p className="text-[10px] text-white/90 font-medium">
                {activeWorld.theme}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-black/30 border border-white/20">
            {totalLevelsInWorld} Stages
          </span>
        </div>

        {/* 5-Column Level Grid */}
        <div className="grid grid-cols-5 gap-2.5 pb-6">
          {Array.from({ length: totalLevelsInWorld }, (_, i) => activeWorld.start + i).map(lvl => {
            const isUnlocked = lvl <= unlockedLevel;
            const isCurrent = lvl === currentLevel;
            const stars = levelStars[lvl] || 0;

            return (
              <div
                key={lvl}
                ref={isCurrent ? activeNodeRef : null}
                onClick={() => {
                  if (isUnlocked) {
                    triggerHaptic.light();
                    setSelectedPreview(getLevel(lvl));
                  } else {
                    triggerHaptic.heavy();
                  }
                }}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer shadow-md ${
                  isCurrent
                    ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 text-amber-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-105 z-10 border-2 border-white'
                    : isUnlocked
                    ? 'bg-purple-950/70 border border-purple-700/60 text-purple-100 hover:border-amber-400/80 active:scale-95'
                    : 'bg-[#150f24]/60 border border-purple-950/40 text-gray-600 opacity-60 cursor-not-allowed'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <span className="text-xs font-black">{lvl}</span>
                    {/* Stars Earned */}
                    <div className="flex gap-0.5 mt-0.5">
                      <span className={`text-[9px] ${stars >= 1 ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                      <span className={`text-[9px] ${stars >= 2 ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                      <span className={`text-[9px] ${stars >= 3 ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                    </div>
                  </>
                ) : (
                  <Lock size={13} className="text-gray-600" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* World Picker Dropdown Modal */}
      {showWorldDropdown && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#161224] border border-amber-500/40 rounded-3xl p-4 shadow-2xl flex flex-col max-h-[80vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-2.5 border-b border-purple-900/40 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">🗺️</span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Select World</h3>
              </div>
              <button
                onClick={() => setShowWorldDropdown(false)}
                className="w-7 h-7 rounded-full bg-purple-900/50 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* List of 6 Worlds */}
            <div className="space-y-2 overflow-y-auto pr-1">
              {WORLDS.map(w => {
                const isWorldUnlocked = unlockedLevel >= w.start;
                const isSelected = w.id === selectedWorldId;

                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      triggerHaptic.light();
                      setSelectedWorldId(w.id);
                      setShowWorldDropdown(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-md scale-[1.01]'
                        : isWorldUnlocked
                        ? 'bg-purple-950/60 border-purple-800/40 hover:border-purple-600 text-gray-200'
                        : 'bg-black/30 border-purple-950/20 text-gray-600 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="text-2xl">{w.icon}</span>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-black ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                            World {w.id}: {w.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">
                          Stages {w.start} to {w.end}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isSelected ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-amber-950 text-[10px] font-black">
                          <CheckCircle2 size={11} />
                          <span>ACTIVE</span>
                        </div>
                      ) : isWorldUnlocked ? (
                        <span className="text-[10px] font-extrabold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50">
                          UNLOCKED
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 px-2 py-0.5 rounded-full bg-purple-950/40">
                          <Lock size={10} />
                          <span>Lv {w.start}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Level Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#161224] border border-amber-500/40 rounded-3xl p-5 shadow-2xl text-center flex flex-col items-center">
            {/* Modal Header */}
            <div className="w-full flex justify-between items-center pb-2 border-b border-purple-900/40 mb-3">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                STAGE {selectedPreview.levelNumber}
              </span>
              <button
                onClick={() => setSelectedPreview(null)}
                className="w-7 h-7 rounded-full bg-purple-900/50 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Level Icon */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 text-amber-950 flex items-center justify-center font-black text-2xl shadow-candy mb-2">
              {selectedPreview.levelNumber}
            </div>

            <h3 className="text-base font-black text-white">{selectedPreview.title}</h3>
            <p className="text-xs text-purple-200 mt-1 max-w-[240px]">
              {selectedPreview.themeDesc}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-2 w-full my-4 text-center">
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40">
                <span className="text-[10px] text-gray-400 font-bold block">Target:</span>
                <span className="text-xs font-black text-pink-300">
                  {selectedPreview.targetCount} Pucks + Queen
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40">
                <span className="text-[10px] text-gray-400 font-bold block">Strikes:</span>
                <span className="text-xs font-black text-cyan-300">
                  {selectedPreview.maxStrikes} Strikes
                </span>
              </div>
            </div>

            {/* Play Button */}
            <button
              onClick={() => {
                triggerHaptic.success();
                onPlayLevel(selectedPreview.levelNumber);
                setSelectedPreview(null);
              }}
              className="btn-candy w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-amber-950 font-black text-base shadow-candy flex items-center justify-center gap-2"
            >
              <Play size={18} fill="#451a03" className="stroke-[2.5]" />
              <span>PLAY STAGE {selectedPreview.levelNumber}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

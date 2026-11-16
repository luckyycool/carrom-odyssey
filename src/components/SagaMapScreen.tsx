import React, { useState, useEffect, useRef } from 'react';
import { Compass, Play, Lock, X } from 'lucide-react';
import { getLevel, type LevelData } from '../game/levels';
import { triggerHaptic } from '../utils/haptics';

interface SagaMapScreenProps {
  currentLevel: number;
  unlockedLevel: number;
  levelStars: Record<number, number>;
  onPlayLevel: (lvl: number) => void;
}

export const SagaMapScreen: React.FC<SagaMapScreenProps> = ({
  currentLevel,
  unlockedLevel,
  levelStars,
  onPlayLevel,
}) => {
  const [selectedPreview, setSelectedPreview] = useState<LevelData | null>(null);
  const activeNodeRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to current unlocked level on mount
  useEffect(() => {
    if (activeNodeRef.current) {
      activeNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const worlds = [
    { id: 1, name: 'World 1: Heritage Club', start: 1, end: 50, color: 'from-amber-500 to-pink-500' },
    { id: 2, name: 'World 2: Magnetic Flux', start: 51, end: 150, color: 'from-cyan-500 to-blue-600' },
    { id: 3, name: 'World 3: Glazed Marble Arena', start: 151, end: 300, color: 'from-teal-400 to-indigo-500' },
    { id: 4, name: 'World 4: Pinball Bumpers', start: 301, end: 500, color: 'from-orange-500 to-rose-600' },
    { id: 5, name: 'World 5: Singularity Vortex', start: 501, end: 750, color: 'from-purple-500 to-pink-600' },
    { id: 6, name: 'World 6: Grandmaster Odyssey', start: 751, end: 999, color: 'from-amber-400 to-yellow-600' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0814] text-white select-none overflow-hidden max-w-md mx-auto relative">
      {/* Top Map Header */}
      <div className="px-4 py-2.5 bg-[#161224] border-b border-purple-900/40 flex justify-between items-center z-10 shadow-md">
        <div className="flex items-center gap-2">
          <Compass className="text-pink-400" size={20} />
          <h2 className="text-sm font-black text-white">Saga Map (999 Levels)</h2>
        </div>
        <span className="text-xs font-bold text-gray-400">
          Max Unlocked: <span className="text-amber-300 font-extrabold">{unlockedLevel}</span>
        </span>
      </div>

      {/* Vertical Winding Path Map */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 relative">
        {worlds.map(w => (
          <div key={w.id} className="space-y-4">
            {/* World Milestone Banner */}
            <div
              className={`p-3 rounded-2xl bg-gradient-to-r ${w.color} shadow-lg text-white font-black text-xs flex justify-between items-center`}
            >
              <span>{w.name}</span>
              <span className="text-[10px] bg-black/30 px-2.5 py-0.5 rounded-full font-bold">
                Lvls {w.start} – {w.end}
              </span>
            </div>

            {/* Display representative level nodes for current world view */}
            <div className="grid grid-cols-5 gap-3">
              {Array.from(
                { length: Math.min(25, w.end - w.start + 1) },
                (_, i) => w.start + i
              ).map(lvl => {
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
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-gradient-to-tr from-pink-500 to-amber-400 text-white shadow-glow-gold scale-110 z-10'
                        : isUnlocked
                        ? 'bg-purple-950/70 border border-purple-800/50 text-purple-200 hover:border-pink-500/60 active:scale-95'
                        : 'bg-purple-950/20 border border-purple-900/20 text-gray-600 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <span className="text-xs font-black">{lvl}</span>
                        {/* Stars Earned */}
                        <div className="flex gap-0.5 mt-0.5">
                          <span className={`text-[8px] ${stars >= 1 ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                          <span className={`text-[8px] ${stars >= 2 ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                          <span className={`text-[8px] ${stars >= 3 ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                        </div>
                      </>
                    ) : (
                      <Lock size={14} className="text-gray-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Level Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161224] border border-purple-800/60 rounded-3xl p-5 shadow-2xl animate-pop-in text-center flex flex-col items-center">
            {/* Modal Header */}
            <div className="w-full flex justify-between items-center pb-2 border-b border-purple-900/40 mb-3">
              <span className="text-xs font-bold text-gray-400">Level Preview</span>
              <button
                onClick={() => setSelectedPreview(null)}
                className="w-7 h-7 rounded-full bg-purple-900/50 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Level Icon & Badge */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center font-black text-2xl text-white shadow-candy mb-2">
              {selectedPreview.levelNumber}
            </div>

            <h3 className="text-lg font-black text-white">{selectedPreview.title}</h3>
            <p className="text-xs text-purple-200 mt-1 max-w-[240px]">
              {selectedPreview.themeDesc}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-2 w-full my-4 text-left">
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40">
                <span className="text-[10px] text-gray-400 font-bold block">Target Pucks:</span>
                <span className="text-xs font-black text-pink-300">
                  {selectedPreview.targetCount} Pucks + Queen
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40">
                <span className="text-[10px] text-gray-400 font-bold block">Max Strikes:</span>
                <span className="text-xs font-black text-cyan-300">
                  {selectedPreview.maxStrikes} Strikes
                </span>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => {
                triggerHaptic.success();
                onPlayLevel(selectedPreview.levelNumber);
                setSelectedPreview(null);
              }}
              className="btn-candy w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-black text-base shadow-candy flex items-center justify-center gap-2"
            >
              <Play size={18} fill="white" />
              <span>PLAY LEVEL {selectedPreview.levelNumber}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

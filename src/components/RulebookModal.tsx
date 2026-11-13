import React, { useState } from 'react';
import { BookOpen, Crown, ShieldAlert, Sliders, RotateCw, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface RulebookModalProps {
  onClose: () => void;
}

export const RulebookModal: React.FC<RulebookModalProps> = ({ onClose }) => {
  const [activePage, setActivePage] = useState<number>(0);

  const pages = [
    {
      title: 'The Queen (Red Puck) & Cover Rule',
      icon: Crown,
      badge: 'ICF Rule #1',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-600/50',
      content: (
        <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-2xl">
            <span className="font-bold text-rose-300 block mb-1">👑 Sinking the Queen is Not Enough:</span>
            To claim the Queen, you MUST &quot;Cover&quot; her by pocketing another regular White puck either in the <strong>same shot</strong> or on the <strong>very next turn</strong>.
          </div>
          <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-2xl">
            <span className="font-bold text-amber-300 block mb-1">⚠️ Uncovered Queen Penalty:</span>
            If you miss on the cover turn, the Queen is <strong>UNCOVERED</strong> and immediately returns to the center circle of the board!
          </div>
          <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-2xl">
            <span className="font-bold text-amber-300 block mb-1">🚫 Queen Precedence Law:</span>
            You <strong>cannot clear the board</strong> if the Queen is still unpocketed. The Queen must be pocketed before the final White puck!
          </div>
        </div>
      ),
    },
    {
      title: 'Fouls & Due Penalty System',
      icon: ShieldAlert,
      badge: 'ICF Rule #2',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-600/50',
      content: (
        <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-2xl">
            <span className="font-bold text-amber-300 block mb-1">🚨 Striker Pocketed (Foul / Scratch):</span>
            Pocketing your striker is a <strong>FOUL</strong>. Exactly 1 previously pocketed regular carrom man (White or Black) returns to the center as a penalty.
          </div>
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl">
            <span className="font-bold text-emerald-300 block mb-1">🛡️ Protected Queen Law:</span>
            If the Queen was already legally pocketed and covered earlier, she is <strong>PERMANENTLY SECURED</strong> and is <strong>NEVER returned</strong> for a foul! Only regular pucks are returned.
          </div>
          <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-2xl">
            <span className="font-bold text-rose-300 block mb-1">❌ No Win on a Foul:</span>
            Pocketing the last puck while the striker also drops in the pocket is a <strong>FOUL</strong>, not a victory!
          </div>
        </div>
      ),
    },
    {
      title: 'Striker Baseline & Analog Aiming',
      icon: Sliders,
      badge: 'Tactile Controls',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-600/50',
      content: (
        <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-2xl">
            <span className="font-bold text-cyan-300 block mb-1">🎚️ Baseline Slider & Obstruction:</span>
            Slide your thumb along the bottom slider to position the striker. The game automatically prevents placing the striker on top of pucks sitting near the baseline!
          </div>
          <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-2xl">
            <span className="font-bold text-pink-300 block mb-1">🎯 Analog Force Curve (Gentle Taps):</span>
            Pull back on the striker to aim. A delicate short pull produces a <strong>gentle slow nudge</strong> for precision positioning; a full pull releases a <strong>maximum-power break smash</strong>!
          </div>
        </div>
      ),
    },
    {
      title: 'Choice B: Auto-90° Rotation',
      icon: RotateCw,
      badge: 'Mobile Innovation',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-600/50',
      content: (
        <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl">
            <span className="font-bold text-emerald-300 block mb-1">🔥 Sink = Keep Baseline:</span>
            Whenever you pocket a puck, the board does <strong>NOT rotate</strong>! You stay on the same baseline, maintain your streak, and build up high-multiplier combos!
          </div>
          <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-2xl">
            <span className="font-bold text-purple-300 block mb-1">🔄 Miss = 90° Clockwise Spin:</span>
            Only when you miss (or foul) does the board smoothly spin 90° clockwise, presenting the next baseline directly in front of your thumbs.
          </div>
        </div>
      ),
    },
  ];

  const current = pages[activePage];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#161224] border border-purple-800/60 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-pop-in">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-purple-900/40">
          <div className="flex items-center gap-2">
            <BookOpen className="text-pink-400" size={20} />
            <h2 className="text-base font-black text-white">Official Carrom Rules</h2>
          </div>
          <button
            onClick={() => {
              triggerHaptic.light();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-gray-300 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Page Content */}
        <div className="my-4 flex-1 overflow-y-auto pr-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-900/60 flex items-center justify-center text-pink-400">
                <Icon size={18} />
              </div>
              <h3 className="font-black text-sm text-white">{current.title}</h3>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${current.badgeColor}`}>
              {current.badge}
            </span>
          </div>

          {current.content}
        </div>

        {/* Carousel Navigation */}
        <div className="pt-3 border-t border-purple-900/40 flex justify-between items-center text-xs">
          <button
            onClick={() => {
              triggerHaptic.light();
              setActivePage(prev => Math.max(0, prev - 1));
            }}
            disabled={activePage === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-800/40 text-gray-300 disabled:opacity-30 active:scale-95 font-bold"
          >
            <ChevronLeft size={14} /> Prev
          </button>

          <div className="flex gap-1.5">
            {pages.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activePage ? 'bg-pink-500 w-5' : 'bg-purple-900/60'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              triggerHaptic.light();
              setActivePage(prev => Math.min(pages.length - 1, prev + 1));
            }}
            disabled={activePage === pages.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-800/40 text-gray-300 disabled:opacity-30 active:scale-95 font-bold"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

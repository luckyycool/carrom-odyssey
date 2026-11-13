import React, { useState } from 'react';
import { X, Sparkles, Play, Award } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

export interface SpinPrize {
  id: number;
  label: string;
  type: 'coins' | 'powder';
  amount: number;
  color: string;
}

const PRIZES: SpinPrize[] = [
  { id: 0, label: '🪙 50', type: 'coins', amount: 50, color: '#f59e0b' },
  { id: 1, label: '⚡ +10', type: 'powder', amount: 10, color: '#06b6d4' },
  { id: 2, label: '🪙 100', type: 'coins', amount: 100, color: '#ea580c' },
  { id: 3, label: '⚡ +15', type: 'powder', amount: 15, color: '#8b5cf6' },
  { id: 4, label: '🪙 250', type: 'coins', amount: 250, color: '#10b981' },
  { id: 5, label: '🪙 75', type: 'coins', amount: 75, color: '#f43f5e' },
  { id: 6, label: '⚡ +20', type: 'powder', amount: 20, color: '#3b82f6' },
  { id: 7, label: '👑 500', type: 'coins', amount: 500, color: '#eab308' },
];

interface LuckySpinModalProps {
  canSpinFree: boolean;
  onGrantPrize: (prize: SpinPrize) => void;
  onRequestAdSpin: () => void;
  onClose: () => void;
}

export const LuckySpinModal: React.FC<LuckySpinModalProps> = ({
  canSpinFree,
  onGrantPrize,
  onRequestAdSpin,
  onClose,
}) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [wonPrize, setWonPrize] = useState<SpinPrize | null>(null);

  const startSpin = (isAd: boolean = false) => {
    if (isSpinning) return;

    if (!canSpinFree && !isAd) {
      onRequestAdSpin();
      return;
    }

    setIsSpinning(true);
    setWonPrize(null);
    triggerHaptic.medium();
    sounds.playRotateWhoosh();

    // Random prize index 0-7
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const sliceAngle = 360 / PRIZES.length;
    // Calculate target degree with 5 full rotations (1800 deg)
    const targetDeg = rotationDeg + 1800 + (360 - (prizeIndex * sliceAngle + sliceAngle / 2));

    setRotationDeg(targetDeg);

    setTimeout(() => {
      setIsSpinning(false);
      const prize = PRIZES[prizeIndex];
      setWonPrize(prize);
      sounds.playLevelClear();
      triggerHaptic.success();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.55 } });
      onGrantPrize(prize);
    }, 4000);
  };

  const sliceAngle = 360 / PRIZES.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#26120b] via-[#1a0a1f] to-[#100615] border-2 border-amber-500/50 p-5 shadow-2xl flex flex-col items-center text-white overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-black/40 text-gray-400 hover:text-white border border-white/10 active:scale-95 disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black mb-1">
          <Sparkles size={13} />
          <span>FESTIVE LUCKY CHAKRA</span>
        </div>
        <h3 className="text-xl font-black text-white text-center">SPIN TO WIN</h3>
        <p className="text-[11px] text-gray-300 text-center mb-4">
          Daily Free Spin • Coins, Powder & Jackpot
        </p>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 flex items-center justify-center my-2">
          {/* Top Pointer Arrow */}
          <div className="absolute -top-3 z-30 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
          </div>

          {/* Rotating Wheel */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] relative overflow-hidden transition-transform duration-[4000ms] ease-out"
            style={{
              transform: `rotate(${rotationDeg}deg)`,
            }}
          >
            {/* Slices rendered using SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {PRIZES.map((prize, idx) => {
                const startAngle = (idx * sliceAngle - 90) * (Math.PI / 180);
                const endAngle = ((idx + 1) * sliceAngle - 90) * (Math.PI / 180);

                const x1 = 50 + 50 * Math.cos(startAngle);
                const y1 = 50 + 50 * Math.sin(startAngle);
                const x2 = 50 + 50 * Math.cos(endAngle);
                const y2 = 50 + 50 * Math.sin(endAngle);

                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                const textAngle = idx * sliceAngle + sliceAngle / 2;
                const rad = (textAngle - 90) * (Math.PI / 180);
                const tx = 50 + 32 * Math.cos(rad);
                const ty = 50 + 32 * Math.sin(rad);

                return (
                  <g key={prize.id}>
                    <path
                      d={pathData}
                      fill={prize.color}
                      stroke="#1e100c"
                      strokeWidth="0.8"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill="#ffffff"
                      fontSize="5"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                    >
                      {prize.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Center Golden Knob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 border-2 border-white shadow-xl flex items-center justify-center">
              <Award size={20} className="text-amber-950 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Won Prize Banner */}
        {wonPrize && (
          <div className="my-2 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500 text-center animate-pop-in">
            <span className="text-[10px] uppercase font-bold text-emerald-300">Prize Claimed!</span>
            <p className="text-sm font-black text-white">
              {wonPrize.type === 'coins' ? `🪙 ${wonPrize.amount} Coins Added!` : `⚡ ${wonPrize.amount} Striker Matches Added!`}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="w-full mt-3 space-y-2">
          {canSpinFree ? (
            <button
              onClick={() => startSpin(false)}
              disabled={isSpinning}
              className="btn-candy w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-amber-950 font-black text-sm shadow-[0_4px_0_#9a3412] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 transition-all"
            >
              <Sparkles size={16} fill="#451a03" />
              <span>{isSpinning ? 'SPINNING...' : 'SPIN FREE NOW!'}</span>
            </button>
          ) : (
            <button
              onClick={() => onRequestAdSpin()}
              disabled={isSpinning}
              className="btn-candy w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 font-black text-sm shadow-[0_4px_0_#065f46] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 transition-all"
            >
              <Play size={16} fill="#064e3b" />
              <span>SPIN AGAIN (WATCH 5s VIDEO)</span>
            </button>
          )}

          <p className="text-[10px] text-gray-400 text-center">
            {canSpinFree ? '1 Free spin daily. Extra spins via short rewarded video.' : 'Next free spin tomorrow!'}
          </p>
        </div>
      </div>
    </div>
  );
};

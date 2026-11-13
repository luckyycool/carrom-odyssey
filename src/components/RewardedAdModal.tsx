import React, { useState, useEffect } from 'react';
import { Gift, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface RewardedAdModalProps {
  rewardTitle: string;
  rewardDesc: string;
  onRewardGranted: () => void;
  onClose: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  rewardTitle,
  rewardDesc,
  onRewardGranted,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(5);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setTimeout(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsCompleted(true);
      sounds.playCoinSound();
      triggerHaptic.heavy();
    }
  }, [secondsLeft]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#181329] border border-purple-700/60 rounded-3xl p-5 shadow-2xl text-center animate-pop-in flex flex-col items-center">
        {/* Ad Badge */}
        <div className="w-full flex justify-between items-center mb-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          <span className="px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-700/40">
            Rewarded Partner Video
          </span>
          <span className="text-amber-400 font-black">
            {isCompleted ? 'Reward Ready!' : `Ad ends in ${secondsLeft}s`}
          </span>
        </div>

        {/* Video Canvas Simulation Screen */}
        <div className="w-full aspect-video rounded-2xl bg-gradient-to-tr from-purple-900 via-pink-900 to-indigo-950 border border-purple-600/40 p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner my-2">
          {/* Animated Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,64,129,0.25)_0%,transparent_70%)] animate-pulse" />

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center mb-2 shadow-lg z-10">
            <Gift size={26} className="text-white animate-bounce" />
          </div>

          <h3 className="text-sm font-black text-white text-candy-stroke z-10">
            {rewardTitle}
          </h3>
          <p className="text-[11px] text-purple-200 mt-1 max-w-[220px] z-10">
            {rewardDesc}
          </p>

          {/* Progress Bar */}
          <div className="w-4/5 h-1.5 bg-black/40 rounded-full mt-3 overflow-hidden z-10">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-amber-400 transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        {isCompleted ? (
          <button
            onClick={() => {
              triggerHaptic.success();
              onRewardGranted();
            }}
            className="btn-candy w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 font-black text-sm flex items-center justify-center gap-2 shadow-candy mt-3"
          >
            <CheckCircle2 size={18} />
            <span>CLAIM REWARD NOW!</span>
          </button>
        ) : (
          <button
            disabled
            className="w-full py-3 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-gray-500 font-bold text-xs mt-3 cursor-not-allowed"
          >
            Reward unlocking in {secondsLeft} seconds...
          </button>
        )}

        <button
          onClick={onClose}
          className="text-gray-500 text-[11px] font-bold mt-3 hover:text-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

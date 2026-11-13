import React from 'react';
import { Trophy, CheckCircle2, Lock, X } from 'lucide-react';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';

interface AchievementsModalProps {
  unlockedLevel: number;
  stars: number;
  coins: number;
  achievements: Record<string, boolean>;
  onClaimAchievement: (id: string, reward: number) => void;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  unlockedLevel,
  stars,
  achievements,
  onClaimAchievement,
  onClose,
}) => {
  const list = [
    {
      id: 'first_strike',
      title: 'First Blood',
      desc: 'Complete Level 1 with 3 stars.',
      reward: 100,
      isUnlocked: stars >= 3,
    },
    {
      id: 'queen_master',
      title: 'Queen Conqueror',
      desc: 'Conquer the Queen in World 1.',
      reward: 200,
      isUnlocked: unlockedLevel >= 5,
    },
    {
      id: 'magnetic_mastery',
      title: 'Flux Navigator',
      desc: 'Clear the Downstairs Magnetic field (Level 3+).',
      reward: 250,
      isUnlocked: unlockedLevel >= 4,
    },
    {
      id: 'star_collector',
      title: 'Star Collector',
      desc: 'Accumulate 25+ Golden Stars in the Odyssey.',
      reward: 350,
      isUnlocked: stars >= 25,
    },
    {
      id: 'world_traveler',
      title: 'World Explorer',
      desc: 'Advance to World 2: Magnetic Flux (Level 51+).',
      reward: 500,
      isUnlocked: unlockedLevel >= 51,
    },
    {
      id: 'grandmaster',
      title: 'Centurion Grandmaster',
      desc: 'Reach Level 100 in the Odyssey Campaign.',
      reward: 1000,
      isUnlocked: unlockedLevel >= 100,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#161224] border border-purple-800/60 rounded-3xl p-5 shadow-2xl animate-pop-in flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-purple-900/40">
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-400" size={20} />
            <h2 className="text-base font-black text-white">Trophies & Milestones</h2>
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

        {/* Achievements List */}
        <div className="my-3 space-y-2.5 flex-1 overflow-y-auto pr-1">
          {list.map(item => {
            const isClaimed = !!achievements[item.id];
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  isClaimed
                    ? 'bg-purple-950/30 border-purple-900/30 opacity-70'
                    : item.isUnlocked
                    ? 'bg-gradient-to-r from-purple-950/80 to-amber-950/50 border-amber-500/50 shadow-md'
                    : 'bg-[#181329] border-purple-900/30 opacity-60'
                }`}
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-white">{item.title}</span>
                    {isClaimed && <CheckCircle2 size={13} className="text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{item.desc}</p>
                  <span className="text-[10px] font-extrabold text-amber-400 mt-1 block">
                    Reward: 🪙 {item.reward} Coins
                  </span>
                </div>

                <div>
                  {isClaimed ? (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      Claimed
                    </span>
                  ) : item.isUnlocked ? (
                    <button
                      onClick={() => {
                        onClaimAchievement(item.id, item.reward);
                        sounds.playLevelClear();
                        triggerHaptic.success();
                        confetti({ particleCount: 50, spread: 60 });
                      }}
                      className="btn-candy px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-black text-xs shadow-md"
                    >
                      CLAIM
                    </button>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-purple-900/40 flex items-center justify-center text-gray-500">
                      <Lock size={13} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

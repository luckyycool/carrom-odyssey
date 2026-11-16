import React from 'react';
import { Settings, Plus } from 'lucide-react';

interface HeaderBarProps {
  coins: number;
  stars: number;
  level: number;
  onOpenSettings: () => void;
  onOpenShop: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  coins,
  stars,
  level,
  onOpenSettings,
  onOpenShop,
}) => {
  return (
    <div className="w-full max-w-md flex items-center justify-between px-3 py-2 bg-[#161224] border-b border-purple-900/40 select-none z-30 shadow-md">
      {/* Player Profile & Level */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-[#1e1730] rounded-[14px] flex items-center justify-center font-black text-sm text-amber-300">
            {level}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-cyan-400">
              CARROM ODYSSEY
            </span>
          </div>
          <p className="text-[10px] text-gray-400 font-bold">Lvl {level} Grandmaster</p>
        </div>
      </div>

      {/* Stats Wallets: Stars & Coins */}
      <div className="flex items-center gap-2">
        {/* Star Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-950/70 border border-purple-800/40 shadow-inner">
          <span className="text-amber-400 text-xs">★</span>
          <span className="text-xs font-extrabold text-amber-300">{stars}</span>
        </div>

        {/* Coins Wallet */}
        <button
          onClick={onOpenShop}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-300 shadow-inner hover:bg-amber-900/50 active:scale-95 transition-all"
        >
          <span className="text-xs">🪙</span>
          <span className="text-xs font-extrabold">{coins}</span>
          <div className="w-4 h-4 rounded-full bg-amber-500 text-amber-950 flex items-center justify-center font-black text-[10px]">
            <Plus size={10} strokeWidth={3} />
          </div>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-200 hover:text-amber-300 active:scale-95 transition-all"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
};

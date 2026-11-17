import React from 'react';
import {
  Play,
  Users,
  Bot,
  Calendar,
  Zap,
  BookOpen,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface HomeScreenProps {
  currentLevel: number;
  unlockedLevel: number;
  stars: number;
  canSpinFree?: boolean;
  onOpenLuckySpin: () => void;
  onPlayCampaign: (lvl: number) => void;
  onStartPassAndPlay: () => void;
  onStartAiMatch: () => void;
  onStartDailyTrickshot: () => void;
  onStartZenMode: () => void;
  onOpenSagaMap: () => void;
  onOpenRulebook: () => void;
  onOpenShop: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentLevel,
  unlockedLevel: _unlockedLevel,
  stars: _stars,
  canSpinFree = false,
  onOpenLuckySpin,
  onPlayCampaign,
  onStartPassAndPlay,
  onStartAiMatch,
  onStartDailyTrickshot,
  onStartZenMode,
  onOpenSagaMap: _onOpenSagaMap,
  onOpenRulebook,
  onOpenShop,
}) => {
  const worldName =
    currentLevel <= 50
      ? 'WORLD 1 • HERITAGE CLUB'
      : currentLevel <= 150
      ? 'WORLD 2 • MAGNETIC FLUX'
      : currentLevel <= 300
      ? 'WORLD 3 • GLAZED MARBLE'
      : currentLevel <= 500
      ? 'WORLD 4 • PINBALL BUMPERS'
      : currentLevel <= 750
      ? 'WORLD 5 • SINGULARITY VORTEX'
      : 'WORLD 6 • GRANDMASTER';

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#1a0c08] via-[#120718] to-[#09040e] text-white select-none overflow-y-auto px-3.5 py-3 space-y-3 max-w-md mx-auto scrollbar-none">
      {/* Hero 3D Carrom Centerpiece Stage */}
      <div className="w-full rounded-3xl bg-gradient-to-b from-[#2a140d] via-[#1a0a1e] to-[#120617] border-2 border-amber-600/40 p-4 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Festive Golden Aura & Particles */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-4 w-32 h-32 bg-pink-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Realistic Mini Carrom Board Illustration Stage */}
        <div className="relative w-36 h-36 rounded-2xl bg-[#341b11] border-4 border-[#4a2818] shadow-2xl flex items-center justify-center p-2 mb-2.5 transform hover:scale-105 transition-all">
          {/* Surface */}
          <div className="w-full h-full rounded-xl bg-[#edd9b7] border border-[#d8be96] relative flex items-center justify-center overflow-hidden shadow-inner">
            {/* Corner Pockets */}
            <div className="absolute top-1 left-1 w-3.5 h-3.5 rounded-full bg-[#1a0c06] border border-amber-900 shadow-inner" />
            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#1a0c06] border border-amber-900 shadow-inner" />
            <div className="absolute bottom-1 left-1 w-3.5 h-3.5 rounded-full bg-[#1a0c06] border border-amber-900 shadow-inner" />
            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#1a0c06] border border-amber-900 shadow-inner" />

            {/* Baseline Guide */}
            <div className="absolute bottom-2.5 left-3 right-3 h-0.5 bg-rose-600/60" />
            <div className="absolute bottom-2 left-2.5 w-1.5 h-1.5 rounded-full bg-rose-600" />
            <div className="absolute bottom-2 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-600" />

            {/* Center Mandala with Ruby Queen */}
            <div className="w-11 h-11 rounded-full border-2 border-amber-600/60 flex items-center justify-center relative">
              {/* Queen (Red) */}
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-rose-700 to-red-500 border border-yellow-300 shadow-md flex items-center justify-center z-10">
                <div className="w-1 h-1 rounded-full bg-yellow-300" />
              </div>

              {/* Guard Pucks */}
              <div className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-white border border-gray-400 shadow-xs" />
              <div className="absolute -bottom-1 w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-700 shadow-xs" />
              <div className="absolute -left-1 w-2.5 h-2.5 rounded-full bg-white border border-gray-400 shadow-xs" />
              <div className="absolute -right-1 w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-700 shadow-xs" />
            </div>

            {/* Ready Striker on Baseline */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Level Progression Label */}
        <div className="text-center z-10 mb-2.5">
          <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 px-3 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40">
            {worldName}
          </span>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 mt-0.5 drop-shadow-md tracking-wider">
            STAGE {currentLevel}
          </h2>
        </div>

        {/* Big Juicy 3D Golden Play Button */}
        <button
          onClick={() => {
            triggerHaptic.success();
            onPlayCampaign(currentLevel);
          }}
          className="btn-candy w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-amber-950 font-black text-lg shadow-[0_6px_0_#9a3412,0_12px_24px_rgba(245,158,11,0.45)] flex items-center justify-center gap-2 active:translate-y-1 active:shadow-[0_2px_0_#9a3412] transition-all z-10 cursor-pointer"
        >
          <Play size={22} fill="#451a03" className="stroke-[2.5]" />
          <span>PLAY STAGE {currentLevel}</span>
        </button>
      </div>

      {/* Lucky Fortune Chakra Banner */}
      <button
        onClick={() => {
          triggerHaptic.light();
          onOpenLuckySpin();
        }}
        className="w-full px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600/25 via-yellow-600/15 to-orange-600/25 border border-amber-400/40 flex items-center justify-between active:scale-98 transition-all shadow-md group cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center font-black shadow-md group-hover:rotate-45 transition-transform duration-500 text-xl">
            🎡
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-amber-300">Lucky Chakra</span>
              {canSpinFree && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-[9px] font-black text-white animate-pulse">
                  FREE
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-amber-200/80">Spin & Win Rewards</span>
          </div>
        </div>
        <span className="text-xs font-black text-amber-300 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/40 group-hover:bg-amber-500 group-hover:text-amber-950 transition-all">
          SPIN ▶
        </span>
      </button>

      {/* Game Modes (2x2 Grid - 2-Line Game Format, Punchy & Fancy) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 1 vs 1 / Pass & Play */}
        <button
          onClick={() => {
            triggerHaptic.light();
            onStartPassAndPlay();
          }}
          className="p-3 rounded-2xl bg-gradient-to-br from-[#2b1016] to-[#170a0e] border border-rose-700/40 hover:border-rose-500/70 text-left transition-all active:scale-95 flex items-center gap-2.5 shadow-md group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-600/25 border border-rose-500/40 text-rose-300 flex items-center justify-center shadow-sm shrink-0">
            <Users size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
              1 vs 1
            </span>
            <span className="text-[11px] font-extrabold text-rose-300">
              Pass & Play
            </span>
          </div>
        </button>

        {/* AI Match Duel / Quick Match */}
        <button
          onClick={() => {
            triggerHaptic.light();
            onStartAiMatch();
          }}
          className="p-3 rounded-2xl bg-gradient-to-br from-[#0c1f2d] to-[#07111a] border border-cyan-700/40 hover:border-cyan-500/70 text-left transition-all active:scale-95 flex items-center gap-2.5 shadow-md group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-600/25 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow-sm shrink-0">
            <Bot size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
              AI Duel
            </span>
            <span className="text-[11px] font-extrabold text-cyan-300">
              Quick Match
            </span>
          </div>
        </button>

        {/* Daily Puzzle */}
        <button
          onClick={() => {
            triggerHaptic.light();
            onStartDailyTrickshot();
          }}
          className="p-3 rounded-2xl bg-gradient-to-br from-[#0e2617] to-[#08150d] border border-emerald-600/40 hover:border-emerald-500/70 text-left transition-all active:scale-95 flex items-center gap-2.5 shadow-md group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600/25 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shadow-sm shrink-0">
            <Calendar size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
              Daily Puzzle
            </span>
            <span className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1">
              🪙 +150 Coins
            </span>
          </div>
        </button>

        {/* Zen Sandbox Practice / Free Practice */}
        <button
          onClick={() => {
            triggerHaptic.light();
            onStartZenMode();
          }}
          className="p-3 rounded-2xl bg-gradient-to-br from-[#25102d] to-[#130718] border border-purple-600/40 hover:border-purple-500/70 text-left transition-all active:scale-95 flex items-center gap-2.5 shadow-md group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600/25 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-sm shrink-0">
            <Zap size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
              Zen Mode
            </span>
            <span className="text-[11px] font-extrabold text-purple-300">
              Free Practice
            </span>
          </div>
        </button>
      </div>

      {/* Bottom Quick Links: Rulebook & Locker */}
      <div className="flex gap-2.5 pt-1">
        <button
          onClick={() => {
            triggerHaptic.light();
            onOpenRulebook();
          }}
          className="flex-1 p-2.5 rounded-2xl bg-[#1b1226] border border-purple-800/40 hover:border-amber-500/40 flex items-center justify-between active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center">
              <BookOpen size={16} />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-xs text-white">Rulebook</span>
              <span className="text-[10px] text-pink-300 font-semibold">Official Laws</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-gray-400" />
        </button>

        <button
          onClick={() => {
            triggerHaptic.light();
            onOpenShop();
          }}
          className="flex-1 p-2.5 rounded-2xl bg-[#1b1226] border border-purple-800/40 hover:border-amber-500/40 flex items-center justify-between active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-xs text-white">Locker & Shop</span>
              <span className="text-[10px] text-amber-300 font-semibold">Custom Gear</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
};

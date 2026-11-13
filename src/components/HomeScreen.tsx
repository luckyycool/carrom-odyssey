import React from 'react';
import {
  Play,
  Users,
  Bot,
  Calendar,
  Sparkles,
  BookOpen,
  ChevronRight,
  Zap,
  ShoppingBag,
  Award,
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
  unlockedLevel,
  stars,
  canSpinFree = false,
  onOpenLuckySpin,
  onPlayCampaign,
  onStartPassAndPlay,
  onStartAiMatch,
  onStartDailyTrickshot,
  onStartZenMode,
  onOpenSagaMap,
  onOpenRulebook,
  onOpenShop,
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#1a0c08] via-[#120718] to-[#09040e] text-white select-none overflow-y-auto px-3.5 py-2.5 space-y-3.5 max-w-md mx-auto scrollbar-none">
      {/* Festive Championship Club Header Badge */}
      <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-amber-950/80 border border-amber-500/30 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center text-amber-950 shadow-md">
            <Award size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                ROYAL CLUB CHAMPIONSHIP
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600/80 text-[9px] font-black text-white">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-amber-100/80 font-medium">
              World 1: Heritage Arena • <span className="text-yellow-400 font-bold">★ {stars} Stars</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            triggerHaptic.light();
            onOpenSagaMap();
          }}
          className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-[11px] font-extrabold text-amber-300 flex items-center gap-1 active:scale-95 transition-all shadow-sm"
        >
          <span>Saga</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Hero 3D Carrom Centerpiece Stage */}
      <div className="w-full rounded-3xl bg-gradient-to-b from-[#2a140d] via-[#1a0a1e] to-[#120617] border-2 border-amber-600/40 p-4 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Festive Golden Aura & Particles */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-4 w-32 h-32 bg-pink-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Realistic Mini Carrom Board Illustration Stage */}
        <div className="relative w-40 h-40 rounded-2xl bg-[#341b11] border-4 border-[#4a2818] shadow-2xl flex items-center justify-center p-2 mb-3 transform hover:scale-105 transition-all">
          {/* Surface */}
          <div className="w-full h-full rounded-xl bg-[#edd9b7] border border-[#d8be96] relative flex items-center justify-center overflow-hidden shadow-inner">
            {/* Corner Pockets */}
            <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#1a0c06] border border-amber-900 shadow-inner" />
            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#1a0c06] border border-amber-900 shadow-inner" />
            <div className="absolute bottom-1 left-1 w-4 h-4 rounded-full bg-[#1a0c06] border border-amber-900 shadow-inner" />
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#1a0c06] border border-amber-900 shadow-inner" />

            {/* Baseline Guide */}
            <div className="absolute bottom-3 left-4 right-4 h-0.5 bg-rose-600/60" />
            <div className="absolute bottom-2.5 left-3.5 w-1.5 h-1.5 rounded-full bg-rose-600" />
            <div className="absolute bottom-2.5 right-3.5 w-1.5 h-1.5 rounded-full bg-rose-600" />

            {/* Center Mandala with Ruby Queen */}
            <div className="w-12 h-12 rounded-full border-2 border-amber-600/60 flex items-center justify-center relative">
              {/* Queen (Red) */}
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-rose-700 to-red-500 border border-yellow-300 shadow-md flex items-center justify-center z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
              </div>

              {/* Guard Pucks */}
              <div className="absolute -top-1.5 w-3 h-3 rounded-full bg-white border border-gray-400 shadow-xs" />
              <div className="absolute -bottom-1.5 w-3 h-3 rounded-full bg-stone-900 border border-stone-700 shadow-xs" />
              <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-white border border-gray-400 shadow-xs" />
              <div className="absolute -right-1.5 w-3 h-3 rounded-full bg-stone-900 border border-stone-700 shadow-xs" />
            </div>

            {/* Ready Striker on Baseline */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Level Progression Label */}
        <div className="text-center z-10 mb-2">
          <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 px-3 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40">
            WORLD 1 • MAX UNLOCKED: LV {unlockedLevel}
          </span>
          <h2 className="text-2xl font-black text-white mt-1 drop-shadow-md">
            Level {currentLevel}{' '}
            <span className="text-xs text-amber-300/80 font-bold">/ 999 Levels</span>
          </h2>
        </div>

        {/* Big Juicy 3D Golden Play Button */}
        <button
          onClick={() => {
            triggerHaptic.success();
            onPlayCampaign(currentLevel);
          }}
          className="btn-candy w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-amber-950 font-black text-lg shadow-[0_6px_0_#9a3412,0_12px_24px_rgba(245,158,11,0.45)] flex items-center justify-center gap-2 active:translate-y-1 active:shadow-[0_2px_0_#9a3412] transition-all z-10"
        >
          <Play size={22} fill="#451a03" className="stroke-[2.5]" />
          <span>PLAY LEVEL {currentLevel}</span>
        </button>
      </div>

      {/* Festive Daily Lucky Spin Banner */}
      <button
        onClick={() => {
          triggerHaptic.light();
          onOpenLuckySpin();
        }}
        className="w-full px-3 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-600/20 to-orange-600/30 border border-amber-400/50 flex items-center justify-between active:scale-98 transition-all shadow-md group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center font-black shadow-md group-hover:rotate-45 transition-transform duration-500">
            🎡
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-300">LUCKY FORTUNE CHAKRA</span>
              {canSpinFree && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-[9px] font-black text-white animate-pulse">
                  FREE
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-300">Win up to 500 Coins & Powder Refills Daily</p>
          </div>
        </div>
        <span className="text-[11px] font-black text-amber-300 px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40">
          SPIN ▶
        </span>
      </button>

      {/* Festive Game Modes Arena */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" />
            Festive Game Modes
          </h3>
          <span className="text-[10px] font-bold text-gray-400">All Unlocked</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* 1v1 Pass & Play */}
          <button
            onClick={() => {
              triggerHaptic.light();
              onStartPassAndPlay();
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#2b1016] to-[#170a0e] border border-rose-700/40 hover:border-rose-500/70 text-left transition-all active:scale-95 flex flex-col justify-between min-h-[105px] shadow-md group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-xs font-black text-rose-200 group-hover:text-white">1v1 Pass & Play</span>
                <p className="text-[9px] text-rose-400 font-extrabold uppercase mt-0.5">LOCAL TABLE</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-rose-600/25 border border-rose-500/40 text-rose-300 flex items-center justify-center shadow-sm">
                <Users size={16} />
              </div>
            </div>
            <p className="text-[10px] text-gray-300/90 leading-tight z-10">Two players on 1 phone with official ICF scoring</p>
          </button>

          {/* AI Practice Duel */}
          <button
            onClick={() => {
              triggerHaptic.light();
              onStartAiMatch();
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0c1f2d] to-[#07111a] border border-cyan-700/40 hover:border-cyan-500/70 text-left transition-all active:scale-95 flex flex-col justify-between min-h-[105px] shadow-md group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-xs font-black text-cyan-200 group-hover:text-white">AI Match Duel</span>
                <p className="text-[9px] text-cyan-400 font-extrabold uppercase mt-0.5">RAYCAST BOT</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-cyan-600/25 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow-sm">
                <Bot size={16} />
              </div>
            </div>
            <p className="text-[10px] text-gray-300/90 leading-tight z-10">Smart angle AI with Rookie, Pro & Master tiers</p>
          </button>

          {/* Daily Trickshot */}
          <button
            onClick={() => {
              triggerHaptic.light();
              onStartDailyTrickshot();
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0e2617] to-[#08150d] border border-emerald-600/40 hover:border-emerald-500/70 text-left transition-all active:scale-95 flex flex-col justify-between min-h-[105px] shadow-md group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-xs font-black text-emerald-200 group-hover:text-white">Daily Trickshot</span>
                <p className="text-[9px] text-emerald-400 font-extrabold uppercase mt-0.5">🪙 +150 COINS</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-emerald-600/25 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shadow-sm">
                <Calendar size={16} />
              </div>
            </div>
            <p className="text-[10px] text-gray-300/90 leading-tight z-10">1 global puzzle daily • Build win streak bonuses</p>
          </button>

          {/* Zen Sandbox Practice */}
          <button
            onClick={() => {
              triggerHaptic.light();
              onStartZenMode();
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#25102d] to-[#130718] border border-purple-600/40 hover:border-purple-500/70 text-left transition-all active:scale-95 flex flex-col justify-between min-h-[105px] shadow-md group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-xs font-black text-purple-200 group-hover:text-white">Zen Free-Play</span>
                <p className="text-[9px] text-purple-400 font-extrabold uppercase mt-0.5">NO TIME LIMIT</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-purple-600/25 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-sm">
                <Zap size={16} />
              </div>
            </div>
            <p className="text-[10px] text-gray-300/90 leading-tight z-10">Infinite strikes • Master trickshots and bank angles</p>
          </button>
        </div>
      </div>

      {/* Festive Tournament Ribbon: Rulebook & Locker */}
      <div className="flex gap-2.5 pt-1">
        <button
          onClick={() => {
            triggerHaptic.light();
            onOpenRulebook();
          }}
          className="flex-1 p-3 rounded-2xl bg-[#1b1226] border border-purple-800/40 hover:border-amber-500/40 flex items-center justify-between active:scale-95 transition-all shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center">
              <BookOpen size={15} />
            </div>
            <div className="text-left">
              <p className="font-bold text-xs text-white">ICF Rules</p>
              <p className="text-[9px] text-gray-400">Official Laws</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-gray-400" />
        </button>

        <button
          onClick={() => {
            triggerHaptic.light();
            onOpenShop();
          }}
          className="flex-1 p-3 rounded-2xl bg-[#1b1226] border border-purple-800/40 hover:border-amber-500/40 flex items-center justify-between active:scale-95 transition-all shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <ShoppingBag size={15} />
            </div>
            <div className="text-left">
              <p className="font-bold text-xs text-white">Locker & Shop</p>
              <p className="text-[9px] text-amber-300">Strikers & Boards</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
};

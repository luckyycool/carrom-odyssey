import React, { useState } from 'react';
import { Crown, Gift, Check, Lock, Zap } from 'lucide-react';
import {
  type BoardThemeItem,
  type StrikerItem,
  type PuckSkinItem,
  INITIAL_BOARD_THEMES,
  INITIAL_STRIKERS,
  INITIAL_PUCK_SKINS,
} from '../state/gameStore';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';

interface ShopScreenProps {
  coins: number;
  isProUser: boolean;
  selectedBoardId: string;
  selectedStrikerId: string;
  selectedPuckId: string;
  strikerCharges: Record<string, number>;
  strikerLevels: Record<string, number>;
  onSelectBoard: (id: string) => void;
  onSelectStriker: (id: string) => void;
  onSelectPuck: (id: string) => void;
  onRechargeStriker: (strikerId: string, cost: number) => void;
  onUpgradeStriker: (strikerId: string, cost: number) => void;
  onWatchAdForRecharge: (strikerId: string) => void;
  onBuyCoins: (amount: number) => void;
  onBuyProPass: () => void;
  onWatchRewardedChest: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  coins,
  isProUser,
  selectedBoardId,
  selectedStrikerId,
  selectedPuckId,
  strikerCharges,
  strikerLevels,
  onSelectBoard,
  onSelectStriker,
  onSelectPuck,
  onRechargeStriker,
  onUpgradeStriker,
  onWatchAdForRecharge,
  onBuyCoins,
  onBuyProPass,
  onWatchRewardedChest,
}) => {
  const [activeCategory, setActiveCategory] = useState<'boards' | 'strikers' | 'pucks' | 'passes'>('boards');
  const [boardThemes, setBoardThemes] = useState<BoardThemeItem[]>(() => {
    const saved = localStorage.getItem('carrom_unlocked_boards');
    if (saved) {
      const unlockedIds = JSON.parse(saved) as string[];
      return INITIAL_BOARD_THEMES.map(b => ({
        ...b,
        unlocked: b.unlocked || unlockedIds.includes(b.id),
      }));
    }
    return INITIAL_BOARD_THEMES;
  });

  const [strikers, setStrikers] = useState<StrikerItem[]>(() => {
    const saved = localStorage.getItem('carrom_unlocked_strikers');
    if (saved) {
      const unlockedIds = JSON.parse(saved) as string[];
      return INITIAL_STRIKERS.map(s => ({
        ...s,
        unlocked: s.unlocked || unlockedIds.includes(s.id),
      }));
    }
    return INITIAL_STRIKERS;
  });

  const [puckSkins, setPuckSkins] = useState<PuckSkinItem[]>(() => {
    const saved = localStorage.getItem('carrom_unlocked_pucks');
    if (saved) {
      const unlockedIds = JSON.parse(saved) as string[];
      return INITIAL_PUCK_SKINS.map(p => ({
        ...p,
        unlocked: p.unlocked || unlockedIds.includes(p.id),
      }));
    }
    return INITIAL_PUCK_SKINS;
  });

  // Handle Board Unlock / Equip
  const handleBoardAction = (theme: BoardThemeItem) => {
    if (theme.unlocked) {
      onSelectBoard(theme.id);
      sounds.playCoinSound();
      triggerHaptic.light();
    } else {
      if (coins >= theme.price) {
        onBuyCoins(-theme.price);
        const updated = boardThemes.map(b => (b.id === theme.id ? { ...b, unlocked: true } : b));
        setBoardThemes(updated);
        localStorage.setItem(
          'carrom_unlocked_boards',
          JSON.stringify(updated.filter(b => b.unlocked).map(b => b.id))
        );
        onSelectBoard(theme.id);
        sounds.playLevelClear();
        triggerHaptic.success();
        confetti({ particleCount: 50, spread: 60 });
      } else {
        triggerHaptic.heavy();
        alert('Not enough coins! Play levels or open the Free Daily Mystery Chest.');
      }
    }
  };

  // Handle Striker Unlock / Equip
  const handleStrikerAction = (striker: StrikerItem) => {
    if (striker.unlocked) {
      onSelectStriker(striker.id);
      sounds.playWoodClick(18);
      triggerHaptic.light();
    } else {
      if (coins >= striker.price) {
        onBuyCoins(-striker.price);
        const updated = strikers.map(s => (s.id === striker.id ? { ...s, unlocked: true } : s));
        setStrikers(updated);
        localStorage.setItem(
          'carrom_unlocked_strikers',
          JSON.stringify(updated.filter(s => s.unlocked).map(s => s.id))
        );
        onSelectStriker(striker.id);
        sounds.playLevelClear();
        triggerHaptic.success();
        confetti({ particleCount: 50, spread: 60 });
      } else {
        triggerHaptic.heavy();
        alert('Not enough coins!');
      }
    }
  };

  // Handle Puck Unlock / Equip
  const handlePuckAction = (puck: PuckSkinItem) => {
    if (puck.unlocked) {
      onSelectPuck(puck.id);
      sounds.playCoinSound();
      triggerHaptic.light();
    } else {
      if (coins >= puck.price) {
        onBuyCoins(-puck.price);
        const updated = puckSkins.map(p => (p.id === puck.id ? { ...p, unlocked: true } : p));
        setPuckSkins(updated);
        localStorage.setItem(
          'carrom_unlocked_pucks',
          JSON.stringify(updated.filter(p => p.unlocked).map(p => p.id))
        );
        onSelectPuck(puck.id);
        sounds.playLevelClear();
        triggerHaptic.success();
        confetti({ particleCount: 50, spread: 60 });
      } else {
        triggerHaptic.heavy();
        alert('Not enough coins!');
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0e0c15] text-white select-none overflow-hidden max-w-md mx-auto">
      {/* Category Tabs */}
      <div className="flex justify-between items-center px-3 py-2 bg-[#161224] border-b border-purple-900/40">
        {[
          { id: 'boards' as const, label: 'Boards' },
          { id: 'strikers' as const, label: 'Strikers' },
          { id: 'pucks' as const, label: 'Pucks' },
          { id: 'passes' as const, label: 'Pro & Coins' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              triggerHaptic.light();
              setActiveCategory(cat.id);
            }}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Category: BOARDS */}
        {activeCategory === 'boards' && (
          <div className="grid grid-cols-1 gap-3">
            {boardThemes.map(b => {
              const isEquipped = selectedBoardId === b.id;
              return (
                <div
                  key={b.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isEquipped
                      ? 'bg-purple-950/80 border-pink-500 shadow-glow-pink'
                      : 'bg-[#181329] border-purple-900/40 hover:border-purple-700/60'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                        {b.name}
                        {isEquipped && (
                          <span className="text-[10px] bg-pink-500 px-2 py-0.5 rounded-full font-black text-white">
                            EQUIPPED
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-gray-400">{b.desc}</p>
                    </div>
                  </div>

                  {/* Visual Preview Box */}
                  <div
                    className="w-full h-16 rounded-xl flex items-center justify-center p-2 mb-2 relative overflow-hidden"
                    style={{ backgroundColor: b.frameColor }}
                  >
                    <div
                      className="w-full h-full rounded-lg border-2 flex items-center justify-center shadow-inner relative"
                      style={{
                        backgroundColor: b.surfaceColor,
                        borderColor: b.cushionColor,
                      }}
                    >
                      {/* Center Mandala preview */}
                      <div
                        className="w-7 h-7 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: b.mandalaColor }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: b.mandalaColor }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleBoardAction(b)}
                    className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      isEquipped
                        ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                        : b.unlocked
                        ? 'bg-purple-900 border border-purple-700 text-purple-200 active:scale-95'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 active:scale-95 shadow-md'
                    }`}
                  >
                    {isEquipped ? (
                      <>
                        <Check size={14} /> In Use
                      </>
                    ) : b.unlocked ? (
                      'Equip Board'
                    ) : (
                      <>
                        <Lock size={12} /> Unlock for 🪙 {b.price}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Category: STRIKERS (With Powder Durability & 5-Tier Star Upgrades) */}
        {activeCategory === 'strikers' && (
          <div className="grid grid-cols-1 gap-3">
            {strikers.map(s => {
              const isEquipped = selectedStrikerId === s.id;
              const charges = strikerCharges[s.id] ?? 10;
              const level = strikerLevels[s.id] ?? 1;
              const isUnlimited = s.id === 'standard_cyan' || isProUser;
              const upgradeCost = level === 1 ? 200 : level === 2 ? 400 : level === 3 ? 700 : 1200;

              return (
                <div
                  key={s.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isEquipped
                      ? 'bg-purple-950/80 border-pink-500 shadow-glow-pink'
                      : 'bg-[#181329] border-purple-900/40'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2.5">
                      {/* Striker Disc Preview */}
                      <div
                        className="w-11 h-11 rounded-full border-2 flex items-center justify-center shadow-lg relative"
                        style={{
                          backgroundColor: s.color,
                          borderColor: s.borderColor,
                        }}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                        {level > 1 && (
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-[9px] font-black text-amber-950 shadow-sm">
                            ★{level}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                          {s.name}
                          {isEquipped && (
                            <span className="text-[10px] bg-pink-500 px-2 py-0.5 rounded-full font-black text-white">
                              EQUIPPED
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-amber-400 font-bold">
                            Trait: {s.trait}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-[10px] text-cyan-300 font-bold">
                            Lv {level}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-300 my-1.5">{s.desc}</p>

                  {/* Powder Durability Meter & Upgrade Controls (when unlocked) */}
                  {s.unlocked && (
                    <div className="my-2 p-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 space-y-2">
                      {/* Powder Bar */}
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-gray-300 flex items-center gap-1">
                          <Zap size={12} className="text-amber-400" />
                          <span>Powder Durability:</span>
                        </span>
                        <span className={`font-black ${charges <= 2 && !isUnlimited ? 'text-rose-400 animate-pulse' : 'text-amber-300'}`}>
                          {isUnlimited ? '∞ Unlimited' : `${charges}/15 Matches`}
                        </span>
                      </div>

                      {!isUnlimited && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onRechargeStriker(s.id, 60)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-[10px] font-black text-amber-300 flex items-center justify-center gap-1 active:scale-95 transition-all"
                          >
                            <span>⚡ Refill (+10 Matches) • 60 🪙</span>
                          </button>
                          <button
                            onClick={() => onWatchAdForRecharge(s.id)}
                            className="py-1.5 px-2.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/50 text-[10px] font-black text-emerald-300 flex items-center justify-center gap-1 active:scale-95 transition-all"
                          >
                            <Gift size={11} />
                            <span>Free Ad</span>
                          </button>
                        </div>
                      )}

                      {/* Star Upgrades */}
                      {level < 5 ? (
                        <div className="flex items-center justify-between pt-1 border-t border-purple-900/40">
                          <span className="text-[10px] text-gray-300">
                            Upgrade to <strong className="text-amber-300">Lv {level + 1}</strong> (+Precision & Mass)
                          </span>
                          <button
                            onClick={() => onUpgradeStriker(s.id, upgradeCost)}
                            className="py-1 px-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 font-black text-[10px] shadow-sm active:scale-95 transition-all"
                          >
                            Upgrade • 🪙 {upgradeCost}
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-[10px] font-black text-amber-400 pt-0.5">
                          👑 MAX LEVEL 5 GRANDMASTER STRIKER
                        </div>
                      )}
                    </div>
                  )}

                  {/* Equip / Unlock Action Button */}
                  <button
                    onClick={() => handleStrikerAction(s)}
                    className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      isEquipped
                        ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                        : s.unlocked
                        ? 'bg-purple-900 border border-purple-700 text-purple-200 active:scale-95'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 active:scale-95 shadow-md'
                    }`}
                  >
                    {isEquipped ? (
                      <>
                        <Check size={14} /> In Use
                      </>
                    ) : s.unlocked ? (
                      'Equip Striker'
                    ) : (
                      <>
                        <Lock size={12} /> Unlock for 🪙 {s.price}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Category: PUCKS */}
        {activeCategory === 'pucks' && (
          <div className="grid grid-cols-1 gap-3">
            {puckSkins.map(p => {
              const isEquipped = selectedPuckId === p.id;
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isEquipped
                      ? 'bg-purple-950/80 border-pink-500 shadow-glow-pink'
                      : 'bg-[#181329] border-purple-900/40'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      {/* White + Queen Pucks Preview */}
                      <div className="flex items-center gap-1">
                        <div
                          className="w-7 h-7 rounded-full border-2 shadow-sm"
                          style={{
                            backgroundColor: p.whiteColor,
                            borderColor: p.whiteBorder,
                          }}
                        />
                        <div
                          className="w-7 h-7 rounded-full border-2 shadow-sm flex items-center justify-center"
                          style={{
                            backgroundColor: p.queenColor,
                            borderColor: p.queenBorder,
                          }}
                        >
                          <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                          {p.name}
                          {isEquipped && (
                            <span className="text-[10px] bg-pink-500 px-2 py-0.5 rounded-full font-black text-white">
                              EQUIPPED
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-gray-400">{p.desc}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePuckAction(p)}
                    className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 mt-2 ${
                      isEquipped
                        ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                        : p.unlocked
                        ? 'bg-purple-900 border border-purple-700 text-purple-200 active:scale-95'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 active:scale-95 shadow-md'
                    }`}
                  >
                    {isEquipped ? (
                      <>
                        <Check size={14} /> In Use
                      </>
                    ) : p.unlocked ? (
                      'Equip Pucks'
                    ) : (
                      <>
                        <Lock size={12} /> Unlock for 🪙 {p.price}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Category: PRO & COINS */}
        {activeCategory === 'passes' && (
          <div className="space-y-3">
            {/* Ad-Free Pro Pass Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-tr from-purple-950 via-pink-950 to-amber-950 border border-amber-500/50 shadow-glow-gold relative overflow-hidden">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="text-amber-400 animate-bounce" size={24} />
                <h3 className="text-base font-black text-white">AD-FREE PRO PASS</h3>
              </div>
              <p className="text-xs text-purple-200 mb-3">
                Permanently removes all banners, grants the exclusive <strong>Gold Crown Striker</strong>, and unlocks unlimited level retries!
              </p>

              {isProUser ? (
                <div className="w-full py-2.5 rounded-2xl bg-emerald-600/30 border border-emerald-500 text-emerald-300 text-xs font-black text-center flex items-center justify-center gap-1.5">
                  <Check size={16} /> Pro Pass Active
                </div>
              ) : (
                <button
                  onClick={() => {
                    onBuyProPass();
                    sounds.playLevelClear();
                    triggerHaptic.success();
                    confetti({ particleCount: 80, spread: 80 });
                  }}
                  className="btn-candy w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-sm shadow-candy"
                >
                  GET PRO PASS — $1.99
                </button>
              )}
            </div>

            {/* Daily Free Mystery Chest (Rewarded Ad) */}
            <div className="p-4 rounded-3xl bg-[#181329] border border-purple-800/60 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center shadow-md">
                  <Gift size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">Daily Mystery Chest</h4>
                  <p className="text-[11px] text-gray-400">Watch a 5s partner video to earn 🪙 150 Coins!</p>
                </div>
              </div>
              <button
                onClick={onWatchRewardedChest}
                className="btn-candy px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 font-black text-xs text-white shadow-md active:scale-95"
              >
                OPEN FREE
              </button>
            </div>

            {/* Coin Bundles */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Coin Bundles
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onBuyCoins(500);
                    sounds.playCoinSound();
                    triggerHaptic.heavy();
                  }}
                  className="p-3 rounded-2xl bg-[#181329] border border-purple-900/40 text-left hover:border-amber-500 transition-all active:scale-95"
                >
                  <div className="text-sm font-black text-amber-300">🪙 500 Coins</div>
                  <div className="text-[11px] text-gray-400">Small Bundle</div>
                  <div className="text-xs font-black text-white mt-1">$0.99</div>
                </button>

                <button
                  onClick={() => {
                    onBuyCoins(2000);
                    sounds.playCoinSound();
                    triggerHaptic.heavy();
                    confetti({ particleCount: 40, spread: 60 });
                  }}
                  className="p-3 rounded-2xl bg-[#181329] border border-purple-900/40 text-left hover:border-amber-500 transition-all active:scale-95"
                >
                  <div className="text-sm font-black text-amber-300">🪙 2,000 Coins</div>
                  <div className="text-[11px] text-gray-400">Value Pack (+25% bonus)</div>
                  <div className="text-xs font-black text-white mt-1">$2.99</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

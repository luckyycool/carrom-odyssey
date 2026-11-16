import { useState, useEffect } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { BottomNavBar } from './components/BottomNavBar';
import { HomeScreen } from './components/HomeScreen';
import { SagaMapScreen } from './components/SagaMapScreen';
import { ShopScreen } from './components/ShopScreen';
import { SettingsModal } from './components/SettingsModal';
import { RulebookModal } from './components/RulebookModal';
import { AchievementsModal } from './components/AchievementsModal';
import { RewardedAdModal } from './components/RewardedAdModal';
import { LuckySpinModal, type SpinPrize } from './components/LuckySpinModal';
import { CarromBoard } from './game/CarromBoard';
import { loadGameData, saveGameData, type GameProgress, type PlayerSettings } from './state/gameStore';
import { sounds } from './utils/audio';
import { triggerHaptic, setHapticsIntensity } from './utils/haptics';
import { initNativeAdMob, showRewardedAdMobVideo } from './lib/adMobService';

export default function App() {
  const [data, setData] = useState<GameProgress>(() => loadGameData());
  const [activeScreen, setActiveScreen] = useState<'home' | 'map' | 'shop' | 'game'>('home');
  const [activeGameMode, setActiveGameMode] = useState<'campaign' | 'pass_and_play' | 'ai_match' | 'daily' | 'zen'>('campaign');
  const [gameKey, setGameKey] = useState<number>(0);

  // Modals
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showRulebook, setShowRulebook] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showLuckySpin, setShowLuckySpin] = useState<boolean>(false);
  const [rewardedAdConfig, setRewardedAdConfig] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
    onReward: () => void;
  } | null>(null);

  const todayDate = new Date().toISOString().slice(0, 10);
  const canSpinFree = data.lastSpinDate !== todayDate;

  // Auto-save data
  useEffect(() => {
    saveGameData(data);
  }, [data]);

  // Initialize Native AdMob on launch
  useEffect(() => {
    initNativeAdMob().catch(() => {});
  }, []);

  // Sync Audio & Haptics settings
  useEffect(() => {
    sounds.setVolumes(data.settings.sfxVolume, data.settings.musicVolume);
    setHapticsIntensity(data.settings.hapticsIntensity);
  }, [data.settings]);

  // Audio Mute toggle
  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, sfxVolume: muted ? 0 : 0.8 },
    }));
  };

  // Settings update
  const handleUpdateSettings = (newSettings: PlayerSettings) => {
    setData(prev => ({ ...prev, settings: newSettings }));
  };

  // Reset Progress Data
  const handleResetData = () => {
    localStorage.clear();
    const fresh = loadGameData();
    setData(fresh);
    setActiveScreen('home');
    triggerHaptic.heavy();
  };

  // Launch Campaign Level
  const handleStartCampaignLevel = (lvl: number) => {
    setData(prev => ({ ...prev, currentLevel: lvl }));
    setActiveGameMode('campaign');
    setActiveScreen('game');
    setGameKey(prev => prev + 1);
  };

  // Launch 1v1 Pass & Play
  const handleStartPassAndPlay = () => {
    setActiveGameMode('pass_and_play');
    setActiveScreen('game');
    setGameKey(prev => prev + 1);
  };

  // Launch AI Match
  const handleStartAiMatch = () => {
    setActiveGameMode('ai_match');
    setActiveScreen('game');
    setGameKey(prev => prev + 1);
  };

  // Launch Daily Trickshot
  const handleStartDailyTrickshot = () => {
    // Generate daily level from today's date
    const today = new Date().toISOString().slice(0, 10);
    const daySeed = today.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
    const dailyLevel = (daySeed % 50) + 1;

    setData(prev => ({ ...prev, currentLevel: dailyLevel }));
    setActiveGameMode('daily');
    setActiveScreen('game');
    setGameKey(prev => prev + 1);
  };

  // Launch Zen Mode
  const handleStartZenMode = () => {
    setActiveGameMode('zen');
    setActiveScreen('game');
    setGameKey(prev => prev + 1);
  };

  // Handle Win Level
  const handleWinLevel = (lvl: number, strikesRemaining: number) => {
    const starsEarned = strikesRemaining >= 2 ? 3 : strikesRemaining === 1 ? 2 : 1;
    const coinsWon = starsEarned * 25;

    setData(prev => {
      const prevStars = prev.levelStars[lvl] || 0;
      const updatedStars = { ...prev.levelStars, [lvl]: Math.max(prevStars, starsEarned) };
      const nextUnlocked = Math.min(999, Math.max(prev.unlockedLevel, lvl + 1));
      return {
        ...prev,
        unlockedLevel: nextUnlocked,
        levelStars: updatedStars,
        coins: prev.coins + coinsWon,
      };
    });
  };

  // Handle Second Chance Rewarded Ad
  const handleRequestSecondChanceAd = () => {
    const onReward = () => {
      setRewardedAdConfig(null);
      // Restart current round with extra strikes
      setGameKey(prev => prev + 1);
    };

    showRewardedAdMobVideo(
      (granted) => {
        if (granted) onReward();
      },
      () => {
        setRewardedAdConfig({
          isOpen: true,
          title: 'Second Chance Extra Strikes',
          desc: 'Watch a quick 5-second video to gain +2 Extra Strikes and keep your game moving!',
          onReward,
        });
      }
    );
  };

  // Handle Daily Mystery Chest Ad
  const handleWatchRewardedChest = () => {
    const onReward = () => {
      setData(prev => ({ ...prev, coins: prev.coins + 150 }));
      setRewardedAdConfig(null);
    };

    showRewardedAdMobVideo(
      (granted) => {
        if (granted) onReward();
      },
      () => {
        setRewardedAdConfig({
          isOpen: true,
          title: 'Daily Mystery Reward',
          desc: 'Watch this 5-second video to open your free chest and earn 🪙 150 Coins!',
          onReward,
        });
      }
    );
  };

  // Handle Pro Pass Purchase
  const handleBuyProPass = () => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, isProUser: true },
      coins: prev.coins + 1000,
    }));
  };

  // Handle Striker Powder Recharge
  const handleRechargeStriker = (strikerId: string, cost: number) => {
    if (data.coins >= cost) {
      setData(prev => ({
        ...prev,
        coins: prev.coins - cost,
        strikerCharges: {
          ...prev.strikerCharges,
          [strikerId]: Math.min(30, (prev.strikerCharges[strikerId] || 0) + 10),
        },
      }));
      sounds.playLevelClear();
      triggerHaptic.success();
    } else {
      triggerHaptic.heavy();
      alert('Not enough coins! Watch a quick video or play levels to earn coins.');
    }
  };

  // Handle Rewarded Ad Striker Powder Recharge
  const handleWatchAdForRecharge = (strikerId: string) => {
    const onReward = () => {
      setData(prev => ({
        ...prev,
        strikerCharges: {
          ...prev.strikerCharges,
          [strikerId]: Math.min(30, (prev.strikerCharges[strikerId] || 0) + 10),
        },
      }));
      setRewardedAdConfig(null);
      triggerHaptic.success();
    };

    showRewardedAdMobVideo(
      (granted) => {
        if (granted) onReward();
      },
      () => {
        setRewardedAdConfig({
          isOpen: true,
          title: 'Striker Powder Refill',
          desc: 'Watch this 5-second video to gain +10 Powder Matches for your striker!',
          onReward,
        });
      }
    );
  };

  // Handle Striker Star Upgrade (Lv 1 to Lv 5)
  const handleUpgradeStriker = (strikerId: string, cost: number) => {
    if (data.coins >= cost) {
      setData(prev => {
        const curLevel = prev.strikerLevels[strikerId] || 1;
        if (curLevel >= 5) return prev;
        return {
          ...prev,
          coins: prev.coins - cost,
          strikerLevels: {
            ...prev.strikerLevels,
            [strikerId]: curLevel + 1,
          },
        };
      });
      sounds.playLevelClear();
      triggerHaptic.success();
    } else {
      triggerHaptic.heavy();
      alert('Not enough coins to upgrade striker!');
    }
  };

  // Handle Powder Consumption during Match
  const handleConsumeStrikerCharge = (strikerId: string) => {
    if (data.settings.isProUser || strikerId === 'standard_cyan') return;
    setData(prev => {
      const cur = prev.strikerCharges[strikerId] ?? 10;
      if (cur <= 0) return prev;
      return {
        ...prev,
        strikerCharges: {
          ...prev.strikerCharges,
          [strikerId]: Math.max(0, cur - 1),
        },
      };
    });
  };

  // Handle Double Level Reward Ad (2x Coins)
  const handleRequestDoubleRewardAd = () => {
    const onReward = () => {
      setData(prev => ({ ...prev, coins: prev.coins + 75 }));
      setRewardedAdConfig(null);
      sounds.playLevelClear();
      triggerHaptic.success();
    };

    showRewardedAdMobVideo(
      (granted) => {
        if (granted) onReward();
      },
      () => {
        setRewardedAdConfig({
          isOpen: true,
          title: 'Double Level Coins (2X)',
          desc: 'Watch this 5-second video to double your winnings and earn an extra +75 Coins!',
          onReward,
        });
      }
    );
  };

  // Handle Lucky Spin Prize Claim
  const handleGrantSpinPrize = (prize: SpinPrize) => {
    setData(prev => {
      const today = new Date().toISOString().slice(0, 10);
      if (prize.type === 'coins') {
        return {
          ...prev,
          coins: prev.coins + prize.amount,
          lastSpinDate: today,
        };
      } else {
        const striker = prev.selectedStriker;
        return {
          ...prev,
          strikerCharges: {
            ...prev.strikerCharges,
            [striker]: Math.min(30, (prev.strikerCharges[striker] || 0) + prize.amount),
          },
          lastSpinDate: today,
        };
      }
    });
  };

  // Handle Lucky Spin Extra Ad
  const handleRequestSpinAd = () => {
    const onReward = () => {
      setRewardedAdConfig(null);
      setData(prev => ({ ...prev, lastSpinDate: '' }));
    };

    showRewardedAdMobVideo(
      (granted) => {
        if (granted) onReward();
      },
      () => {
        setRewardedAdConfig({
          isOpen: true,
          title: 'Lucky Chakra Extra Spin',
          desc: 'Watch this 5-second video to gain an extra spin on the Fortune Chakra wheel!',
          onReward,
        });
      }
    );
  };

  // Handle Achievements
  const handleClaimAchievement = (id: string, rewardCoins: number) => {
    setData(prev => ({
      ...prev,
      coins: prev.coins + rewardCoins,
      achievements: { ...prev.achievements, [id]: true },
    }));
  };

  // Total stars calculated
  const totalStars = Object.values(data.levelStars).reduce((sum, s) => sum + s, 0);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-between bg-[#09070f] font-sans overflow-hidden">
      {/* Top Universal Header Bar (Hidden during active gameplay to maximize board space) */}
      {activeScreen !== 'game' && (
        <HeaderBar
          coins={data.coins}
          stars={totalStars}
          level={data.currentLevel}
          isMuted={sounds.getMuted()}
          onToggleMute={handleToggleMute}
          onOpenSettings={() => setShowSettings(true)}
          onOpenShop={() => setActiveScreen('shop')}
        />
      )}

      {/* Main Screen Router */}
      <div className="flex-1 w-full max-w-md overflow-hidden flex flex-col justify-center">
        {activeScreen === 'home' && (
          <HomeScreen
            currentLevel={data.currentLevel}
            unlockedLevel={data.unlockedLevel}
            stars={totalStars}
            canSpinFree={canSpinFree}
            onOpenLuckySpin={() => setShowLuckySpin(true)}
            onPlayCampaign={handleStartCampaignLevel}
            onStartPassAndPlay={handleStartPassAndPlay}
            onStartAiMatch={handleStartAiMatch}
            onStartDailyTrickshot={handleStartDailyTrickshot}
            onStartZenMode={handleStartZenMode}
            onOpenSagaMap={() => setActiveScreen('map')}
            onOpenRulebook={() => setShowRulebook(true)}
            onOpenShop={() => setActiveScreen('shop')}
          />
        )}

        {activeScreen === 'map' && (
          <SagaMapScreen
            currentLevel={data.currentLevel}
            unlockedLevel={data.unlockedLevel}
            levelStars={data.levelStars}
            onPlayLevel={handleStartCampaignLevel}
          />
        )}

        {activeScreen === 'shop' && (
          <ShopScreen
            coins={data.coins}
            isProUser={data.settings.isProUser}
            selectedBoardId={data.selectedBoardTheme}
            selectedStrikerId={data.selectedStriker}
            selectedPuckId={data.selectedPuckSkin}
            strikerCharges={data.strikerCharges}
            strikerLevels={data.strikerLevels}
            onSelectBoard={id => setData(prev => ({ ...prev, selectedBoardTheme: id }))}
            onSelectStriker={id => setData(prev => ({ ...prev, selectedStriker: id }))}
            onSelectPuck={id => setData(prev => ({ ...prev, selectedPuckSkin: id }))}
            onRechargeStriker={handleRechargeStriker}
            onUpgradeStriker={handleUpgradeStriker}
            onWatchAdForRecharge={handleWatchAdForRecharge}
            onBuyCoins={amt => setData(prev => ({ ...prev, coins: prev.coins + amt }))}
            onBuyProPass={handleBuyProPass}
            onWatchRewardedChest={handleWatchRewardedChest}
          />
        )}

        {activeScreen === 'game' && (
          <CarromBoard
            key={gameKey}
            mode={activeGameMode}
            levelNumber={data.currentLevel}
            selectedBoardThemeId={data.selectedBoardTheme}
            selectedStrikerId={data.selectedStriker}
            selectedPuckSkinId={data.selectedPuckSkin}
            strikerCharge={data.strikerCharges[data.selectedStriker]}
            strikerLevel={data.strikerLevels[data.selectedStriker]}
            isProUser={data.settings.isProUser}
            onConsumePowder={() => handleConsumeStrikerCharge(data.selectedStriker)}
            coins={data.coins}
            stars={totalStars}
            isMuted={sounds.getMuted()}
            onToggleMute={handleToggleMute}
            onOpenSettings={() => setShowSettings(true)}
            onWinLevel={handleWinLevel}
            onRestartLevel={() => setGameKey(prev => prev + 1)}
            onExitToHome={() => setActiveScreen('home')}
            onRequestSecondChanceAd={handleRequestSecondChanceAd}
            onRequestDoubleRewardAd={handleRequestDoubleRewardAd}
          />
        )}
      </div>

      {/* Bottom Navigation Bar (Hidden when in active game to maximize board space) */}
      {activeScreen !== 'game' && (
        <BottomNavBar
          currentTab={activeScreen === 'shop' ? 'shop' : activeScreen === 'map' ? 'map' : 'home'}
          onSelectTab={tab => {
            if (tab === 'achievements') {
              setShowAchievements(true);
            } else {
              setActiveScreen(tab as 'home' | 'map' | 'shop');
            }
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={data.settings}
          onUpdateSettings={handleUpdateSettings}
          onOpenRulebook={() => {
            setShowSettings(false);
            setShowRulebook(true);
          }}
          onResetData={handleResetData}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Official Illustrated ICF Rulebook Modal */}
      {showRulebook && (
        <RulebookModal onClose={() => setShowRulebook(false)} />
      )}

      {/* Achievements / Trophies Modal */}
      {showAchievements && (
        <AchievementsModal
          unlockedLevel={data.unlockedLevel}
          stars={totalStars}
          coins={data.coins}
          achievements={data.achievements}
          onClaimAchievement={handleClaimAchievement}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {/* Rewarded Ad Modal */}
      {rewardedAdConfig && rewardedAdConfig.isOpen && (
        <RewardedAdModal
          rewardTitle={rewardedAdConfig.title}
          rewardDesc={rewardedAdConfig.desc}
          onRewardGranted={rewardedAdConfig.onReward}
          onClose={() => setRewardedAdConfig(null)}
        />
      )}

      {/* Lucky Fortune Chakra Spin Modal */}
      {showLuckySpin && (
        <LuckySpinModal
          canSpinFree={canSpinFree}
          onGrantPrize={handleGrantSpinPrize}
          onRequestAdSpin={handleRequestSpinAd}
          onClose={() => setShowLuckySpin(false)}
        />
      )}
    </div>
  );
}

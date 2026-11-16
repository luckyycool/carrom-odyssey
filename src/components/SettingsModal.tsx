import React, { useState } from 'react';
import { Volume2, Music, Vibrate, BookOpen, X, ShieldCheck, Zap } from 'lucide-react';
import type { PlayerSettings } from '../state/gameStore';
import { sounds } from '../utils/audio';
import { triggerHaptic, setHapticsIntensity } from '../utils/haptics';

interface SettingsModalProps {
  settings: PlayerSettings;
  onUpdateSettings: (newSettings: PlayerSettings) => void;
  onOpenRulebook: () => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onOpenRulebook,
  onResetData,
  onClose,
}) => {
  const [sfx, setSfx] = useState<number>(settings.sfxVolume);
  const [music, setMusic] = useState<number>(settings.musicVolume);
  const [haptics, setHaptics] = useState<'off' | 'soft' | 'crisp' | 'heavy'>(settings.hapticsIntensity);
  const [fps, setFps] = useState<60 | 120>(settings.targetFps);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleSfxChange = (val: number) => {
    setSfx(val);
    sounds.setVolumes(val, music);
    sounds.playWoodClick(18);
    const updated = { ...settings, sfxVolume: val };
    onUpdateSettings(updated);
  };

  const handleMusicChange = (val: number) => {
    setMusic(val);
    sounds.setVolumes(sfx, val);
    const updated = { ...settings, musicVolume: val };
    onUpdateSettings(updated);
  };

  const handleHapticsChange = (intensity: 'off' | 'soft' | 'crisp' | 'heavy') => {
    setHaptics(intensity);
    setHapticsIntensity(intensity);
    triggerHaptic.heavy();
    const updated = { ...settings, hapticsIntensity: intensity };
    onUpdateSettings(updated);
  };

  const handleFpsChange = (rate: 60 | 120) => {
    setFps(rate);
    triggerHaptic.light();
    const updated = { ...settings, targetFps: rate };
    onUpdateSettings(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#161224] border border-purple-800/60 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-pop-in">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-purple-900/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-900/50 flex items-center justify-center text-pink-400">
              ⚙️
            </div>
            <h2 className="text-base font-black text-white">Game Settings</h2>
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

        {/* Scrollable Settings Form */}
        <div className="my-3 space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Pro Status Badge */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 to-amber-950/60 border border-amber-600/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-amber-400" size={20} />
              <div>
                <div className="text-xs font-black text-white">
                  {settings.isProUser ? 'Ad-Free Pro Member' : 'Free Player'}
                </div>
                <div className="text-[10px] text-gray-400">
                  {settings.isProUser ? 'All banners permanently removed' : 'Zero gameplay interruptions'}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-amber-950">
              {settings.isProUser ? 'PRO ACTIVE' : 'FREE'}
            </span>
          </div>

          {/* Sound Effects Slider */}
          <div className="p-3 bg-purple-950/50 rounded-2xl border border-purple-900/40">
            <div className="flex justify-between items-center mb-1 text-xs font-bold text-purple-200">
              <span className="flex items-center gap-1.5">
                <Volume2 size={15} className="text-cyan-400" />
                Sound Effects (SFX)
              </span>
              <span className="text-cyan-400 font-extrabold">{Math.round(sfx * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfx}
              onChange={e => handleSfxChange(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-purple-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Background Music Slider */}
          <div className="p-3 bg-purple-950/50 rounded-2xl border border-purple-900/40">
            <div className="flex justify-between items-center mb-1 text-xs font-bold text-purple-200">
              <span className="flex items-center gap-1.5">
                <Music size={15} className="text-pink-400" />
                Zen Ambient Music
              </span>
              <span className="text-pink-400 font-extrabold">{Math.round(music * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={music}
              onChange={e => handleMusicChange(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-purple-900 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>

          {/* Haptics Intensity Selector */}
          <div className="p-3 bg-purple-950/50 rounded-2xl border border-purple-900/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-200 mb-2">
              <Vibrate size={15} className="text-amber-400" />
              Tactile Haptics
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
              {(['off', 'soft', 'crisp', 'heavy'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => handleHapticsChange(mode)}
                  className={`py-1.5 rounded-xl font-bold capitalize transition-all ${
                    haptics === mode
                      ? 'bg-amber-500 text-amber-950 shadow-md font-black'
                      : 'bg-purple-900/60 text-purple-200 border border-purple-800/40'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Display & Refresh Rate */}
          <div className="p-3 bg-purple-950/50 rounded-2xl border border-purple-900/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-200 mb-2">
              <Zap size={15} className="text-emerald-400" />
              Target Refresh Rate
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <button
                onClick={() => handleFpsChange(60)}
                className={`py-2 rounded-xl font-bold transition-all ${
                  fps === 60
                    ? 'bg-emerald-500 text-emerald-950 font-black shadow-md'
                    : 'bg-purple-900/60 text-purple-200 border border-purple-800/40'
                }`}
              >
                Standard (60 Hz)
              </button>
              <button
                onClick={() => handleFpsChange(120)}
                className={`py-2 rounded-xl font-bold transition-all ${
                  fps === 120
                    ? 'bg-emerald-500 text-emerald-950 font-black shadow-md'
                    : 'bg-purple-900/60 text-purple-200 border border-purple-800/40'
                }`}
              >
                Ultra Smooth (120 Hz)
              </button>
            </div>
          </div>

          {/* Open Illustrated Rulebook Button */}
          <button
            onClick={() => {
              triggerHaptic.light();
              onOpenRulebook();
            }}
            className="w-full py-2.5 px-3 rounded-2xl bg-purple-950/80 border border-purple-800/60 text-purple-200 text-xs font-black flex items-center justify-between hover:border-pink-500 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-pink-400" />
              <span>Official ICF Carrom Rules Guide</span>
            </div>
            <span className="text-gray-400 text-xs">➔</span>
          </button>

          {/* Reset Progress Danger Zone */}
          <div className="pt-2">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs font-bold hover:bg-rose-950/70 transition-all"
              >
                Reset Progress Data
              </button>
            ) : (
              <div className="p-3 bg-rose-950/80 border border-rose-600 rounded-2xl text-center space-y-2">
                <p className="text-xs text-rose-200 font-bold">
                  Are you sure? This resets all level stars & unlocked items!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-1.5 rounded-xl bg-purple-900 text-white text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onResetData();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black"
                  >
                    Yes, Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

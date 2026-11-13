import React from 'react';
import { Home, Compass, ShoppingBag, Trophy } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export type NavTab = 'home' | 'map' | 'shop' | 'achievements';

interface BottomNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'map' as NavTab, label: 'Saga Map', icon: Compass },
    { id: 'shop' as NavTab, label: 'Locker & Shop', icon: ShoppingBag },
    { id: 'achievements' as NavTab, label: 'Trophies', icon: Trophy },
  ];

  return (
    <div className="w-full max-w-md bg-[#161224] border-t border-purple-900/40 px-3 py-1.5 flex justify-around items-center z-30 select-none shadow-2xl">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              triggerHaptic.light();
              onSelectTab(tab.id);
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isActive
                ? 'text-pink-400 scale-105'
                : 'text-gray-400 hover:text-gray-200 opacity-80'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${
              isActive ? 'bg-pink-600/25 border border-pink-500/40 shadow-glow-pink' : ''
            }`}>
              <Icon size={20} strokeWidth={isActive ? 2.6 : 2} />
            </div>
            <span className={`text-[10px] font-extrabold mt-0.5 ${isActive ? 'text-pink-300' : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

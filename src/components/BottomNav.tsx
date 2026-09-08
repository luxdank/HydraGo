import React from 'react';
import { ScreenType } from '../types';
import { sounds } from '../utils/audio';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  // Hide on splash, login and camera flow to give full screen focus
  if (
    currentScreen === 'splash' ||
    currentScreen === 'login' ||
    currentScreen === 'register_photo_1' ||
    currentScreen === 'register_photo_2' ||
    currentScreen === 'validation' ||
    currentScreen === 'level_up'
  ) {
    return null;
  }

  const navItems = [
    { id: 'home' as ScreenType, label: 'Início', icon: 'water_drop' },
    { id: 'challenges' as ScreenType, label: 'Desafios', icon: 'emoji_events' },
    { id: 'rewards' as ScreenType, label: 'Recompensas', icon: 'featured_seasonal_and_gifts' },
    { id: 'partners' as ScreenType, label: 'Parceiros', icon: 'storefront' },
    { id: 'profile' as ScreenType, label: 'Perfil', icon: 'account_circle' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#e8edff] shadow-[0_-4px_20px_rgba(0,112,243,0.06)] pb-[env(safe-area-inset-bottom,6px)]">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sounds.playWaterDrop();
                onNavigate(item.id);
              }}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all duration-200 cursor-pointer touch-manipulation ${
                isActive
                  ? 'text-[#0070f3] scale-105'
                  : 'text-[#414754] hover:text-[#0070f3] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="relative">
                <span
                  className={`material-symbols-outlined text-[24px] transition-transform ${
                    isActive ? 'font-bold' : ''
                  }`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0070f3]"></span>
                )}
              </div>
              <span
                className={`text-[11px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-[#0070f3]' : 'font-medium text-[#414754]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

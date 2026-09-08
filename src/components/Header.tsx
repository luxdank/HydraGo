import React from 'react';
import { ASSETS } from '../data/mockData';
import { ScreenType, UserProfile } from '../types';
import { Bell, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  currentScreen: ScreenType;
  user: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  user,
  onNavigate,
  soundEnabled,
  onToggleSound,
  onOpenNotifications,
}) => {
  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'home':
        return 'Início';
      case 'challenges':
        return 'Desafios';
      case 'rewards':
        return 'Recompensas';
      case 'partners':
        return 'Parceiros';
      case 'profile':
        return 'Perfil';
      case 'register_photo_1':
      case 'register_photo_2':
        return 'Registrar água';
      case 'validation':
        return 'Validação';
      case 'level_up':
        return 'Conquista';
      default:
        return 'HidraGo';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#e8edff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-left focus:outline-none group cursor-pointer"
          title="Ir para o início"
        >
          <img
            src={ASSETS.logo}
            alt="HidraGo Logo"
            className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0058c3] leading-none">
              HidraGo
            </span>
            <span className="text-base font-bold text-[#111b2f] leading-tight">
              {getScreenTitle()}
            </span>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            onToggleSound();
            sounds.playWaterDrop();
          }}
          aria-label={soundEnabled ? 'Silenciar efeitos sonoros' : 'Ativar efeitos sonoros'}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-[#0070f3] hover:bg-[#f1f3ff] transition-colors"
          title={soundEnabled ? 'Sons ativados' : 'Sons desativados'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        <button
          onClick={() => {
            sounds.playWaterDrop();
            onOpenNotifications();
          }}
          aria-label="Notificações Push"
          className="relative w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-[#0070f3] hover:bg-[#f1f3ff] transition-colors cursor-pointer"
          title="Notificações Push e Lembretes"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff7a00] ring-2 ring-white animate-pulse"></span>
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className="w-8 h-8 rounded-full bg-[#0058c3] text-white flex items-center justify-center overflow-hidden ring-2 ring-[#d8e2ff] transition-transform active:scale-95"
          title="Meu Perfil"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold">LO</span>
          )}
        </button>
      </div>
    </header>
  );
};

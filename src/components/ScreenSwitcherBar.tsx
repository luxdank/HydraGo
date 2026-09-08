import React from 'react';
import { ScreenType } from '../types';
import { Smartphone, Monitor, Image as ImageIcon } from 'lucide-react';

interface ScreenSwitcherBarProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  onOpenImageGallery: () => void;
}

export const ScreenSwitcherBar: React.FC<ScreenSwitcherBarProps> = ({
  currentScreen,
  onSelectScreen,
  isMobileFrame,
  onToggleFrame,
  onOpenImageGallery,
}) => {
  const screens: { id: ScreenType; label: string }[] = [
    { id: 'splash', label: '1. Splash / Abertura' },
    { id: 'home', label: '2. Tela inicial' },
    { id: 'register_photo_1', label: '3. Registrar água (foto 1)' },
    { id: 'register_photo_2', label: '4. Registrar água (foto 2)' },
    { id: 'validation', label: '5. Validação' },
    { id: 'level_up', label: '6. Progressão de nível' },
    { id: 'challenges', label: '7. Desafios' },
    { id: 'rewards', label: '8. Recompensas' },
    { id: 'partners', label: '9. Parceiros' },
    { id: 'profile', label: '10. Perfil' },
  ];

  return (
    <div className="bg-[#111b2f] text-white px-3 py-2 border-b border-slate-700 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Title and Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ccf9] animate-ping"></span>
            <span className="text-xs font-extrabold text-[#b7eaff] tracking-wider uppercase">
              HidraGo • Seletor de Telas
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenImageGallery}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-[#00ccf9] transition-colors"
              title="Ver imagens e links diretos"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Links das Imagens</span>
            </button>

            <button
              onClick={onToggleFrame}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isMobileFrame ? 'Mudar para modo tela cheia' : 'Mudar para moldura de celular'}
            >
              {isMobileFrame ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-[#00ccf9]" />
                  <span className="hidden sm:inline">Expandir</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-[#00ccf9]" />
                  <span className="hidden sm:inline">Modo Celular</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Screen Quick Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5 scrollbar-none">
          {screens.map((s) => {
            const isActive = currentScreen === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectScreen(s.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0070f3] text-white shadow-sm ring-1 ring-white/30'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

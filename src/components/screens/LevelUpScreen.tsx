import React, { useEffect } from 'react';
import { Award, Droplets, ChevronRight, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface LevelUpScreenProps {
  level: number;
  levelTitle: string;
  onViewRewards: () => void;
  onClose: () => void;
}

export const LevelUpScreen: React.FC<LevelUpScreenProps> = ({
  level,
  levelTitle,
  onViewRewards,
  onClose,
}) => {
  useEffect(() => {
    sounds.playLevelUp();
    try {
      // Dual cannon burst
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffd700', '#0070f3', '#00ccf9', '#ff7a00'],
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffd700', '#0070f3', '#00ccf9', '#ff7a00'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#081830] via-[#0b2447] to-[#040d1a] px-5 py-6 text-center text-white select-none">
      {/* Sunburst radial beams */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-r from-[#ffd700]/10 via-[#00ccf9]/15 to-[#0070f3]/15 blur-3xl animate-pulse"></div>
      </div>

      {/* Top Bar with Dismiss */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onClose}
          className="text-xs text-[#b7eaff] bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
        >
          Fechar
        </button>
      </div>

      {/* Centerpiece Golden Medallion */}
      <div className="flex-1 flex flex-col items-center justify-center my-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-6">
          Você subiu de nível!
        </h1>

        {/* Golden Badge Frame */}
        <div className="relative flex items-center justify-center my-2">
          {/* Outer Sunburst Ring */}
          <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-[#f59e0b] via-[#fbbf24] to-[#fde047] p-1.5 shadow-[0_0_50px_rgba(245,158,11,0.4)] flex items-center justify-center animate-spin" style={{ animationDuration: '25s' }}>
            <div className="w-full h-full rounded-full border-4 border-dashed border-[#fffbeb]/40"></div>
          </div>

          {/* Inner Golden Seal */}
          <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-[#d97706] to-[#fbbf24] p-3 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#0058c3] to-[#002f6c] flex items-center justify-center border-4 border-[#fde047] shadow-inner">
              <Droplets className="w-16 h-16 text-[#00ccf9] drop-shadow-[0_0_12px_#00ccf9]" />
            </div>
          </div>

          {/* Level Ribbon Badge */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-2xl bg-gradient-to-r from-[#0058c3] via-[#0070f3] to-[#0058c3] border-2 border-[#fbbf24] shadow-xl text-center min-w-[170px]">
            <span className="text-lg font-extrabold text-white tracking-wide block">
              Nível {level}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-8 flex flex-col items-center">
          <h2 className="text-xl font-extrabold text-[#fde047] tracking-tight">
            {levelTitle}
          </h2>
          <p className="text-xs text-[#d8e2ff] font-medium mt-1.5 max-w-xs">
            Continue assim e desbloqueie novas recompensas e cupons exclusivos!
          </p>
        </div>

        {/* Milestone Indicator */}
        <div className="mt-5 w-full max-w-xs bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#fbbf24]" />
            <span className="text-xs font-semibold text-white">Metas desbloqueadas</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-extrabold text-[#00ccf9]">3 / 5</span>
            <ChevronRight className="w-4 h-4 text-[#b7eaff]" />
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="w-full flex flex-col gap-2.5 pb-3">
        <button
          onClick={onViewRewards}
          className="w-full h-14 rounded-full bg-[#0070f3] hover:bg-[#0058c3] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#0070f3]/40 text-white font-bold text-base tracking-wide cursor-pointer"
        >
          <Gift className="w-5 h-5" />
          <span>Ver recompensas</span>
        </button>

        <button
          onClick={onClose}
          className="text-xs font-semibold text-[#b7eaff] hover:text-white py-1 transition-colors"
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
};

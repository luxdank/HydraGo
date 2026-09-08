import React from 'react';
import { ASSETS } from '../../data/mockData';
import { ScreenType } from '../../types';
import { sounds } from '../../utils/audio';
import { ArrowRight, Camera, Flame, CheckCircle2 } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart, onNavigate }) => {
  const handleStart = () => {
    sounds.playSuccess();
    if (onNavigate) {
      onNavigate('login');
    } else {
      onStart();
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#e0e8ff]/60 via-[#f1f3ff] to-[#f9f9ff] px-5 py-6 text-center select-none">
      {/* Ambient Water Droplets & Hydro Glow Backdrop */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#00ccf9]/20 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-[#0070f3]/15 blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 rounded-full bg-[#b7eaff]/35 blur-2xl"></div>

        {/* Ambient SVG bubbles */}
        <svg className="absolute inset-0 w-full h-full text-[#0070f3]/15" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15%" cy="18%" fill="currentColor" opacity="0.6" r="6" />
          <circle cx="85%" cy="22%" fill="currentColor" opacity="0.4" r="10" />
          <circle cx="88%" cy="52%" fill="currentColor" opacity="0.5" r="7" />
          <circle cx="12%" cy="64%" fill="currentColor" opacity="0.5" r="9" />
          <path
            d="M60,110 C60,110 52,122 52,128 C52,132.4 55.6,136 60,136 C64.4,136 68,132.4 68,128 C68,122 60,110 60,110 Z"
            fill="currentColor"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Header Branding Module */}
      <div className="w-full flex flex-col items-center pt-3 text-center">
        {/* Logo Drop Icon */}
        <div className="relative flex items-center justify-center mb-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#0070f3] to-[#00ccf9] flex items-center justify-center shadow-lg shadow-[#0070f3]/30 ring-4 ring-white">
            <span
              className="material-symbols-outlined text-white text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              water_drop
            </span>
          </div>
        </div>

        {/* App Title */}
        <div className="flex items-center justify-center gap-0.5">
          <h1 className="text-3xl font-extrabold text-[#0058c3] tracking-tight">
            Hidra<span className="text-[#0070f3]">Go</span>
          </h1>
        </div>

        {/* Catchphrase */}
        <p className="text-sm text-[#414754] font-semibold mt-1 tracking-wide">
          Beba. Comprove. Conquiste.
        </p>

        {/* Community Streak Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-sm border border-[#e0e8ff]">
          <Flame className="w-3.5 h-3.5 text-[#be5900] fill-[#be5900]" />
          <span className="text-[11px] font-bold text-[#984600]">Comunidade 100% Hidratada</span>
        </div>
      </div>

      {/* Center Hero Mascot Card with Water Splashes */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-center my-3">
        <div className="relative w-full max-w-[290px] aspect-square flex items-center justify-center">
          {/* Circular Hydro Aura */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#b7eaff]/50 via-[#d8e2ff]/40 to-[#e0e8ff] -z-10 animate-pulse"></div>

          {/* Fox Mascot Image */}
          <div className="relative w-64 h-64 flex items-center justify-center p-2">
            <img
              src={ASSETS.mascotSplash}
              alt="Mascote HidraGo Raposa com Garrafa de Água"
              className="w-full h-full object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-300"
            />
          </div>

          {/* Floating Pill: 500 ml logged */}
          <div className="absolute -bottom-1 -left-2 px-3 py-1.5 rounded-full bg-white shadow-md border border-[#e8edff] flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3s' }}>
            <span
              className="material-symbols-outlined text-[#0070f3] text-base"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              water_bottle
            </span>
            <span className="text-[11px] font-bold text-[#111b2f]">500 ml logged</span>
          </div>

          {/* Floating Pill: +50 pts */}
          <div className="absolute top-2 right-0 px-3 py-1 rounded-full bg-white shadow-md border border-[#e8edff] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00a86b]" />
            <span className="text-[11px] font-extrabold text-[#00677f]">+50 pts</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA & Actions Container */}
      <div className="w-full flex flex-col items-center gap-3 mt-auto pb-4">
        <button
          onClick={handleStart}
          id="btn-comecar"
          type="button"
          className="w-full h-[52px] rounded-full bg-[#0070f3] hover:bg-[#0058c3] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#0070f3]/35 cursor-pointer text-white font-bold text-base tracking-wide"
        >
          <span>Começar</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Secondary Login */}
        <div className="flex items-center justify-center gap-1 text-center">
          <span className="text-sm text-[#414754]">Já tem uma conta?</span>
          <button
            onClick={handleStart}
            type="button"
            className="text-sm font-bold text-[#0058c3] hover:underline cursor-pointer"
          >
            Entrar
          </button>
        </div>

        {/* Trust Note */}
        <div className="flex items-center gap-1.5 text-[#414754]/80 pt-1">
          <Camera className="w-3.5 h-3.5" />
          <span className="text-xs">Validação inteligente por fotos e IA</span>
        </div>
      </div>
    </div>
  );
};

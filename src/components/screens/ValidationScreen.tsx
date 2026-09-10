import React, { useEffect, useState } from 'react';
import { ASSETS } from '../../data/mockData';
import { Check, Droplets, Sparkles, ArrowRight, ShieldCheck, Database, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';
import { AiAnalysisResult } from '../../types';

interface ValidationScreenProps {
  amountMl: number;
  aiResult?: AiAnalysisResult | null;
  photoNumberToday?: number;
  onContinue: () => void;
  onTriggerLevelUp?: () => void;
}

export const ValidationScreen: React.FC<ValidationScreenProps> = ({
  amountMl,
  aiResult,
  photoNumberToday = 1,
  onContinue,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    sounds.playSuccess();
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0070f3', '#00ccf9', '#00c48c', '#ff7a00'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  const liquidName = aiResult?.liquidType || 'Água Mineral';
  const bottleCapacity = aiResult?.bottleCapacityMl || 500;
  const confidencePercent = Math.round((aiResult?.confidence || 0.96) * 100);

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#001f3f] via-[#003366] to-[#081326] px-5 py-6 text-center text-white select-none">
      {/* Hydro Glow Background Lights */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#00ccf9]/20 blur-3xl"></div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#00c48c]/25 blur-3xl"></div>
      </div>

      {/* Top Space / Status */}
      <div className="w-full flex items-center justify-between pt-1">
        <span className="text-xs font-bold uppercase tracking-widest text-[#b7eaff] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#00ccf9]" />
          Validação IA Gemini
        </span>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] text-[#00ccf9]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verificado</span>
        </div>
      </div>

      {/* Mascot and Success Badge Centerpiece */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-center my-2">
        {/* Mascot Character with Bottle */}
        <div className="relative w-56 h-56 flex items-center justify-center">
          <img
            src={ASSETS.mascotSplash}
            alt="Mascote Comemorando"
            className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-500"
          />

          {/* Large Green Checkmark Badge overlay */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#00c48c] text-white flex items-center justify-center shadow-lg shadow-[#00c48c]/50 ring-4 ring-white/20 animate-bounce"
            style={{ animationDuration: '2s' }}
          >
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
        </div>

        {/* Validation Texts */}
        <div className="mt-4 flex flex-col items-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Consumo validado!
          </h2>
          <p className="text-sm text-[#d8e2ff] font-medium mt-1">
            Você bebeu <span className="font-bold text-white">{amountMl} ml</span> de{' '}
            <span className="text-[#00ccf9] font-bold">{liquidName}</span>.
          </p>
        </div>

        {/* AI Recognition Highlights Pill */}
        <div className="mt-3 w-full max-w-xs bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center justify-around shadow-md text-center">
          <div>
            <span className="text-[10px] text-[#b7eaff] uppercase tracking-wider block">Líquido</span>
            <span className="text-xs font-extrabold text-white">{liquidName}</span>
          </div>
          <div className="w-px h-7 bg-white/20"></div>
          <div>
            <span className="text-[10px] text-[#b7eaff] uppercase tracking-wider block">Garrafa</span>
            <span className="text-xs font-extrabold text-[#00ccf9]">{bottleCapacity} ml</span>
          </div>
          <div className="w-px h-7 bg-white/20"></div>
          <div>
            <span className="text-[10px] text-[#b7eaff] uppercase tracking-wider block">IA Confiança</span>
            <span className="text-xs font-extrabold text-[#00c48c]">{confidencePercent}%</span>
          </div>
        </div>

        {/* 6 Photos Progress Pill */}
        <div className="mt-2.5 px-3 py-1 rounded-full bg-[#0070f3]/40 border border-[#00ccf9]/30 text-xs font-semibold text-white flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#00ccf9]" />
          <span>Foto {photoNumberToday} de 6 registrada hoje (próxima em 1h)</span>
        </div>

        {/* Rewards Earned Mini Chip */}
        <div className="mt-2 flex items-center gap-1 text-xs text-[#ffdbc8] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#ffb68b]" />
          <span>+50 XP e +50 Pontos adicionados!</span>
        </div>
      </div>

      {/* Bottom Actions & Details */}
      <div className="w-full flex flex-col items-center gap-2.5">
        {/* Details card (collapsible) */}
        {showDetails && (
          <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-left text-xs space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex justify-between text-[#b7eaff]">
              <span>Confiança da IA Gemini:</span>
              <span className="font-bold text-white">{confidencePercent}%</span>
            </div>
            <div className="flex justify-between text-[#b7eaff]">
              <span>Líquido identificado:</span>
              <span className="font-bold text-white">{liquidName}</span>
            </div>
            <div className="flex justify-between text-[#b7eaff]">
              <span>Capacidade da garrafa:</span>
              <span className="font-bold text-white">{bottleCapacity} ml</span>
            </div>
            <div className="flex justify-between text-[#b7eaff]">
              <span>Nível do líquido:</span>
              <span className="font-bold text-white">{aiResult?.liquidLevel || 'Cheio'}</span>
            </div>
            <div className="flex justify-between text-[#b7eaff]">
              <span>Armazenamento:</span>
              <span className="font-bold text-[#00c48c] flex items-center gap-1">
                <Database className="w-3 h-3" /> Firebase Firestore
              </span>
            </div>
            {aiResult?.notes && (
              <div className="pt-1 border-t border-white/10 text-[11px] text-[#d8e2ff] italic">
                "{aiResult.notes}"
              </div>
            )}
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full h-14 rounded-full bg-[#00c48c] hover:bg-[#00ad7b] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#00c48c]/35 text-white font-bold text-base tracking-wide cursor-pointer"
        >
          <span>Continuar para a Tela Inicial</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Ver detalhes */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs font-semibold text-[#b7eaff] hover:text-white transition-colors cursor-pointer py-1"
        >
          {showDetails ? 'Ocultar detalhes da análise' : 'Ver detalhes da análise da IA e Firestore'}
        </button>
      </div>
    </div>
  );
};

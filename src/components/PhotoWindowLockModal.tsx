import React from 'react';
import { Clock, Lock, Sparkles, Plus, X, Camera, CheckCircle2 } from 'lucide-react';
import { notifications, NotificationWindowStatus } from '../utils/notifications';
import { sounds } from '../utils/audio';

interface PhotoWindowLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: NotificationWindowStatus;
  onUnlockTestWindow: () => void;
  onQuickAddWater: (amount: number) => void;
  onProceedToCamera: () => void;
}

export const PhotoWindowLockModal: React.FC<PhotoWindowLockModalProps> = ({
  isOpen,
  onClose,
  status,
  onUnlockTestWindow,
  onQuickAddWater,
  onProceedToCamera,
}) => {
  if (!isOpen) return null;

  const isMaxReached = status.photosTakenToday >= status.maxPhotosPerDay;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col text-left border border-[#e8edff] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                isMaxReached
                  ? 'bg-[#ecfdf3] text-[#027a48] border-[#a6f4c5]'
                  : 'bg-[#eff8ff] text-[#0070f3] border-[#b9e6fe]'
              }`}
            >
              {isMaxReached ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#111b2f]">
                {isMaxReached ? '6 Fotos Concluídas!' : 'Intervalo de 1 Hora'}
              </h3>
              <p className="text-xs text-[#556075]">
                {isMaxReached
                  ? 'Limite diário de fotos atingido'
                  : 'Aguarde 1 hora entre cada foto de água'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f1f3ff] text-[#414754] hover:bg-[#e0e8ff] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress: 6 photos per day badge */}
        <div className="p-3.5 rounded-2xl bg-[#f8faff] border border-[#e8edff] mb-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#111b2f]">
              Fotos de hoje ({status.photosTakenToday}/{status.maxPhotosPerDay})
            </span>
            <span className="text-[11px] font-extrabold text-[#0070f3]">
              {status.photosTakenToday * 500} ml de 3.000 ml
            </span>
          </div>

          {/* 6 progress dots */}
          <div className="grid grid-cols-6 gap-1.5">
            {Array.from({ length: status.maxPhotosPerDay }).map((_, index) => {
              const isTaken = index < status.photosTakenToday;
              return (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    isTaken ? 'bg-[#00c48c]' : 'bg-[#e0e8ff]'
                  }`}
                  title={`Foto ${index + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Status card */}
        {isMaxReached ? (
          <div className="p-4 rounded-2xl bg-[#ecfdf3] border border-[#a6f4c5] text-[#027a48] mb-4 text-xs flex flex-col gap-1">
            <span className="font-extrabold text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Parabéns pela meta!
            </span>
            <span>
              Você já registrou todas as 6 fotos do dia e acumulou sua hidratação de 3.000 ml.
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0070f3]/10 to-[#00ccf9]/10 border border-[#0070f3]/20 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#0070f3] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#0058c3] uppercase tracking-wider">
                  Próxima foto liberada em
                </span>
                <span className="text-lg font-black text-[#111b2f]">
                  {status.minutesUntilNextPhoto} minutos
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#0070f3] text-white text-[11px] font-bold shadow-xs">
              1h intervalo
            </span>
          </div>
        )}

        <p className="text-xs text-[#556075] leading-relaxed mb-4">
          O HidraGo distribui o consumo ao longo do dia com <strong>6 registros de 500 ml</strong> espaçados por pelo menos <strong>1 hora</strong> para melhor absorção da água.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#e8edff]">
          {/* Test bypass button for testing */}
          <button
            onClick={() => {
              sounds.playWaterDrop();
              notifications.bypassCooldownForTesting();
              onUnlockTestWindow();
              onProceedToCamera();
            }}
            className="w-full py-3 px-3 rounded-2xl bg-gradient-to-r from-[#0070f3] to-[#00ccf9] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Liberar Agora (Ignorar Intervalo p/ Teste)</span>
          </button>

          {isMaxReached && (
            <button
              onClick={() => {
                sounds.playWaterDrop();
                notifications.resetPhotosForTesting();
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#414754] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Reiniciar Fotos do Dia (Modo Teste)</span>
            </button>
          )}

          {/* Quick hydration alternative */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <button
              onClick={() => {
                onQuickAddWater(500);
                onClose();
              }}
              className="flex-1 py-2.5 px-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e0e8ff] text-[#0058c3] text-xs font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar 500 ml direto</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-[#556075] hover:bg-slate-100 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

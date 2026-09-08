import React from 'react';
import { Clock, Lock, Sparkles, Plus, X, Bell } from 'lucide-react';
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

  const formatMinutesRemaining = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col text-left border border-[#e8edff] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#fff0f0] text-[#d92d20] flex items-center justify-center shrink-0 border border-[#fee4e2]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#111b2f]">
                Registro por Foto Bloqueado
              </h3>
              <p className="text-xs text-[#556075]">
                Disponível apenas nos horários de notificação
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

        {/* Next Window Highlight Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0070f3]/10 to-[#00ccf9]/10 border border-[#0070f3]/20 mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#0070f3] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#0058c3] uppercase tracking-wider">
                Próxima Notificação
              </span>
              <span className="text-sm font-extrabold text-[#111b2f]">
                {status.nextSlot ? `${status.nextSlot.time}` : '08:00'}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#0070f3] text-white text-xs font-bold shadow-xs">
            em {formatMinutesRemaining(status.minutesUntilNext)}
          </span>
        </div>

        {/* Explanation text */}
        <p className="text-xs text-[#556075] leading-relaxed mb-3">
          Para garantir hidratação fracionada e saudável, a foto só pode ser registrada durante as <strong>6 notificações diárias</strong> (500 ml cada = 3.000 ml no dia).
        </p>

        {/* 6 Schedule Slots Grid */}
        <div className="flex flex-col gap-1.5 mb-4">
          <span className="text-[11px] font-bold text-[#414754] uppercase tracking-wider flex items-center gap-1">
            <Bell className="w-3 h-3 text-[#0070f3]" />
            Horários das 6 Doses Diárias:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {status.slots.map(({ slot, status: slotStatus }) => {
              const isSlotCompleted = slotStatus === 'completed';
              const isSlotActive = slotStatus === 'active';

              return (
                <div
                  key={slot.id}
                  className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isSlotCompleted
                      ? 'bg-[#ecfdf3] border-[#a6f4c5] text-[#027a48]'
                      : isSlotActive
                      ? 'bg-[#eff8ff] border-[#0070f3] text-[#0070f3] font-bold ring-1 ring-[#0070f3]'
                      : 'bg-[#f8faff] border-[#e8edff] text-[#414754]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm">{slot.time}</span>
                    <span className="text-[10px] opacity-80">{slot.doseNumber}ª Dose (500ml)</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/5">
                    {isSlotCompleted ? '✓ Bebido' : isSlotActive ? 'Aberta!' : 'Aguarde'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goal met notice if applicable */}
        {status.isGoalMet && (
          <div className="p-3 rounded-2xl bg-[#ecfdf3] border border-[#a6f4c5] text-[#027a48] mb-3 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>
              <strong>Meta batida!</strong> Você já concluiu 3.000 ml hoje. As notificações foram pausadas para seu descanso!
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1 border-t border-[#e8edff]">
          {/* Test mode button for instant testing */}
          <button
            onClick={() => {
              sounds.playWaterDrop();
              notifications.openTestWindow(30);
              onUnlockTestWindow();
              onProceedToCamera();
            }}
            className="w-full py-3 px-3 rounded-2xl bg-gradient-to-r from-[#0070f3] to-[#00ccf9] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Simular Horário de Notificação (Liberar Câmera)</span>
          </button>

          {/* Quick hydration alternative */}
          <div className="flex items-center justify-between gap-2">
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
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

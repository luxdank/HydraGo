import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  X,
  ShieldCheck,
  Send,
  Camera,
  Check,
} from 'lucide-react';
import {
  notifications,
  NotificationPermissionState,
  NotificationWindowStatus,
  DAILY_NOTIFICATION_SLOTS,
} from '../utils/notifications';
import { sounds } from '../utils/audio';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickAddWater: (amountMl: number) => void;
  onNavigateToCamera?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onQuickAddWater,
  onNavigateToCamera,
}) => {
  const [permission, setPermission] = useState<NotificationPermissionState>(
    notifications.getPermission()
  );
  const [enabled, setEnabled] = useState<boolean>(notifications.isEnabled());
  const [status, setStatus] = useState<NotificationWindowStatus>(
    notifications.getWindowStatus()
  );
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);

  useEffect(() => {
    setPermission(notifications.getPermission());
    const unsubPerm = notifications.onPermissionChange((perm) => setPermission(perm));
    const unsubWindow = notifications.onWindowStateChange((st) => setStatus(st));
    return () => {
      unsubPerm();
      unsubWindow();
    };
  }, []);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    sounds.playWaterDrop();
    const result = await notifications.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      setFeedbackMsg('Permissão concedida! Você receberá as 6 notificações diárias.');
      notifications.triggerTestNotification();
    } else if (result === 'denied') {
      setFeedbackMsg('As notificações estão bloqueadas nas configurações do seu navegador.');
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    sounds.playWaterDrop();
    await notifications.triggerTestNotification();
    setFeedbackMsg('Notificação de teste disparada e janela de fotos aberta por 30 minutos!');
    setTimeout(() => {
      setIsTesting(false);
    }, 1200);
  };

  const handleToggleEnabled = (checked: boolean) => {
    sounds.playWaterDrop();
    setEnabled(checked);
    notifications.setEnabled(checked);
    if (checked && permission !== 'granted') {
      handleRequestPermission();
    }
  };

  const formatMinutesRemaining = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-[32px] bg-white border border-[#d2e2ff] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 border-b border-[#edf2fa] flex items-center justify-between bg-gradient-to-r from-[#eef5ff] via-white to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0070f3]/10 border border-[#0070f3]/20 flex items-center justify-center text-[#0070f3]">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#111b2f] leading-tight">
                6 Notificações Diárias
              </h3>
              <p className="text-xs text-[#556075]">Meta diária de 3.000 ml (6x 500 ml)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748b] hover:text-[#111b2f] hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-3.5 text-left">
          {/* Feedback message banner */}
          {feedbackMsg && (
            <div className="p-3 rounded-2xl bg-[#e6f4ea] border border-[#ceead6] text-[#137333] text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
              <button
                onClick={() => setFeedbackMsg('')}
                className="text-[#137333] hover:text-[#0b5323] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Goal status banner: "Caso o usuário já tenha batido a meta, não notifique mais." */}
          {status.isGoalMet ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#ecfdf3] to-[#dcfce7] border border-[#86efac] flex items-center gap-3 text-[#14532d]">
              <div className="w-9 h-9 rounded-xl bg-[#22c55e] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold text-[#15803d]">
                  Meta de 3.000 ml Concluída!
                </span>
                <span className="text-[11px] text-[#166534] leading-snug">
                  Todas as notificações de hoje foram <strong>pausadas</strong> para o seu descanso.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#eff8ff] border border-[#b9e6fe] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#0058c3]">Progresso da Meta (3.000 ml)</span>
                <span className="text-sm font-extrabold text-[#111b2f]">
                  {status.currentIntakeMl.toLocaleString('pt-BR')} ml{' '}
                  <span className="text-xs font-normal text-[#556075]">
                    (faltam {(Math.max(0, 3000 - status.currentIntakeMl)).toLocaleString('pt-BR')} ml)
                  </span>
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#0070f3] text-white text-[11px] font-bold">
                {Math.min(100, Math.round((status.currentIntakeMl / 3000) * 100))}%
              </span>
            </div>
          )}

          {/* Browser Permission Status Card */}
          <div className="p-3 rounded-2xl bg-[#f8faff] border border-[#d9e5fc] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#111b2f] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0070f3]" />
                Notificações no Dispositivo:
              </span>
              {permission === 'granted' ? (
                <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ativadas
                </span>
              ) : (
                <button
                  onClick={handleRequestPermission}
                  className="px-2.5 py-1 rounded-lg bg-[#0070f3] text-white text-[11px] font-bold hover:bg-[#0058c3] transition-colors"
                >
                  Permitir Push
                </button>
              )}
            </div>
          </div>

          {/* 6 Fixed Schedule Slots List */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#111b2f] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0070f3]" />
                As 6 Notificações do Dia (500 ml cada):
              </span>
              <span className="text-[11px] font-bold text-[#0070f3]">6x ao dia</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {status.slots.map(({ slot, status: slotStatus }) => {
                const isCompleted = slotStatus === 'completed';
                const isActive = slotStatus === 'active';

                return (
                  <div
                    key={slot.id}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                      isCompleted
                        ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]'
                        : isActive
                        ? 'bg-[#f0f7ff] border-[#0070f3] ring-1 ring-[#0070f3] text-[#0070f3]'
                        : 'bg-white border-[#e8edff] text-[#334155]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isCompleted
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : isActive
                            ? 'bg-[#0070f3] text-white animate-pulse'
                            : 'bg-[#f1f3ff] text-[#414754]'
                        }`}
                      >
                        {slot.time}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight">
                          {slot.doseNumber}ª Dose • 500 ml
                        </span>
                        <span className="text-[10px] text-[#64748b]">
                          {slot.title.split(':')[1]?.trim() || slot.title}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : isActive
                          ? 'bg-[#0070f3] text-white'
                          : 'bg-slate-100 text-[#64748b]'
                      }`}
                    >
                      {isCompleted ? '✓ Concluído' : isActive ? 'Câmera Aberta' : 'Pendente'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo Registration Rule Explanation */}
          <div className="p-3 rounded-2xl bg-[#fffbeb] border border-[#fef08a] flex flex-col gap-1 text-[#854d0e]">
            <span className="text-xs font-bold flex items-center gap-1.5">
              📸 Regra de Registro por Foto:
            </span>
            <p className="text-[11px] leading-relaxed text-[#713f12]">
              A foto da garrafa só fica liberada durante as 6 janelas de notificação diárias para você beber em horários saudáveis.
            </p>
          </div>

          {/* Test Push Notification & Open Camera */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={handleTestNotification}
              id="btn-test-push-notification"
              disabled={isTesting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0070f3] to-[#00ccf9] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:brightness-105 active:scale-[0.98]"
            >
              <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>
                {isTesting
                  ? 'Disparando notificação...'
                  : 'Testar Notificação Push & Liberar Janela (30 min)'}
              </span>
            </button>

            {status.isOpen && onNavigateToCamera && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToCamera();
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#ecfdf3] border border-[#a6f4c5] text-[#027a48] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#dcfce7] transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Ir para a Câmera Agora (Janela Aberta)</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8faff] border-t border-[#edf2fa] flex items-center justify-between">
          <p className="text-[11px] text-[#717d96]">
            Meta: 3.000 ml • 6 notificações de 500 ml
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#111b2f] text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

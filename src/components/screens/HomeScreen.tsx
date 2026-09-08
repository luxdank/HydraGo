import React, { useState, useEffect } from 'react';
import { UserProfile, Challenge, ScreenType } from '../../types';
import { Camera, ChevronRight, Trophy, Plus, BellRing, Lock, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { notifications, NotificationWindowStatus } from '../../utils/notifications';
import { PhotoWindowLockModal } from '../PhotoWindowLockModal';

interface HomeScreenProps {
  user: UserProfile;
  weeklyChallenge: Challenge;
  onNavigate: (screen: ScreenType) => void;
  onQuickAddWater: (amountMl: number) => void;
  onOpenNotifications?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  weeklyChallenge,
  onNavigate,
  onQuickAddWater,
  onOpenNotifications,
}) => {
  const [windowStatus, setWindowStatus] = useState<NotificationWindowStatus>(
    notifications.getWindowStatus()
  );
  const [isLockModalOpen, setIsLockModalOpen] = useState<boolean>(false);

  // Sync user state with notifications engine & listen for window changes
  useEffect(() => {
    notifications.updateUserState(user.currentIntakeMl, user.dailyGoalMl);
    const unsub = notifications.onWindowStateChange((st) => setWindowStatus(st));
    return () => unsub();
  }, [user.currentIntakeMl, user.dailyGoalMl]);

  const percentage = Math.min(
    100,
    Math.round((user.currentIntakeMl / user.dailyGoalMl) * 100)
  );
  const remainingMl = Math.max(0, user.dailyGoalMl - user.currentIntakeMl);

  // SVG circular gauge calculations
  // radius = 100, circumference = 2 * PI * 100 = 628
  const circumference = 628;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const formatMinutesRemaining = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const handleRegisterWaterClick = () => {
    sounds.playWaterDrop();
    // RULE: "Usuário só poderá registras a foto nos horários da notificação."
    if (windowStatus.isOpen) {
      onNavigate('register_photo_1');
    } else {
      setIsLockModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 pb-24 pt-2 gap-4">
      {/* Top Greeting & Notifications Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div
            onClick={() => onNavigate('profile')}
            className="relative w-12 h-12 rounded-full overflow-hidden bg-[#d8e2ff] flex items-center justify-center shadow-sm cursor-pointer ring-2 ring-[#0070f3]/20 hover:scale-105 transition-transform"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-[#111b2f]">
                Olá, {user.name.split(' ')[0]}!
              </span>
              <span className="text-lg">💧</span>
            </div>
            <span className="text-xs text-[#414754]">
              Meta de 3.000 ml • 6 doses ao dia
            </span>
          </div>
        </div>

        {/* Bell Button */}
        <button
          onClick={onOpenNotifications}
          aria-label="Notificações e lembretes de hidratação"
          className="relative w-10 h-10 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#414754] hover:text-[#0070f3] active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <BellRing className="w-5 h-5 text-[#0070f3]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0070f3] ring-2 ring-white"></span>
        </button>
      </div>

      {/* Goal Reached Notification Banner (Rule: "Caso o usuário já tenha batido a meta, não notifique mais.") */}
      {windowStatus.isGoalMet ? (
        <div className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#ecfdf3] to-[#dcfce7] border border-[#86efac] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-[#22c55e] text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-[#15803d]">
                Meta de 3.000 ml Concluída!
              </span>
              <span className="text-[11px] text-[#166534]">
                Notificações pausadas hoje para o seu descanso.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#15803d] text-white text-[11px] font-bold">
            100%
          </span>
        </div>
      ) : (
        /* Notification Window Status Pill */
        <div
          onClick={() => {
            if (!windowStatus.isOpen) {
              setIsLockModalOpen(true);
            } else {
              onNavigate('register_photo_1');
            }
          }}
          className={`w-full p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
            windowStatus.isOpen
              ? 'bg-[#eff8ff] border-[#0070f3] text-[#0058c3] shadow-xs'
              : 'bg-[#f8faff] border-[#e2eaf8] text-[#556075]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {windowStatus.isOpen ? (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0070f3] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0070f3]"></span>
              </span>
            ) : (
              <Lock className="w-4 h-4 text-[#d92d20]" />
            )}
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-[#111b2f]">
                {windowStatus.isOpen
                  ? `Janela de Foto Aberta (${windowStatus.activeSlot?.time || 'Agora'})`
                  : `Foto Bloqueada: Próxima às ${windowStatus.nextSlot?.time || '08:00'}`}
              </span>
              <span className="text-[11px] text-[#556075]">
                {windowStatus.isOpen
                  ? `Válida por mais ${windowStatus.minutesRemainingInActiveWindow} min • Validação IA liberada`
                  : `Abre em ${formatMinutesRemaining(windowStatus.minutesUntilNext)} (1 das 6 doses diárias)`}
              </span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              windowStatus.isOpen
                ? 'bg-[#0070f3] text-white'
                : 'bg-[#fff0f0] text-[#d92d20] border border-[#fee4e2]'
            }`}
          >
            {windowStatus.isOpen ? 'Liberada' : 'Aguardar'}
          </span>
        </div>
      )}

      {/* Circular Hydration Gauge Card */}
      <div className="relative w-full rounded-3xl bg-white p-5 shadow-[0_8px_24px_-4px_rgba(0,112,243,0.08)] border border-[#e8edff] flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient Hydro Glows */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#00ccf9]/15 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#0070f3]/10 blur-2xl pointer-events-none"></div>

        {/* Circular Gauge Visualization */}
        <div className="relative w-64 h-64 flex items-center justify-center my-1">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
            <defs>
              <linearGradient id="hydroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0070f3" />
                <stop offset="100%" stopColor="#00ccf9" />
              </linearGradient>
            </defs>
            {/* Background Track */}
            <circle
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke="#e8edff"
              strokeWidth="18"
              strokeLinecap="round"
            />
            {/* Dynamic Progress Arc */}
            <circle
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke="url(#hydroGradient)"
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Hydration Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <div className="w-12 h-12 rounded-full bg-[#f1f3ff] flex items-center justify-center mb-1 shadow-inner text-[#0070f3]">
              <span
                className="material-symbols-outlined text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                water_drop
              </span>
            </div>
            <div className="text-3xl font-extrabold text-[#111b2f] tracking-tight">
              {user.currentIntakeMl.toLocaleString('pt-BR')}{' '}
              <span className="text-base font-bold text-[#414754]">ml</span>
            </div>
            <span className="text-xs font-semibold text-[#414754] mt-0.5">
              de {user.dailyGoalMl.toLocaleString('pt-BR')} ml
            </span>
            <span className="mt-2 px-3 py-0.5 rounded-full bg-[#b7eaff] text-[#005266] text-[11px] font-bold">
              {percentage}% da meta diária
            </span>
          </div>
        </div>

        {/* Quick Stats Metric Tiles */}
        <div className="grid grid-cols-2 gap-3 w-full mt-2">
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#f1f3ff]">
            <span className="text-xs text-[#414754] font-medium">Meta diária</span>
            <span className="text-base text-[#0058c3] font-bold mt-0.5">
              {user.dailyGoalMl.toLocaleString('pt-BR')} ml
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#f1f3ff]">
            <span className="text-xs text-[#414754] font-medium">Faltam</span>
            <span className="text-base text-[#984600] font-bold mt-0.5">
              {remainingMl.toLocaleString('pt-BR')} ml
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action: Registrar Água Button (Enforces Notification Window) */}
      <div className="flex flex-col gap-1.5">
        <button
          onClick={handleRegisterWaterClick}
          id="btn-registrar-camera"
          className={`w-full h-14 rounded-full font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-md ${
            windowStatus.isOpen
              ? 'bg-[#0070f3] text-white hover:bg-[#0058c3] shadow-[0_10px_20px_-2px_rgba(0,112,243,0.35)]'
              : 'bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {windowStatus.isOpen ? (
            <>
              <Camera className="w-5 h-5" />
              <span>Registrar água (Janela Aberta • 500 ml)</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 text-[#d92d20]" />
              <span>Registrar água (Abre às {windowStatus.nextSlot?.time || '08:00'})</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-[#717d96] text-center">
          {windowStatus.isOpen
            ? 'Janela de notificação ativa! Tire fotos da garrafa cheia e vazia para validar.'
            : '🔒 Foto permitida apenas nos 6 horários diários de notificação. Clique para ver horários.'}
        </p>
      </div>

      {/* Quick Add Bar for convenience */}
      <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
        <span className="text-xs font-semibold text-[#414754]">Adição rápida:</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onQuickAddWater(250)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white border border-[#e0e8ff] hover:bg-[#e8edff] text-[#0058c3] text-xs font-bold shadow-xs active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>250 ml</span>
          </button>
          <button
            onClick={() => onQuickAddWater(500)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white border border-[#e0e8ff] hover:bg-[#e8edff] text-[#0058c3] text-xs font-bold shadow-xs active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>500 ml</span>
          </button>
        </div>
      </div>

      {/* 6 Daily Notifications Schedule Card */}
      <div className="rounded-3xl bg-white p-4 border border-[#e8edff] shadow-[0_4px_16px_-2px_rgba(0,112,243,0.06)] flex flex-col gap-3 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#e8edff] text-[#0070f3] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-[#111b2f]">
                6 Notificações Diárias
              </h3>
              <p className="text-[10px] text-[#64748b]">Meta 3.000 ml • 6 doses de 500 ml</p>
            </div>
          </div>
          <button
            onClick={onOpenNotifications}
            className="text-xs font-bold text-[#0070f3] hover:underline cursor-pointer"
          >
            Gerenciar
          </button>
        </div>

        {/* 6 Times Chips */}
        <div className="grid grid-cols-3 gap-2">
          {windowStatus.slots.map(({ slot, status: slotStatus }) => {
            const isCompleted = slotStatus === 'completed';
            const isActive = slotStatus === 'active';

            return (
              <div
                key={slot.id}
                onClick={onOpenNotifications}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  isCompleted
                    ? 'bg-[#ecfdf3] border-[#a6f4c5] text-[#027a48]'
                    : isActive
                    ? 'bg-[#eff8ff] border-[#0070f3] text-[#0070f3] font-extrabold ring-1 ring-[#0070f3]'
                    : 'bg-[#f8faff] border-[#e8edff] text-[#414754]'
                }`}
              >
                <span className="text-xs font-extrabold">{slot.time}</span>
                <span className="text-[10px] opacity-75">
                  {isCompleted ? '✓ Bebido' : isActive ? 'Aberta' : '500 ml'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Simulation / Quick Unlock Helper */}
        <div className="flex items-center justify-between pt-1 border-t border-[#f1f3ff]">
          <span className="text-[11px] text-[#556075]">
            Quer testar a câmera agora?
          </span>
          <button
            onClick={() => {
              sounds.playWaterDrop();
              notifications.openTestWindow(30);
              onNavigate('register_photo_1');
            }}
            className="text-[11px] font-bold text-[#0070f3] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#0070f3]" />
            Simular Janela de Foto
          </button>
        </div>
      </div>

      {/* Desafios em Andamento Section */}
      <div className="flex flex-col gap-2.5 mt-1">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-[#111b2f]">Desafios em andamento</span>
          <button
            onClick={() => onNavigate('challenges')}
            className="text-xs font-extrabold text-[#0070f3] uppercase tracking-wider hover:underline flex items-center cursor-pointer"
          >
            Ver todos
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        {/* Challenge Card */}
        <div
          onClick={() => onNavigate('challenges')}
          className="w-full rounded-2xl bg-white p-4 shadow-[0_8px_24px_-4px_rgba(0,112,243,0.08)] border border-[#e8edff] flex flex-col gap-3 cursor-pointer active:scale-[0.99] transition-transform hover:border-[#aec6ff]"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#ffdbc8] flex items-center justify-center text-[#984600] shadow-sm">
                <Trophy className="w-6 h-6 text-[#be5900]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-[#111b2f]">
                  {weeklyChallenge.title}
                </span>
                <span className="text-xs text-[#414754]">
                  {weeklyChallenge.description}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#f1f3ff] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#ff7a00] to-[#ffaa00] h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (weeklyChallenge.currentProgress / weeklyChallenge.target) * 100
                )}%`,
              }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-[#414754]">
            <span>Progresso da semana</span>
            <span className="text-[#984600] font-bold">
              {weeklyChallenge.currentProgress}/{weeklyChallenge.target} dias
            </span>
          </div>
        </div>
      </div>

      {/* Photo Lock Modal */}
      <PhotoWindowLockModal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        status={windowStatus}
        onUnlockTestWindow={() => {
          setIsLockModalOpen(false);
        }}
        onQuickAddWater={onQuickAddWater}
        onProceedToCamera={() => {
          setIsLockModalOpen(false);
          onNavigate('register_photo_1');
        }}
      />
    </div>
  );
};

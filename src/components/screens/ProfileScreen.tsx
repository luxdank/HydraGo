import React, { useState } from 'react';
import { ASSETS } from '../../data/mockData';
import { UserProfile, ScreenType } from '../../types';
import {
  Flame,
  Trophy,
  Gift,
  ChevronRight,
  Edit2,
  Settings,
  HelpCircle,
  Sliders,
  BarChart2,
  LogOut,
  Sparkles,
  UserCheck,
  BellRing,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ProfileScreenProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onNavigate: (screen: ScreenType) => void;
  onLogout: () => void;
  onOpenNotifications?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onUpdateUser,
  onNavigate,
  onLogout,
  onOpenNotifications,
}) => {
  const [isEditingBottle, setIsEditingBottle] = useState(false);
  const [selectedBottleMl, setSelectedBottleMl] = useState(user.defaultBottleMl);
  const [bottleName, setBottleName] = useState(user.defaultBottleName);

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoalMl, setNewGoalMl] = useState(user.dailyGoalMl);

  const handleSaveBottle = () => {
    onUpdateUser({
      defaultBottleMl: selectedBottleMl,
      defaultBottleName: bottleName,
    });
    setIsEditingBottle(false);
    sounds.playWaterDrop();
  };

  const handleSaveGoal = () => {
    onUpdateUser({
      dailyGoalMl: newGoalMl,
    });
    setIsEditingGoal(false);
    sounds.playWaterDrop();
  };

  return (
    <div className="flex flex-col w-full px-4 pb-24 pt-2 gap-3.5 text-left">
      {/* Profile Header Card */}
      <section className="bg-white rounded-3xl p-4 shadow-[0_8px_24px_-4px_rgba(0,112,243,0.08)] border border-[#e8edff] flex flex-col gap-3.5 relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          {/* Mascot Avatar with Verified Badge */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#d8e2ff] flex items-center justify-center shrink-0 shadow-md ring-2 ring-[#0070f3]/20">
            <img
              src={user.avatarUrl || ASSETS.mascotProfile}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00ccf9] border-2 border-white flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[12px] text-[#001f28]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
          </div>

          {/* Identity & Level */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-extrabold text-[#111b2f] truncate">
                {user.name}
              </h1>
              <button
                onClick={() => {
                  const newName = prompt('Editar seu nome:', user.name);
                  if (newName && newName.trim()) {
                    onUpdateUser({ name: newName.trim() });
                  }
                }}
                className="text-slate-400 hover:text-[#0070f3] p-1 transition-colors"
                title="Editar perfil"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#0058c3] font-bold mt-0.5">
              Nível {user.level} • {user.levelTitle}
            </p>
            {(user.age || user.email) && (
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#556075] flex-wrap">
                {user.age ? <span>{user.age} anos</span> : null}
                {user.age && user.email ? <span>•</span> : null}
                {user.email ? <span className="truncate max-w-[180px]">{user.email}</span> : null}
              </div>
            )}
          </div>
        </div>

        {/* XP Progression Module */}
        <div className="bg-[#f1f3ff] rounded-2xl p-3 flex flex-col gap-1.5 border border-[#e0e8ff]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#be5900]" />
              <span className="text-[10px] font-bold text-[#414754] uppercase tracking-wider">
                Progresso de XP
              </span>
            </div>
            <span className="text-[11px] font-extrabold text-[#0070f3]">
              {user.currentXp.toLocaleString('pt-BR')} / {user.maxXp.toLocaleString('pt-BR')} pts
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#d8e2fd] rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#0070f3] via-[#00ccf9] to-[#b7eaff] rounded-full shadow-sm transition-all duration-700"
              style={{ width: `${(user.currentXp / user.maxXp) * 100}%` }}
            ></div>
          </div>

          <p className="text-[11px] text-[#414754] text-right font-medium">
            Faltam {user.maxXp - user.currentXp} pts para o Nível {user.level + 1}
          </p>
        </div>
      </section>

      {/* Key Metrics Row (3-Stat Counter) */}
      <section className="grid grid-cols-3 gap-2.5">
        {/* Streak */}
        <div className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-[0_4px_16px_-2px_rgba(0,112,243,0.06)] border border-[#e8edff]">
          <div className="w-8 h-8 rounded-full bg-[#ffdbc8] flex items-center justify-center mb-1 text-[#984600]">
            <Flame className="w-4 h-4 text-[#be5900] fill-[#be5900]" />
          </div>
          <span className="text-xl font-black text-[#111b2f] leading-tight">
            {user.streakDays}
          </span>
          <span className="text-[11px] text-[#414754] font-medium leading-tight mt-0.5">
            Dias seguidos
          </span>
        </div>

        {/* Challenges */}
        <div className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-[0_4px_16px_-2px_rgba(0,112,243,0.06)] border border-[#e8edff]">
          <div className="w-8 h-8 rounded-full bg-[#d8e2ff] flex items-center justify-center mb-1 text-[#0058c3]">
            <Trophy className="w-4 h-4 text-[#0058c3]" />
          </div>
          <span className="text-xl font-black text-[#111b2f] leading-tight">
            {user.completedChallenges}
          </span>
          <span className="text-[11px] text-[#414754] font-medium leading-tight mt-0.5">
            Desafios feitos
          </span>
        </div>

        {/* Saved Coupons */}
        <div className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-[0_4px_16px_-2px_rgba(0,112,243,0.06)] border border-[#e8edff]">
          <div className="w-8 h-8 rounded-full bg-[#b7eaff] flex items-center justify-center mb-1 text-[#00677f]">
            <Gift className="w-4 h-4 text-[#00677f]" />
          </div>
          <span className="text-xl font-black text-[#111b2f] leading-tight">
            {user.savedCoupons}
          </span>
          <span className="text-[11px] text-[#414754] font-medium leading-tight mt-0.5">
            Cupons salvos
          </span>
        </div>
      </section>

      {/* Interactive Menu List Stack */}
      <section className="flex flex-col gap-2">
        {/* Minha garrafa padrão */}
        <button
          onClick={() => setIsEditingBottle(true)}
          className="w-full bg-white hover:bg-[#f1f3ff] transition-all rounded-2xl p-3.5 flex items-center justify-between shadow-[0_4px_16px_-2px_rgba(0,112,243,0.05)] border border-[#e8edff] text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#d8e2ff] flex items-center justify-center text-[#0058c3] shrink-0">
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                water_bottle
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#111b2f]">
                Minha garrafa padrão
              </span>
              <span className="text-xs text-[#0058c3] font-extrabold">
                {user.defaultBottleMl} ml • {user.defaultBottleName}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0070f3] transition-colors" />
        </button>

        {/* Histórico de consumo */}
        <button
          onClick={() =>
            alert(
              `Histórico de Consumo:\nTotal consumido hoje: ${user.currentIntakeMl} ml\nMédia semanal: 1.850 ml/dia\nFotos aprovadas com IA: 14 fotos`
            )
          }
          className="w-full bg-white hover:bg-[#f1f3ff] transition-all rounded-2xl p-3.5 flex items-center justify-between shadow-[0_4px_16px_-2px_rgba(0,112,243,0.05)] border border-[#e8edff] text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#b7eaff] flex items-center justify-center text-[#00677f] shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#111b2f]">
                Histórico de consumo
              </span>
              <span className="text-xs text-[#414754]">
                Relatórios semanais e fotos aprovadas
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0070f3] transition-colors" />
        </button>

        {/* Notificações Push & Lembretes */}
        <button
          onClick={() => {
            sounds.playWaterDrop();
            if (onOpenNotifications) onOpenNotifications();
          }}
          className="w-full bg-white hover:bg-[#f1f3ff] transition-all rounded-2xl p-3.5 flex items-center justify-between shadow-[0_4px_16px_-2px_rgba(0,112,243,0.05)] border border-[#e8edff] text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#e0edff] flex items-center justify-center text-[#0070f3] shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#111b2f]">
                  Notificações Push & Lembretes
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] text-[10px] font-bold">
                  Configurar
                </span>
              </div>
              <span className="text-xs text-[#414754]">
                Alertas sonoros e lembretes de beber água
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0070f3] transition-colors" />
        </button>

        {/* Preferências de hidratação */}
        <button
          onClick={() => setIsEditingGoal(true)}
          className="w-full bg-white hover:bg-[#f1f3ff] transition-all rounded-2xl p-3.5 flex items-center justify-between shadow-[0_4px_16px_-2px_rgba(0,112,243,0.05)] border border-[#e8edff] text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#e8edff] flex items-center justify-center text-[#414754] shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#111b2f]">
                Preferências de hidratação
              </span>
              <span className="text-xs text-[#414754]">
                Meta diária ({user.dailyGoalMl} ml), clima e alertas
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0070f3] transition-colors" />
        </button>

        {/* Ajuda e suporte */}
        <button
          onClick={() =>
            alert(
              'Ajuda HidraGo:\n\nComo funciona a validação por foto?\n1. Tire uma foto do recipiente mostrando o nível do líquido.\n2. Tire uma foto da graduação ou capacidade do recipiente.\n3. A IA calcula a densidade e volume para conceder seus pontos e XP!'
            )
          }
          className="w-full bg-white hover:bg-[#f1f3ff] transition-all rounded-2xl p-3.5 flex items-center justify-between shadow-[0_4px_16px_-2px_rgba(0,112,243,0.05)] border border-[#e8edff] text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#e8edff] flex items-center justify-center text-[#414754] shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#111b2f]">
                Ajuda e suporte
              </span>
              <span className="text-xs text-[#414754]">
                Dúvidas sobre IA de validação e termos
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0070f3] transition-colors" />
        </button>

        {/* Configurações da conta */}
        <button
          onClick={() =>
            alert('Configurações:\nNotificações Push: Ativadas\nBackup na nuvem: Ativo\nVersão do app: 1.0.0')
          }
          className="w-full bg-white hover:bg-[#f1f3ff] transition-all rounded-2xl p-3.5 flex items-center justify-between shadow-[0_4px_16px_-2px_rgba(0,112,243,0.05)] border border-[#e8edff] text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#e8edff] flex items-center justify-center text-[#414754] shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#111b2f]">
                Configurações da conta
              </span>
              <span className="text-xs text-[#414754]">
                Segurança, e-mail e notificações push
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0070f3] transition-colors" />
        </button>
      </section>

      {/* Motivational Mascot Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0058c3] via-[#0070f3] to-[#00677f] p-4 text-white shadow-[0_12px_28px_-4px_rgba(0,112,243,0.32)]">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-20 h-20 shrink-0 relative drop-shadow-lg">
            <img
              src={ASSETS.mascotCheering}
              alt="Hidro Raposa Comemorando"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-[#b7eaff] uppercase tracking-wider mb-0.5">
              Dica do HidraGo
            </span>
            <p className="text-sm font-extrabold text-white leading-snug">
              “Pequenos hábitos geram grandes conquistas!”
            </p>
            <span className="text-[11px] text-[#d8e2ff] mt-1 font-medium">
              Você está a {Math.max(0, user.dailyGoalMl - user.currentIntakeMl)}ml da meta de hoje. Vamos lá!
            </span>
          </div>
        </div>
      </section>

      {/* Secondary Logout Action */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={() => onNavigate('login')}
          className="w-full py-3 rounded-2xl bg-white border border-[#d2dff5] text-[#0058c3] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#f0f6ff] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
        >
          <UserCheck className="w-4 h-4" />
          <span>Alternar Conta / Conectar com Google</span>
        </button>

        <div className="flex justify-center pt-1">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-[#ba1a1a] hover:text-[#93000a] text-xs font-bold py-2 px-4 rounded-full transition-colors active:opacity-75 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar sessão</span>
          </button>
        </div>
      </div>

      {/* Bottle Configuration Modal */}
      {isEditingBottle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col text-left animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold text-[#111b2f] mb-1">
              Garrafa Padrão
            </h3>
            <p className="text-xs text-[#414754] mb-4">
              Configure a capacidade da sua garrafa para agilizar as validações por foto.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#111b2f] block mb-1">
                  Nome da Garrafa:
                </label>
                <input
                  type="text"
                  value={bottleName}
                  onChange={(e) => setBottleName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#c1c6d7] focus:border-[#0070f3] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#111b2f] block mb-1">
                  Volume / Capacidade (ml):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[350, 500, 650, 750, 1000, 1500].map((ml) => (
                    <button
                      key={ml}
                      type="button"
                      onClick={() => setSelectedBottleMl(ml)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        selectedBottleMl === ml
                          ? 'bg-[#0070f3] text-white border-[#0070f3]'
                          : 'bg-[#f1f3ff] text-[#414754] border-[#e0e8ff]'
                      }`}
                    >
                      {ml} ml
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setIsEditingBottle(false)}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-[#414754] bg-[#f1f3ff]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBottle}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-white bg-[#0070f3]"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Configuration Modal */}
      {isEditingGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col text-left animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold text-[#111b2f] mb-1">
              Meta Diária de Água
            </h3>
            <p className="text-xs text-[#414754] mb-4">
              Ajuste sua meta diária recomendada de acordo com sua rotina de exercícios.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1500, 2000, 2500, 3000, 3500, 4000].map((ml) => (
                <button
                  key={ml}
                  type="button"
                  onClick={() => setNewGoalMl(ml)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    newGoalMl === ml
                      ? 'bg-[#0070f3] text-white border-[#0070f3]'
                      : 'bg-[#f1f3ff] text-[#414754] border-[#e0e8ff]'
                  }`}
                >
                  {ml} ml
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingGoal(false)}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-[#414754] bg-[#f1f3ff]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveGoal}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-white bg-[#0070f3]"
              >
                Salvar Meta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

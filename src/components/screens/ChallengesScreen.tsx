import React, { useState } from 'react';
import { ASSETS } from '../../data/mockData';
import { Challenge, ScreenType } from '../../types';
import { Trophy, Gift, Flame, Lock, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ChallengesScreenProps {
  challenges: Challenge[];
  streakDays: number;
  onNavigate: (screen: ScreenType) => void;
}

export const ChallengesScreen: React.FC<ChallengesScreenProps> = ({
  challenges,
  streakDays,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const activeChallenges = challenges.filter((c) => !c.completed);
  const completedChallenges = challenges.filter((c) => c.completed);

  const weekly = challenges.find((c) => c.category === 'semanal') || challenges[0];
  const monthly = challenges.find((c) => c.category === 'mensal') || challenges[1];

  const weeklyPct = weekly && weekly.maxProgress > 0
    ? Math.min(100, Math.round((weekly.currentProgress / weekly.maxProgress) * 100))
    : 0;
  const weeklyDays = Math.round((weeklyPct / 100) * 7);
  const weeklyRemainingMl = weekly ? Math.max(0, weekly.maxProgress - weekly.currentProgress) : 0;

  const monthlyPct = monthly && monthly.maxProgress > 0
    ? Math.min(100, Math.round((monthly.currentProgress / monthly.maxProgress) * 100))
    : 0;

  return (
    <div className="flex flex-col w-full px-4 pb-24 pt-2 gap-4">
      {/* Energy / Streak Overview Header */}
      <div className="flex items-center justify-between bg-[#f1f3ff] rounded-2xl p-3.5 border border-[#e0e8ff] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#b7eaff] flex items-center justify-center text-[#00677f] shadow-sm">
            <Flame className="w-5 h-5 text-[#be5900] fill-[#be5900]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-[#414754] uppercase tracking-wider">
              Sequência Atual
            </span>
            <span className="text-sm font-extrabold text-[#111b2f]">
              {streakDays} Dias Ativos
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full shadow-sm border border-[#e8edff]">
          <Sparkles className="w-3.5 h-3.5 text-[#be5900]" />
          <span className="text-xs font-bold text-[#111b2f]">
            {streakDays > 0 ? `+${streakDays * 25} pts` : '0 pts'}
          </span>
        </div>
      </div>

      {/* Segmented Tabs (Em andamento / Concluídos) */}
      <div className="flex p-1 bg-[#e8edff] rounded-full gap-1">
        <button
          onClick={() => {
            sounds.playWaterDrop();
            setActiveTab('active');
          }}
          className={`flex-1 py-2 rounded-full text-center text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'active'
              ? 'bg-[#0070f3] text-white shadow-sm'
              : 'text-[#414754] hover:text-[#111b2f]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ fontVariationSettings: activeTab === 'active' ? "'FILL' 1" : "'FILL' 0" }}
          >
            timelapse
          </span>
          <span>Em andamento</span>
        </button>

        <button
          onClick={() => {
            sounds.playWaterDrop();
            setActiveTab('completed');
          }}
          className={`flex-1 py-2 rounded-full text-center text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-[#0070f3] text-white shadow-sm'
              : 'text-[#414754] hover:text-[#111b2f]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ fontVariationSettings: activeTab === 'completed' ? "'FILL' 1" : "'FILL' 0" }}
          >
            verified
          </span>
          <span>Concluídos</span>
        </button>
      </div>

      {/* Tab: Em andamento */}
      {activeTab === 'active' && (
        <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
          {/* Featured Card: Desafio Semanal (Royal Blue from screenshots) */}
          <div className="relative overflow-hidden rounded-3xl bg-[#0058c3] text-white p-5 shadow-xl shadow-[#0058c3]/20 flex flex-col gap-3.5">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#00ccf9]/20 blur-2xl pointer-events-none"></div>

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <Trophy className="w-6 h-6 text-[#ffd700]" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                      Semanal
                    </span>
                    <span className="text-[11px] font-extrabold text-[#b7eaff]">+50 pts</span>
                  </div>
                  <h2 className="text-base font-extrabold text-white mt-0.5">
                    Desafio Semanal
                  </h2>
                </div>
              </div>
              <button
                onClick={() => onNavigate('register_photo_1')}
                className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                title="Ir registrar água"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-white/90 text-left relative z-10 font-medium">
              Beba <strong className="text-white">14.000 ml</strong> esta semana e garanta seu bônus no ranking!
            </p>

            {/* Progress */}
            <div className="flex flex-col gap-1.5 relative z-10 pt-1">
              <div className="flex justify-between items-center text-white text-xs">
                <span className="font-semibold flex items-center gap-1">
                  <span>📅</span> Progresso
                </span>
                <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  {weeklyDays} / 7 dias
                </span>
              </div>
              <div className="w-full h-3 bg-white/25 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#00ccf9] rounded-full shadow-[0_0_12px_rgba(0,204,249,0.8)] transition-all duration-500"
                  style={{ width: `${weeklyPct}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-white/80 text-[11px] mt-0.5">
                <span>{weekly ? weekly.currentProgress.toLocaleString('pt-BR') : 0} ml consumidos</span>
                <span className="text-[#b7eaff] font-bold">Faltam {weeklyRemainingMl.toLocaleString('pt-BR')} ml</span>
              </div>
            </div>
          </div>

          {/* Desafio Mensal Card */}
          <div className="rounded-3xl bg-white p-5 shadow-[0_8px_24px_-4px_rgba(0,112,243,0.08)] border border-[#e8edff] flex flex-col gap-3 text-left">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ffdbc8] flex items-center justify-center text-[#984600] shadow-sm">
                  <Gift className="w-6 h-6 text-[#be5900]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f1f3ff] text-[#414754] px-2 py-0.5 rounded-full">
                      Mensal
                    </span>
                    <span className="text-[11px] font-bold text-[#984600]">
                      Cupom Exclusivo
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#111b2f] mt-0.5">
                    Desafio Mensal
                  </h3>
                </div>
              </div>
              <button
                onClick={() => onNavigate('register_photo_1')}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#414754] hover:bg-[#e8edff] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#414754] font-medium">
              Beba <strong className="text-[#111b2f]">60.000 ml</strong> este mês e ganhe um cupom de desconto em lojas parceiras!
            </p>

            {/* Monthly Progress */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex justify-between items-center text-xs text-[#414754]">
                <span className="font-medium">Meta do Mês</span>
                <span className="font-bold text-[#111b2f]">
                  {monthly ? monthly.currentProgress.toLocaleString('pt-BR') : 0} / {monthly ? monthly.maxProgress.toLocaleString('pt-BR') : 60000} ml
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#e8edff] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0070f3] rounded-full transition-all duration-500"
                  style={{ width: `${monthlyPct}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[#414754] text-[11px] mt-0.5">
                <span>{monthlyPct}% concluído</span>
                <span className="text-[#0058c3] font-bold">
                  {monthly?.daysRemaining || 30} dias restantes
                </span>
              </div>
            </div>
          </div>

          {/* Section: Desafios Especiais */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#0058c3]" />
              <h3 className="text-base font-extrabold text-[#111b2f]">Desafios Especiais</h3>
            </div>
            <span className="text-xs text-[#414754]">1 bloqueado</span>
          </div>

          {/* Locked Card: Desafio da Consistência */}
          <div className="relative overflow-hidden rounded-3xl bg-[#f1f3ff] p-4 border border-[#e0e8ff] flex flex-col gap-2.5 text-left opacity-90">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#e0e8ff] flex items-center justify-center text-[#727786]">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e0e8ff] text-[#414754] px-2 py-0.5 rounded-full w-fit">
                    Recompensa Secreta
                  </span>
                  <h4 className="text-sm font-extrabold text-[#111b2f] mt-0.5">
                    Desafio da Consistência
                  </h4>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#414754]">
              Complete 7 dias seguidos registrando água por foto para desbloquear esta medalha lendária e um bônus de XP!
            </p>
            <div className="flex items-center justify-between bg-white/80 rounded-xl p-2.5 mt-1 border border-[#e0e8ff]">
              <div className="flex items-center gap-2 text-[#414754] text-xs">
                <span>📷</span>
                <span className="font-semibold">Registro fotográfico diário</span>
              </div>
              <span className="text-[11px] font-extrabold text-[#0058c3] bg-[#d8e2ff] px-2 py-0.5 rounded-full">
                0 / 7 dias
              </span>
            </div>
          </div>

          {/* Mascot Banner: Dica do Hidro */}
          <div className="rounded-3xl bg-gradient-to-r from-[#b7eaff] to-[#d8e2ff] p-3.5 flex items-center gap-3 border border-[#b7eaff] shadow-sm text-left">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-white shadow-sm flex items-center justify-center p-1">
              <img
                src={ASSETS.mascotCardBanner}
                alt="Hidro Mascote"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-[#004e60] uppercase tracking-wider">
                Dica do Hidro
              </span>
              <p className="text-xs font-bold text-[#001f28] leading-tight mt-0.5">
                Tirar fotos da sua garrafa cheia pela manhã ativa a contagem de pontos em dobro!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Concluídos */}
      {activeTab === 'completed' && (
        <div className="flex flex-col gap-3.5 animate-in fade-in duration-200 text-left">
          {completedChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="rounded-3xl bg-white p-4 shadow-[0_8px_24px_-4px_rgba(0,112,243,0.06)] border border-[#e8edff] flex flex-col gap-2.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#b7eaff] flex items-center justify-center text-[#00677f]">
                    <CheckCircle2 className="w-6 h-6 text-[#00a86b]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00677f]">
                      Concluído
                    </span>
                    <h4 className="text-sm font-extrabold text-[#111b2f]">
                      {challenge.title}
                    </h4>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold bg-[#e8edff] text-[#0058c3] px-2.5 py-1 rounded-full">
                  +{challenge.rewardPoints} pts
                </span>
              </div>
              <p className="text-xs text-[#414754]">{challenge.description}</p>
              <div className="w-full h-1.5 bg-[#00ccf9] rounded-full"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

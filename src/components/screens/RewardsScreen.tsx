import React, { useState } from 'react';
import { RewardItem, UserProfile } from '../../types';
import { Coins, Award, Sparkles, Check, Copy, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface RewardsScreenProps {
  user: UserProfile;
  rewards: RewardItem[];
  onRedeemReward: (reward: RewardItem, newPoints: number) => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({
  user,
  rewards,
  onRedeemReward,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [redeemedReward, setRedeemedReward] = useState<{
    reward: RewardItem;
    code: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'cupons', label: 'Cupons' },
    { id: 'produtos', label: 'Produtos' },
    { id: 'experiencias', label: 'Experiências' },
    { id: 'exclusivos', label: 'Exclusivos VIP' },
  ];

  const filteredRewards = rewards.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleClaim = (reward: RewardItem) => {
    if (user.points < reward.pointsCost) {
      alert(
        `Pontos insuficientes! Beba mais água para conquistar ${
          reward.pointsCost - user.points
        } pontos necessários.`
      );
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = (reward.couponCodeTemplate || 'HIDRA-PROMO') + '-' + randomSuffix;

    const newBalance = user.points - reward.pointsCost;
    onRedeemReward(reward, newBalance);

    sounds.playSuccess();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ffd700', '#0070f3', '#00ccf9'],
      });
    } catch {
      // safe ignore
    }

    setRedeemedReward({ reward, code });
    setCopied(false);
  };

  const copyCode = () => {
    if (redeemedReward?.code) {
      navigator.clipboard.writeText(redeemedReward.code);
      setCopied(true);
      sounds.playWaterDrop();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 pb-24 pt-2 gap-4 text-left">
      {/* Top Bar: Title and Points Balance Pill */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold text-[#111b2f]">Loja de Prêmios</h1>
          <span className="text-xs text-[#414754]">
            Beba água diariamente e troque por cupons
          </span>
        </div>

        {/* Gold Hydration Points Balance Pill */}
        <div className="flex items-center gap-1.5 bg-[#ffdbc8] text-[#321200] px-3.5 py-1.5 rounded-full shadow-sm select-none border border-[#ffb68b]">
          <div className="w-5 h-5 rounded-full bg-[#be5900] flex items-center justify-center text-white">
            <Coins className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-black tracking-tight" id="user-points">
            {user.points.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Level Progress Hint Card */}
      <div className="flex items-center gap-3 bg-[#f1f3ff] p-3.5 rounded-2xl border border-[#e0e8ff] shadow-sm">
        <div className="w-10 h-10 rounded-full bg-[#b7eaff] flex items-center justify-center shrink-0 text-[#00677f]">
          <Award className="w-5 h-5 text-[#00677f]" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-[#0058c3] uppercase tracking-wider">
              Nível {user.level} · {user.levelTitle}
            </span>
            <span className="text-[11px] font-semibold text-[#414754]">
              Faltam {user.maxXp - user.currentXp} pts p/ Nível {user.level + 1}
            </span>
          </div>
          <div className="w-full h-2 bg-[#d8e2fd] rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-[#0070f3] rounded-full transition-all duration-500"
              style={{ width: `${(user.currentXp / user.maxXp) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Horizontal Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playWaterDrop();
                setSelectedCategory(cat.id);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#0070f3] text-white shadow-[0_4px_12px_rgba(0,112,243,0.3)]'
                  : 'bg-[#e8edff] text-[#414754] hover:bg-[#d8e2fd]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Rewards List */}
      <div className="flex flex-col gap-3">
        {filteredRewards.map((reward) => {
          const canAfford = user.points >= reward.pointsCost;
          return (
            <article
              key={reward.id}
              className="flex items-center justify-between p-3.5 bg-white rounded-2xl shadow-[0_6px_20px_-4px_rgba(0,112,243,0.07)] border border-[#e8edff] transition-transform active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#f1f3ff] shrink-0 flex items-center justify-center p-1 border border-[#e8edff]">
                  <img
                    src={reward.imageUrl}
                    alt={reward.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {reward.badge && (
                    <span className="absolute top-1 left-1 bg-[#0070f3] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase shadow-sm">
                      {reward.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-col min-w-0 pr-1">
                  <h3 className="text-sm font-bold text-[#111b2f] truncate">
                    {reward.title}
                  </h3>
                  <p className="text-xs text-[#414754] truncate">
                    {reward.description}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[#984600] text-xs font-bold">
                    <Coins className="w-3.5 h-3.5 text-[#be5900]" />
                    <span>{reward.pointsCost.toLocaleString('pt-BR')} pontos</span>
                  </div>
                </div>
              </div>

              {canAfford ? (
                <button
                  onClick={() => handleClaim(reward)}
                  className="shrink-0 bg-[#0058c3] text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-[0_4px_12px_rgba(0,88,195,0.25)] hover:bg-[#0070f3] transition-all active:scale-95 cursor-pointer ml-2"
                >
                  Resgatar
                </button>
              ) : (
                <button
                  onClick={() => handleClaim(reward)}
                  className="shrink-0 bg-[#e0e8ff] text-[#727786] text-xs font-bold px-3 py-2 rounded-full transition-all cursor-not-allowed ml-2"
                >
                  Bloqueado
                </button>
              )}
            </article>
          );
        })}
      </div>

      {/* Motivational Partner Banner from screenshots */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0058c3] to-[#0070f3] p-4 rounded-2xl text-white shadow-md flex items-center justify-between">
        <div className="flex flex-col gap-1 z-10 max-w-[72%]">
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full w-fit">
            <Flame className="w-3 h-3 text-[#ffdbc8] fill-[#ffdbc8]" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider">
              Dica do Mascote
            </span>
          </div>
          <h4 className="text-sm font-extrabold leading-tight">Beba +500 ml hoje!</h4>
          <p className="text-xs text-white/90">
            Garanta +50 pontos para resgatar o ingresso de cinema e produtos VIP.
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 z-10">
          <Sparkles className="w-6 h-6 text-[#00ccf9]" />
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
      </div>

      {/* Redeem Success Modal */}
      {redeemedReward && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-[#b7eaff] flex items-center justify-center mb-3 shadow-md">
              <Check className="w-8 h-8 text-[#00677f] stroke-[3]" />
            </div>

            <h3 className="text-lg font-extrabold text-[#111b2f]">Resgate Efetuado!</h3>
            <p className="text-xs text-[#414754] mt-1 mb-4">
              Você resgatou <strong>"{redeemedReward.reward.title}"</strong> com sucesso.
            </p>

            <div className="w-full bg-[#f1f3ff] p-3 rounded-2xl mb-4 flex items-center justify-between border border-[#e0e8ff]">
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-[#414754]">
                  CUPOM:
                </span>
                <span className="text-sm font-mono font-extrabold text-[#0058c3] tracking-wider">
                  {redeemedReward.code}
                </span>
              </div>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0070f3] text-white text-xs font-bold shadow-sm active:scale-95 transition-transform"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <button
              onClick={() => setRedeemedReward(null)}
              className="w-full h-12 bg-[#0058c3] hover:bg-[#0070f3] text-white rounded-full text-xs font-bold shadow-md active:scale-98 transition-transform cursor-pointer"
            >
              Voltar às Recompensas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

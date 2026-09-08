import React, { useState } from 'react';
import { PartnerItem } from '../../types';
import { Dumbbell, HeartPulse, UtensilsCrossed, Shirt, Check, Copy, ExternalLink } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface PartnersScreenProps {
  partners: PartnerItem[];
}

export const PartnersScreen: React.FC<PartnersScreenProps> = ({ partners }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePartnerModal, setActivePartnerModal] = useState<PartnerItem | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = [
    { id: 'all', label: 'Todos', icon: null },
    { id: 'academia', label: 'Academia', icon: Dumbbell },
    { id: 'saude', label: 'Saúde', icon: HeartPulse },
    { id: 'alimentacao', label: 'Alimentação', icon: UtensilsCrossed },
    { id: 'vestuario', label: 'Vestuário', icon: Shirt },
  ];

  const filteredPartners = partners.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    sounds.playWaterDrop();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full px-4 pb-24 pt-2 gap-4 text-left">
      {/* Header */}
      <div className="flex flex-col pt-1">
        <h1 className="text-xl font-extrabold text-[#111b2f]">Parceiros</h1>
        <p className="text-xs text-[#414754]">Marcas que apoiam seu bem-estar.</p>
      </div>

      {/* Category Icons Row */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        {categories.slice(1).map((cat) => {
          const Icon = cat.icon!;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playWaterDrop();
                setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id);
              }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0070f3] text-white border-[#0070f3] shadow-md shadow-[#0070f3]/25 scale-105'
                  : 'bg-white text-[#414754] border-[#e8edff] hover:bg-[#f1f3ff]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#f1f3ff] text-[#0058c3]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Partners Cards List */}
      <div className="flex flex-col gap-3.5">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className="rounded-3xl bg-white overflow-hidden shadow-[0_8px_24px_-4px_rgba(0,112,243,0.08)] border border-[#e8edff] flex flex-col"
          >
            {/* Partner Image Banner */}
            <div className="relative w-full h-36 bg-slate-100 overflow-hidden">
              <img
                src={partner.imageUrl}
                alt={partner.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-2.5 left-3 text-white">
                <span className="text-sm font-extrabold block drop-shadow-sm">
                  {partner.name}
                </span>
                <span className="text-xs text-white/90 font-medium">
                  {partner.category.charAt(0).toUpperCase() + partner.category.slice(1)}
                </span>
              </div>
            </div>

            {/* Content & Action */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex flex-col pr-2">
                <span className="text-sm font-extrabold text-[#0058c3]">
                  {partner.discount}
                </span>
                <span className="text-xs text-[#414754]">
                  {partner.description}
                </span>
              </div>

              <button
                onClick={() => {
                  sounds.playWaterDrop();
                  setActivePartnerModal(partner);
                }}
                className="shrink-0 px-4 py-2 rounded-full bg-[#0070f3] hover:bg-[#0058c3] text-white text-xs font-bold shadow-md shadow-[#0070f3]/25 active:scale-95 transition-all cursor-pointer"
              >
                Ver cupom
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Partner Coupon Modal */}
      {activePartnerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl overflow-hidden mb-3 shadow-md">
              <img
                src={activePartnerModal.imageUrl}
                alt={activePartnerModal.name}
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-lg font-extrabold text-[#111b2f]">
              {activePartnerModal.name}
            </h3>
            <span className="text-sm font-bold text-[#0058c3] mt-0.5">
              {activePartnerModal.discount}
            </span>
            <p className="text-xs text-[#414754] mt-1 mb-4">
              {activePartnerModal.description}
            </p>

            <div className="w-full bg-[#f1f3ff] p-3 rounded-2xl mb-4 flex items-center justify-between border border-[#e0e8ff]">
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-[#414754]">
                  CÓDIGO DE DESCONTO:
                </span>
                <span className="text-sm font-mono font-extrabold text-[#0058c3] tracking-wider">
                  {activePartnerModal.couponCode}
                </span>
              </div>
              <button
                onClick={() => handleCopy(activePartnerModal.couponCode)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0070f3] text-white text-xs font-bold shadow-sm active:scale-95 transition-transform"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => setActivePartnerModal(null)}
                className="flex-1 h-11 bg-[#f1f3ff] hover:bg-[#e0e8ff] text-[#414754] rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  handleCopy(activePartnerModal.couponCode);
                  setActivePartnerModal(null);
                }}
                className="flex-1 h-11 bg-[#0070f3] hover:bg-[#0058c3] text-white rounded-full text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Usar agora</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { ASSETS } from '../../data/mockData';
import { X, Copy, Check, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ImageLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLinksModal: React.FC<ImageLinksModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const imageList = [
    {
      name: 'Logo HidraGo',
      description: 'Logo oficial com gota de água e tipografia estilizada',
      url: ASSETS.logo,
    },
    {
      name: 'Mascote Raposa na Abertura (Splash)',
      description: 'Mascote 3D em moletom azul com garrafa de água e respingos',
      url: ASSETS.mascotSplash,
    },
    {
      name: 'Avatar do Mascote (Cabeça circular)',
      description: 'Ícone redondo de perfil do mascote sorridente',
      url: ASSETS.mascotAvatar,
    },
    {
      name: 'Mascote Perfil (Close-up)',
      description: 'Avatar do Lucas Oliveira com iluminação de estúdio',
      url: ASSETS.mascotProfile,
    },
    {
      name: 'Mascote Card de Dica (Hidro)',
      description: 'Mascote com garrafa de água e gotas em volta',
      url: ASSETS.mascotCardBanner,
    },
    {
      name: 'Mascote Comemorando (Corpo inteiro)',
      description: 'Raposa torcendo alegremente com as patas levantadas',
      url: ASSETS.mascotCheering,
    },
    {
      name: 'Recompensa 1 - Tênis Esportivo (15% OFF)',
      description: 'Tênis de corrida azul com fundo estúdio',
      url: ASSETS.rewardShoes,
    },
    {
      name: 'Recompensa 2 - Bebidas Saudáveis (R$ 30 OFF)',
      description: 'Sucos naturais tropicais e garrafinhas saudáveis',
      url: ASSETS.rewardJuice,
    },
    {
      name: 'Recompensa 3 - Pote de Suplementos (20% OFF)',
      description: 'Suplemento esportivo preto com detalhes em azul',
      url: ASSETS.rewardSupplement,
    },
    {
      name: 'Recompensa 4 - Balde de Pipoca Cinema',
      description: 'Pipoca de cinema com ingresso 2x1',
      url: ASSETS.rewardCinema,
    },
    {
      name: 'Garrafa com Líquido (Foto 1)',
      description: 'Garrafa térmica azul cheia para validação de consumo',
      url: ASSETS.bottleFull,
    },
    {
      name: 'Medição da Capacidade 500ml (Foto 2)',
      description: 'Marcação de volume com graduação da garrafa',
      url: ASSETS.bottleScale,
    },
  ];

  const handleCopy = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    sounds.playWaterDrop();
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e8edff] flex items-center justify-between bg-[#f9f9ff]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#0070f3] text-white flex items-center justify-center shadow-sm">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-extrabold text-[#111b2f]">
                Links Diretos das Imagens
              </h2>
              <p className="text-xs text-[#414754]">
                Imagens oficiais do HTML e dos layouts do aplicativo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal List */}
        <div className="p-6 overflow-y-auto space-y-3.5 text-left">
          {imageList.map((img, idx) => {
            const isCopied = copiedKey === `img-${idx}`;
            return (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[#f9f9ff] border border-[#e8edff] hover:border-[#aec6ff] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-white border border-[#e8edff] overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-sm">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-[#111b2f] truncate">
                      {img.name}
                    </h3>
                    <p className="text-[11px] text-[#414754] truncate">
                      {img.description}
                    </p>
                    <p className="text-[10px] font-mono text-[#0058c3] truncate mt-0.5 max-w-[280px] sm:max-w-md">
                      {img.url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleCopy(img.url, `img-${idx}`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0070f3] hover:bg-[#0058c3] text-white text-[11px] font-bold shadow-sm active:scale-95 transition-all"
                    title="Copiar link direto"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-white" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar URL</span>
                      </>
                    )}
                  </button>

                  <a
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full bg-white border border-[#e0e8ff] hover:bg-[#e8edff] text-[#414754] transition-colors"
                    title="Abrir em nova aba"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#e8edff] bg-[#f9f9ff] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#111b2f] hover:bg-[#263045] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

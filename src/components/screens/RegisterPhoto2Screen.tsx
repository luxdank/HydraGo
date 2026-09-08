import React, { useState } from 'react';
import { ASSETS } from '../../data/mockData';
import { ChevronLeft, Camera, Check, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface RegisterPhoto2ScreenProps {
  photo1Url: string;
  onBack: () => void;
  onComplete: (photo2Url: string) => void;
}

export const RegisterPhoto2Screen: React.FC<RegisterPhoto2ScreenProps> = ({
  onBack,
  onComplete,
}) => {
  const [photoUrl] = useState<string>(ASSETS.bottleScale);
  const [isScanning, setIsScanning] = useState(false);

  const handleCapture = () => {
    sounds.playShutter();
    setIsScanning(true);

    // AI scanning simulation
    setTimeout(() => {
      sounds.playSuccess();
      onComplete(photoUrl);
    }, 900);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f9f9ff] px-4 pt-3 pb-8 justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-[#e8edff] flex items-center justify-center text-[#111b2f] hover:bg-[#f1f3ff] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-extrabold text-[#111b2f]">Registrar água</h1>
        </div>

        <p className="text-xs text-[#414754] font-medium ml-1">
          Tire duas fotos para validarmos seu consumo.
        </p>

        {/* Steps List */}
        <div className="flex flex-col gap-2.5 mt-4">
          {/* Step 1 Completed with Green Check */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#e8edff] border border-[#c1c6d7]/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#0058c3] text-white flex items-center justify-center text-xs font-extrabold">
                1
              </div>
              <span className="text-xs font-bold text-[#111b2f]">
                Foto do recipiente com o líquido
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#00ccf9] flex items-center justify-center text-[#005266]">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>

          {/* Step 2 Active */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#e8edff] border-2 border-[#0070f3] shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#0070f3] text-white flex items-center justify-center text-xs font-extrabold">
                2
              </div>
              <span className="text-xs font-extrabold text-[#111b2f]">
                Foto da capacidade do recipiente
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0070f3] flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Camera Viewfinder Area focused on capacity markings */}
      <div className="relative my-4 w-full aspect-[4/5] rounded-3xl overflow-hidden bg-slate-900 shadow-xl border-4 border-white flex items-center justify-center">
        {/* Photo inside Viewfinder */}
        <img
          src={photoUrl}
          alt="Medição da garrafa 500ml"
          className="w-full h-full object-cover scale-110"
        />

        {/* Laser Scanning Animation when capturing */}
        {isScanning && (
          <div className="absolute inset-0 bg-[#0070f3]/20 flex flex-col justify-center items-center backdrop-blur-[2px]">
            <div className="w-full h-1 bg-[#00ccf9] shadow-[0_0_15px_#00ccf9] animate-pulse"></div>
            <div className="mt-4 px-4 py-2 rounded-full bg-black/75 text-white text-xs font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00ccf9] animate-spin" />
              <span>IA HidraGo analisando graduação...</span>
            </div>
          </div>
        )}

        {/* Measurement Box Reticle from design (500 ml overlay) */}
        {!isScanning && (
          <div className="absolute inset-x-14 top-1/4 bottom-1/4 border-2 border-dashed border-[#00ccf9] rounded-2xl flex flex-col items-center justify-center bg-[#0070f3]/20 backdrop-blur-[1px]">
            <div className="bg-[#0070f3] px-3 py-1 rounded-full text-white text-xs font-extrabold shadow-md mb-2">
              500 ml
            </div>
            <div className="w-3/4 border-b border-white/60 mb-2"></div>
            <div className="w-1/2 border-b border-white/40"></div>
          </div>
        )}

        {/* Viewfinder Corner Brackets */}
        <div className="absolute inset-6 pointer-events-none flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="w-8 h-8 border-t-4 border-l-4 border-white/90 rounded-tl-xl shadow-sm"></div>
            <div className="w-8 h-8 border-t-4 border-r-4 border-white/90 rounded-tr-xl shadow-sm"></div>
          </div>
          <div className="flex justify-between">
            <div className="w-8 h-8 border-b-4 border-l-4 border-white/90 rounded-bl-xl shadow-sm"></div>
            <div className="w-8 h-8 border-b-4 border-r-4 border-white/90 rounded-br-xl shadow-sm"></div>
          </div>
        </div>

        {/* Helpful text */}
        <div className="absolute bottom-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#00ccf9] animate-ping"></span>
          <span>Foque na marcação de volume (ex: 500 ml)</span>
        </div>
      </div>

      {/* Bottom Shutter Controls */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center">
          <button
            onClick={handleCapture}
            disabled={isScanning}
            className="w-18 h-18 rounded-full bg-[#0070f3] p-1.5 shadow-lg shadow-[#0070f3]/40 ring-4 ring-[#0070f3]/30 active:scale-90 transition-all flex items-center justify-center text-white cursor-pointer disabled:opacity-50"
            title="Validar com foto 2"
          >
            <div className="w-full h-full rounded-full border-2 border-white/60 flex items-center justify-center">
              <Camera className="w-7 h-7" />
            </div>
          </button>
        </div>
        <span className="text-[11px] font-semibold text-[#414754]">
          Toque para capturar e validar com IA
        </span>
      </div>
    </div>
  );
};

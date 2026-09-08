import React, { useState, useEffect } from 'react';
import { ASSETS } from '../../data/mockData';
import { ChevronLeft, Camera, Upload, RefreshCw, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { notifications, NotificationWindowStatus } from '../../utils/notifications';

interface RegisterPhoto1ScreenProps {
  onBack: () => void;
  onNext: (photoDataUrl: string) => void;
}

export const RegisterPhoto1Screen: React.FC<RegisterPhoto1ScreenProps> = ({ onBack, onNext }) => {
  const [photoUrl, setPhotoUrl] = useState<string>(ASSETS.bottleFull);
  const [isCapturing, setIsCapturing] = useState(false);
  const [windowStatus, setWindowStatus] = useState<NotificationWindowStatus>(
    notifications.getWindowStatus()
  );

  useEffect(() => {
    const unsub = notifications.onWindowStateChange((st) => setWindowStatus(st));
    return () => unsub();
  }, []);

  const handleCapture = () => {
    sounds.playShutter();
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      onNext(photoUrl);
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          sounds.playWaterDrop();
        }
      };
      reader.readAsDataURL(file);
    }
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
          <div>
            <h1 className="text-xl font-extrabold text-[#111b2f]">Registrar água</h1>
            <p className="text-xs text-[#414754] font-medium">
              Foto 1 de 2: Foto do recipiente com água
            </p>
          </div>
        </div>

        {/* Notification Window Badge */}
        {windowStatus.isOpen ? (
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#eff8ff] border border-[#b9e6fe] text-[#0058c3] mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0070f3]" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold">
                  Janela de Notificação Ativa ({windowStatus.activeSlot?.time || 'Agora'})
                </span>
                <span className="text-[10px] opacity-80">
                  Dose recomendada: 500 ml • {windowStatus.minutesRemainingInActiveWindow} min restantes
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#0070f3] text-white text-[10px] font-bold">
              Aberta
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#fff0f0] border border-[#fee4e2] text-[#d92d20] mb-3">
            <div className="flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold">Janela de notificação fechada</span>
                <span className="text-[10px]">A foto é válida nos 6 horários diários</span>
              </div>
            </div>
            <button
              onClick={() => {
                notifications.openTestWindow(30);
                sounds.playWaterDrop();
              }}
              className="px-2 py-1 rounded-lg bg-[#0070f3] text-white text-[10px] font-bold flex items-center gap-1 hover:bg-[#0058c3]"
            >
              <Sparkles className="w-3 h-3" /> Liberar
            </button>
          </div>
        )}

        {/* Steps List */}
        <div className="flex flex-col gap-2 mt-2">
          {/* Step 1 Active */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#e8edff] border-2 border-[#0070f3]/30 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#0070f3] text-white flex items-center justify-center text-xs font-extrabold">
                1
              </div>
              <span className="text-xs font-bold text-[#111b2f]">
                Foto do recipiente com o líquido
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0070f3] flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
          </div>

          {/* Step 2 Pending */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#e0e8ff] opacity-75">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#e8edff] text-[#414754] flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className="text-xs font-medium text-[#414754]">
                Foto da capacidade do recipiente
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#0070f3]">
              <Camera className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Camera Viewfinder Area */}
      <div className="relative my-3 w-full aspect-[4/5] rounded-3xl overflow-hidden bg-slate-900 shadow-xl border-4 border-white flex items-center justify-center">
        {/* Photo inside Viewfinder */}
        <img
          src={photoUrl}
          alt="Garrafa de água"
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isCapturing ? 'scale-95 brightness-125' : ''
          }`}
        />

        {/* Flash Effect on capture */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white/70 animate-pulse pointer-events-none"></div>
        )}

        {/* Viewfinder Target Reticles */}
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

        {/* Live Alignment Guide pill */}
        <div className="absolute bottom-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#00ccf9] animate-ping"></span>
          <span>Enquadre a garrafa de água cheia</span>
        </div>

        {/* Change image / upload helper */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <label className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <button
            onClick={() => {
              setPhotoUrl((prev) =>
                prev === ASSETS.bottleFull
                  ? 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
                  : ASSETS.bottleFull
              );
              sounds.playWaterDrop();
            }}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
            title="Alternar amostra"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Shutter Controls */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center">
          <button
            onClick={handleCapture}
            className="w-18 h-18 rounded-full bg-[#0070f3] p-1.5 shadow-lg shadow-[#0070f3]/40 ring-4 ring-[#0070f3]/30 active:scale-90 transition-all flex items-center justify-center text-white cursor-pointer"
            title="Tirar foto 1"
          >
            <div className="w-full h-full rounded-full border-2 border-white/60 flex items-center justify-center">
              <Camera className="w-7 h-7" />
            </div>
          </button>
        </div>
        <span className="text-[11px] font-semibold text-[#414754]">
          Toque para capturar a Foto 1
        </span>
      </div>
    </div>
  );
};

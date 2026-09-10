import React, { useState, useEffect, useRef } from 'react';
import { ASSETS } from '../../data/mockData';
import {
  ChevronLeft,
  Camera,
  Upload,
  RefreshCw,
  Clock,
  Sparkles,
  SwitchCamera,
  AlertCircle,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import { notifications, NotificationWindowStatus } from '../../utils/notifications';

interface RegisterPhoto1ScreenProps {
  onBack: () => void;
  onNext: (photoDataUrl: string) => void;
}

export const RegisterPhoto1Screen: React.FC<RegisterPhoto1ScreenProps> = ({ onBack, onNext }) => {
  const [photoUrl, setPhotoUrl] = useState<string>(ASSETS.bottleFull);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [status, setStatus] = useState<NotificationWindowStatus>(notifications.getWindowStatus());

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Subscribe to photo window status
  useEffect(() => {
    const unsub = notifications.onWindowStateChange((st) => setStatus(st));
    return () => unsub();
  }, []);

  // Initialize Real Camera
  const startCamera = async (mode: 'environment' | 'user') => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste navegador.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('[Camera] Could not access live camera:', err);
      setCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Permissão de câmera negada. Você pode enviar uma foto ou usar uma amostra.'
          : 'Câmera indisponível. Utilize o envio de foto ou imagem de amostra.'
      );
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  const toggleCameraFacing = () => {
    sounds.playWaterDrop();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const capturePhoto = () => {
    sounds.playShutter();
    setIsCapturing(true);

    let finalDataUrl = photoUrl;

    if (cameraActive && videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 800;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          finalDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoUrl(finalDataUrl);
        }
      } catch (err) {
        console.warn('Could not capture frame from canvas:', err);
      }
    }

    setTimeout(() => {
      setIsCapturing(false);
      // Clean up stream before moving
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      onNext(finalDataUrl);
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          setCameraActive(false);
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
            onClick={() => {
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
              }
              onBack();
            }}
            className="w-10 h-10 rounded-full bg-white border border-[#e8edff] flex items-center justify-center text-[#111b2f] hover:bg-[#f1f3ff] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-[#111b2f]">Registrar água</h1>
            <p className="text-xs text-[#414754] font-medium">
              Foto 1 de 2: Câmera liberada para garrafa com líquido
            </p>
          </div>
        </div>

        {/* 6 Photos Daily Quota Bar */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#eff8ff] border border-[#b9e6fe] text-[#0058c3] mb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0070f3]" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold">
                Foto {status.photosTakenToday + 1} de {status.maxPhotosPerDay} do Dia
              </span>
              <span className="text-[10px] opacity-80">
                Intervalo de 1 hora entre fotos • IA pronta para análise
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#0070f3] text-white text-[10px] font-bold">
            {status.photosRemainingToday} restantes
          </span>
        </div>

        {/* Steps List */}
        <div className="flex flex-col gap-2 mt-1">
          {/* Step 1 Active */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#e8edff] border-2 border-[#0070f3]/40 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#0070f3] text-white flex items-center justify-center text-xs font-extrabold">
                1
              </div>
              <span className="text-xs font-bold text-[#111b2f]">
                Foto da garrafa/copo com líquido
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#0070f3] flex items-center justify-center text-white">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 2 Pending */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-[#e0e8ff] opacity-75">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#e8edff] text-[#414754] flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className="text-xs font-medium text-[#414754]">
                Foto da capacidade / marcação de ml
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#0070f3]">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Camera Viewfinder Area */}
      <div className="relative my-2 w-full aspect-[4/5] rounded-3xl overflow-hidden bg-slate-950 shadow-xl border-4 border-white flex items-center justify-center">
        {/* Real Live Camera Stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            cameraActive ? 'opacity-100' : 'hidden opacity-0'
          }`}
        />

        {/* Fallback Photo if camera not active */}
        {!cameraActive && (
          <img
            src={photoUrl}
            alt="Garrafa de água"
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isCapturing ? 'scale-95 brightness-125' : ''
            }`}
          />
        )}

        {/* Flash Effect on capture */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white/80 animate-pulse pointer-events-none z-20"></div>
        )}

        {/* Viewfinder Target Reticles */}
        <div className="absolute inset-6 pointer-events-none flex flex-col justify-between z-10">
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
        <div className="absolute bottom-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md z-10">
          <span className="w-2 h-2 rounded-full bg-[#00ccf9] animate-ping"></span>
          <span>{cameraActive ? 'Câmera ativa • Enquadre a garrafa' : 'Enquadre a garrafa de água'}</span>
        </div>

        {/* Camera Controls Overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {cameraActive && (
            <button
              onClick={toggleCameraFacing}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors cursor-pointer"
              title="Alternar câmera frontal/traseira"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          )}

          <label className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 cursor-pointer transition-colors" title="Carregar foto da galeria">
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
              setCameraActive(false);
              setPhotoUrl((prev) =>
                prev === ASSETS.bottleFull
                  ? 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
                  : ASSETS.bottleFull
              );
              sounds.playWaterDrop();
            }}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors cursor-pointer"
            title="Usar amostra"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Camera status badge top-left */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white font-medium z-10">
          <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-[#00c48c]' : 'bg-amber-400'}`}></span>
          <span>{cameraActive ? 'Câmera Real' : 'Foto/Arquivo'}</span>
        </div>
      </div>

      {/* Camera warning if any */}
      {cameraError && (
        <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5 my-1 text-left">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Bottom Shutter Controls */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center">
          <button
            onClick={capturePhoto}
            className="w-18 h-18 rounded-full bg-[#0070f3] p-1.5 shadow-lg shadow-[#0070f3]/40 ring-4 ring-[#0070f3]/30 active:scale-90 transition-all flex items-center justify-center text-white cursor-pointer"
            title="Tirar Foto 1"
          >
            <div className="w-full h-full rounded-full border-2 border-white/60 flex items-center justify-center">
              <Camera className="w-7 h-7" />
            </div>
          </button>
        </div>
        <span className="text-[11px] font-semibold text-[#414754]">
          Toque para capturar a Foto 1 (Líquido)
        </span>
      </div>
    </div>
  );
};

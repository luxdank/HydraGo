import React, { useState } from 'react';
import {
  ArrowLeft,
  Droplets,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Chrome,
  ShieldCheck,
  Cloud,
  Camera,
} from 'lucide-react';
import { ASSETS } from '../../data/mockData';
import { sounds } from '../../utils/audio';
import { signInWithGoogle, getFriendlyAuthErrorMessage } from '../../lib/firebase';
import { UserProfile } from '../../types';

interface LoginScreenProps {
  initialName?: string;
  initialAge?: number;
  initialEmail?: string;
  onLogin: (data: { name: string; age?: number; email: string; profile?: UserProfile }) => void;
  onBackToSplash: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onBackToSplash,
}) => {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const { profile } = await signInWithGoogle();
      sounds.playSuccess();
      setSuccessMsg(`Conectado com sucesso com a conta Google (${profile.name})!`);

      setTimeout(() => {
        onLogin({
          name: profile.name,
          age: profile.age || 25,
          email: profile.email,
          profile,
        });
      }, 500);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const errMessage = err instanceof Error ? err.message : String(err);
      setErrorMsg(getFriendlyAuthErrorMessage(errMessage));
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col justify-between bg-gradient-to-b from-[#eaf2ff] via-[#f4f7ff] to-white px-5 py-6 sm:px-6">
      {/* Top Header / Back Navigation */}
      <div className="w-full flex items-center justify-between pt-1 pb-3">
        <button
          type="button"
          onClick={onBackToSplash}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#e0e8ff] flex items-center justify-center text-[#414754] hover:text-[#0070f3] hover:border-[#0070f3]/30 transition-all cursor-pointer active:scale-95"
          aria-label="Voltar para a tela inicial"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#e0e8ff] shadow-xs">
          <Droplets className="w-3.5 h-3.5 text-[#0070f3]" />
          <span className="text-xs font-bold text-[#0058c3]">Google Auth</span>
        </div>

        <div className="w-10"></div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center my-auto py-4">
        {/* Mascot & Welcome Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0070f3]/15 to-[#00ccf9]/25 flex items-center justify-center ring-4 ring-white shadow-md">
              <img
                src={ASSETS.mascotAvatar}
                alt="Mascote HidraGo"
                className="w-16 h-16 object-contain drop-shadow-sm"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0070f3] border-2 border-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111b2f] tracking-tight">
            Entrar no HidraGo
          </h1>
          <p className="text-xs sm:text-sm text-[#5f687a] mt-1.5 max-w-[290px] leading-relaxed">
            Conecte sua conta do Google para sincronizar seu histórico, fotos e pontos na nuvem.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#fee2e2] border border-[#fecaca] text-[#b91c1c] text-xs font-medium flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#b91c1c]" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#15803d]" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Google Authentication Button */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            id="btn-google-auth"
            disabled={isSubmitting}
            onClick={handleGoogleSignIn}
            className="w-full h-14 rounded-2xl bg-white hover:bg-[#f8faff] active:scale-[0.98] border-2 border-[#cde0ff] hover:border-[#0070f3] text-[#111b2f] font-extrabold text-base flex items-center justify-center gap-3 shadow-md shadow-[#0070f3]/10 transition-all cursor-pointer disabled:opacity-75 group"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2.5 text-[#0058c3]">
                <span className="w-5 h-5 border-2 border-[#0058c3] border-t-transparent rounded-full animate-spin"></span>
                <span>Conectando com o Google...</span>
              </span>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-[#f0f6ff] group-hover:bg-[#e1edff] flex items-center justify-center transition-colors">
                  <Chrome className="w-5 h-5 text-[#0070f3]" />
                </div>
                <span>Continuar com o Google</span>
              </>
            )}
          </button>
        </div>

        {/* Features Highlights Card */}
        <div className="mt-6 p-4 rounded-2xl bg-white/90 border border-[#dce8ff] shadow-xs flex flex-col gap-2.5 text-left">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#0070f3] shrink-0" />
            <span className="text-xs text-[#334155] font-medium">
              Login rápido, seguro e sem necessidade de senhas manuais.
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Cloud className="w-4 h-4 text-[#0070f3] shrink-0" />
            <span className="text-xs text-[#334155] font-medium">
              Progresso e fotos salvos automaticamente no Firestore.
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Camera className="w-4 h-4 text-[#0070f3] shrink-0" />
            <span className="text-xs text-[#334155] font-medium">
              Validação inteligente por IA ao registrar sua hidratação.
            </span>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="w-full text-center pt-2 pb-1">
        <p className="text-[11px] text-[#717d96]">
          Autenticação segura via Google & Firebase Authentication 💧
        </p>
      </div>
    </div>
  );
};

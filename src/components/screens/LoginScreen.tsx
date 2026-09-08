import React, { useState } from 'react';
import { User, Mail, Calendar, ArrowRight, ArrowLeft, Droplets, Sparkles, CheckCircle2 } from 'lucide-react';
import { ASSETS } from '../../data/mockData';
import { sounds } from '../../utils/audio';

interface LoginScreenProps {
  initialName?: string;
  initialAge?: number;
  initialEmail?: string;
  onLogin: (data: { name: string; age: number; email: string }) => void;
  onBackToSplash: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  initialName = '',
  initialAge,
  initialEmail = '',
  onLogin,
  onBackToSplash,
}) => {
  const [name, setName] = useState<string>(initialName === 'Novo Usuário' ? '' : initialName);
  const [age, setAge] = useState<string>(initialAge ? String(initialAge) : '');
  const [email, setEmail] = useState<string>(initialEmail);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Daily water consumption goal set to 3000 ml (6 notifications x 500 ml)
  const calculatedGoalMl = 3000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const parsedAge = parseInt(age.trim(), 10);

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Por favor, informe seu nome completo ou como prefere ser chamado.');
      return;
    }

    if (!parsedAge || isNaN(parsedAge) || parsedAge < 3 || parsedAge > 120) {
      setErrorMsg('Por favor, digite uma idade válida (entre 3 e 120 anos).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMsg('Por favor, digite um endereço de e-mail válido.');
      return;
    }

    setIsSubmitting(true);
    sounds.playSuccess();

    setTimeout(() => {
      onLogin({
        name: trimmedName,
        age: parsedAge,
        email: trimmedEmail,
      });
    }, 250);
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
          <span className="text-xs font-bold text-[#0058c3]">HidraGo ID</span>
        </div>

        <div className="w-10"></div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center my-auto py-2">
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

          <h1 className="text-2xl font-extrabold text-[#111b2f] tracking-tight">
            Criar sua Conta
          </h1>
          <p className="text-xs sm:text-sm text-[#5f687a] mt-1 max-w-[280px]">
            Preencha seus dados para personalizar sua jornada diária e acompanhar suas conquistas.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-[#fee2e2] border border-[#fecaca] text-[#b91c1c] text-xs font-medium flex items-start gap-2 animate-shake">
            <span className="font-bold text-sm leading-none">•</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Campo Nome */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="login-name" className="text-xs font-bold text-[#323946] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#0070f3]" />
              Nome Completo
            </label>
            <div className="relative">
              <input
                id="login-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Eduardo"
                required
                autoComplete="name"
                className="w-full h-12 px-4 rounded-2xl bg-white border border-[#d2dff5] text-[#111b2f] text-sm placeholder-[#94a3b8] focus:outline-none focus:border-[#0070f3] focus:ring-4 focus:ring-[#0070f3]/15 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Campo Idade */}
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-center justify-between">
              <label htmlFor="login-age" className="text-xs font-bold text-[#323946] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0070f3]" />
                Idade
              </label>
              {age && !isNaN(parseInt(age, 10)) && (
                <span className="text-[11px] font-semibold text-[#0070f3] bg-[#e6f0ff] px-2 py-0.5 rounded-full">
                  Meta: {calculatedGoalMl.toLocaleString('pt-BR')} ml/dia
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="login-age"
                type="number"
                min="3"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ex: 26"
                required
                className="w-full h-12 px-4 rounded-2xl bg-white border border-[#d2dff5] text-[#111b2f] text-sm placeholder-[#94a3b8] focus:outline-none focus:border-[#0070f3] focus:ring-4 focus:ring-[#0070f3]/15 transition-all shadow-xs"
              />
            </div>
            <p className="text-[11px] text-[#717d96]">
              Meta programada: 3.000 ml/dia dividida em 6 notificações de 500 ml.
            </p>
          </div>

          {/* Campo E-mail */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="login-email" className="text-xs font-bold text-[#323946] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#0070f3]" />
              E-mail
            </label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                autoComplete="email"
                className="w-full h-12 px-4 rounded-2xl bg-white border border-[#d2dff5] text-[#111b2f] text-sm placeholder-[#94a3b8] focus:outline-none focus:border-[#0070f3] focus:ring-4 focus:ring-[#0070f3]/15 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Features Highlights Card */}
          <div className="mt-1 p-3 rounded-2xl bg-[#eef5ff] border border-[#dce8ff] flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#0070f3] shrink-0" />
            <span className="text-[11px] text-[#334155] leading-tight">
              Seu perfil receberá pontos, cupons de parceiros e troféus validados por foto.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="btn-confirm-login"
            disabled={isSubmitting}
            className="w-full h-13 mt-2 rounded-2xl bg-gradient-to-r from-[#0070f3] to-[#0090ff] hover:from-[#0060d0] hover:to-[#0080ee] active:scale-[0.98] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#0070f3]/30 transition-all cursor-pointer disabled:opacity-75"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Iniciando...
              </span>
            ) : (
              <>
                <span>Entrar no HidraGo</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Disclaimer */}
      <div className="w-full text-center pt-3 pb-1">
        <p className="text-[11px] text-[#717d96]">
          Ao continuar, você concorda em beber água regularmente 💧
        </p>
      </div>
    </div>
  );
};

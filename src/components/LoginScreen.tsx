import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ConfirmationResult } from 'firebase/auth';
import { ArrowLeft, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { playSixSevenSound, playSuccessChime } from '../utils/audio';
import logoMark from '../assets/logo-mark.png';
import wordmark from '../assets/logo-wordmark.png';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const {
    signInWithGoogle,
    setupPhoneRecaptcha,
    sendPhoneCode,
    confirmPhoneCode,
  } = useAuth();

  const [mode, setMode] = useState<'main' | 'phone_input' | 'phone_verify'>('main');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      playSixSevenSound();
      await signInWithGoogle();
      playSuccessChime();
      onLoginSuccess();
    } catch (err: unknown) {
      console.error('Error al iniciar sesión con Google:', err);
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPhone = () => {
    setMode('phone_input');
    setErrorMsg(null);
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.trim().length < 6) {
      setErrorMsg('Por favor ingresa un número de teléfono válido (ej. +15556767676 o +54...).');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const verifier = setupPhoneRecaptcha('recaptcha-container');
      const confirmation = await sendPhoneCode(phoneNumber.trim(), verifier);
      setConfirmationResult(confirmation);
      setMode('phone_verify');
      playSuccessChime();
    } catch (err: unknown) {
      console.error('Error al enviar SMS:', err);
      const msg = err instanceof Error ? err.message : 'Error al enviar código SMS.';
      setErrorMsg(
        msg.includes('app-not-authorized') || msg.includes('disabled')
          ? 'El proveedor telefónico se está configurando. ¡También puedes continuar con Google o Acceso Rápido!'
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || code.trim().length < 6) {
      setErrorMsg('Ingresa el código SMS de 6 dígitos.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await confirmPhoneCode(confirmationResult, code.trim());
      playSixSevenSound();
      playSuccessChime();
      onLoginSuccess();
    } catch (err: unknown) {
      console.error('Error al verificar SMS:', err);
      setErrorMsg('Código SMS incorrecto o expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-white flex flex-col justify-between items-center px-6 py-10 selection:bg-red-600">
      {/* Background ambient red glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" />

      {/* TOP: logo de SixSeven */}
      <div className="w-full flex flex-col items-center pt-8 text-center z-10 safe-top">
        <img src={logoMark} alt="SixSeven" className="w-28 h-28 rounded-3xl select-none" draggable={false} />
        <img src={wordmark} alt="SixSeven" className="h-14 w-auto mt-5 select-none" draggable={false} />
        <p className="text-[10px] tracking-[0.3em] text-neutral-300 mt-3 uppercase">Conecta · Comparte · Sin límites</p>
      </div>

      {/* 3. CENTER / LOGIN ACTIONS */}
      <div className="w-full max-w-sm z-10 my-auto py-6">
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0 text-red-400 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {mode === 'main' && (
          <div className="space-y-3.5">
            {/* Button 1: Continuar con número de teléfono (black button with white border) */}
            <button
              onClick={handleStartPhone}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-neutral-950 text-white font-bold text-sm border-2 border-white transition-all active:scale-98 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <span>Continuar con número de teléfono 📱</span>
            </button>

            {/* Button 2: Continuar con Google - Copia de seguridad de Chrome (white button) */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-black font-extrabold text-sm transition-all active:scale-98 flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="truncate">Continuar con Google</span>
            </button>
          </div>
        )}

        {mode === 'phone_input' && (
          <form onSubmit={handleSendPhoneCode} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setMode('main')}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <ArrowLeft size={18} />
              </button>
              <span className="text-xs font-bold text-neutral-300">Ingresa tu número de teléfono</span>
            </div>

            <input
              type="tel"
              placeholder="+1 555 676 7676"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              autoFocus
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(255,0,0,0.5)] active:scale-98 transition-all"
            >
              {loading ? 'Enviando SMS...' : 'Enviar Código SMS 6 7'}
            </button>
          </form>
        )}

        {mode === 'phone_verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="text-center">
              <p className="text-xs font-semibold text-neutral-300">
                Código enviado a {phoneNumber}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Ingresa los 6 dígitos recibidos:</p>
            </div>

            <input
              type="text"
              maxLength={6}
              placeholder="6 7 6 7 6 7"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full text-center tracking-[0.4em] font-mono text-2xl bg-neutral-900 border border-neutral-700 rounded-xl py-3 text-white focus:outline-none focus:border-red-500"
              autoFocus
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(255,0,0,0.5)] active:scale-98 transition-all"
            >
              {loading ? 'Verificando...' : 'Verificar y Entrar a SixSeven 🔥'}
            </button>

            <button
              type="button"
              onClick={() => setMode('phone_input')}
              className="w-full text-xs text-neutral-400 hover:text-white text-center block pt-1"
            >
              Cambiar número de teléfono
            </button>
          </form>
        )}
      </div>

      {/* FOOTER: Small text below: "Al continuar aceptas nuestros términos del 6 7" */}
      <div className="w-full text-center z-10 pb-4">
        <p className="text-xs text-neutral-500 font-medium tracking-tight">
          Al continuar aceptas nuestros términos del 6 7
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-neutral-600">
          <Shield size={12} className="text-red-500/80" />
          <span>SixSeven • Más que un chat, es tu espacio</span>
        </div>
      </div>
    </div>
  );
};

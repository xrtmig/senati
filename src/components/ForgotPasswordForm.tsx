import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';
import {
  findAccountByIdentifier,
  isValidEmail,
  updateAccountPassword,
  type LoginMethod,
} from '../data/authStorage';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  onToast: (message: string) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
  onToast,
}) => {
  const [step, setStep] = useState<'lookup' | 'otp' | 'reset' | 'done'>('lookup');
  const [identifier, setIdentifier] = useState('');
  const [detectedMethod, setDetectedMethod] = useState<LoginMethod>('email');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = identifier.trim();
    if (!trimmed) {
      setError('Ingresa tu correo electrónico o número de DNI.');
      return;
    }

    const isNumericDni = /^\d{8}$/.test(trimmed);
    const method: LoginMethod = isNumericDni ? 'dni' : 'email';

    if (method === 'email' && !isValidEmail(trimmed)) {
      setError('Ingresa un correo electrónico válido o un DNI de 8 dígitos.');
      return;
    }

    setIsLoading(true);
    window.setTimeout(() => {
      const account = findAccountByIdentifier(trimmed, method);
      setIsLoading(false);

      if (!account) {
        setError('No encontramos ninguna cuenta con ese correo o DNI (prueba con mateo.quispe@peru.pe o 72485910).');
        return;
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      setDetectedMethod(method);
      setGeneratedOtp(code);
      setOtpDigits(['', '', '', '', '', '']);
      setStep('otp');
      onToast(`Código de verificación simulado: ${code}`);
    }, 650);
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setError(null);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      setOtpDigits(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otpDigits.join('');
    if (code.length < 6) {
      setError('Ingresa los 6 dígitos del código de verificación.');
      return;
    }
    if (code !== generatedOtp) {
      setError('El código ingresado no coincide. Verifica e inténtalo de nuevo.');
      return;
    }
    setStep('reset');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    window.setTimeout(() => {
      updateAccountPassword(identifier, detectedMethod, newPassword);
      setIsLoading(false);
      setStep('done');
    }, 600);
  };

  return (
    <div className="animate-fade-slide">
      <button
        type="button"
        onClick={onBackToLogin}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al inicio de sesión
      </button>

      {step === 'lookup' && (
        <>
          <div className="mb-5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Recuperar acceso
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Ingresa tu correo o DNI de 8 dígitos para enviarte un código de verificación.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-[#C8102E] mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLookup} noValidate className="space-y-4">
            <div>
              <label htmlFor="recover-id" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Correo electrónico o DNI
              </label>
              <div className="relative flex items-center">
                <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="recover-id"
                  type="text"
                  placeholder="mateo.quispe@peru.pe o 72485910"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#C8102E] focus:outline-none focus:ring-4 focus:ring-[#C8102E]/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C8102E] px-4 text-sm font-semibold text-white shadow-md shadow-[#C8102E]/25 transition hover:bg-[#A60D26] disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enviando código...</span>
                </>
              ) : (
                <span>Enviar código de verificación</span>
              )}
            </button>
          </form>
        </>
      )}

      {step === 'otp' && (
        <>
          <div className="mb-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#C8102E] ring-1 ring-red-100">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Verifica tu identidad
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Ingresa el código de 6 dígitos enviado para{' '}
              <span className="font-semibold text-slate-800">{identifier}</span>.
            </p>
          </div>

          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/90 px-3.5 py-2 text-xs text-amber-900">
            Código demo generado: <strong className="font-mono text-sm tracking-widest">{generatedOtp}</strong>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-[#C8102E] mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="grid grid-cols-6 gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Dígito ${idx + 1}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={idx === 0 ? handleOtpPaste : undefined}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white text-center font-mono text-lg font-bold text-slate-900 focus:border-[#C8102E] focus:outline-none focus:ring-4 focus:ring-[#C8102E]/10"
                />
              ))}
            </div>

            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center rounded-xl bg-[#C8102E] px-4 text-sm font-semibold text-white shadow-md shadow-[#C8102E]/25 transition hover:bg-[#A60D26] cursor-pointer"
            >
              Verificar código
            </button>
          </form>
        </>
      )}

      {step === 'reset' && (
        <>
          <div className="mb-5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Nueva contraseña
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Define una contraseña segura para tu cuenta.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-[#C8102E] mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="reset-pass" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Nueva contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="reset-pass"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 focus:border-[#C8102E] focus:outline-none focus:ring-4 focus:ring-[#C8102E]/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reset-confirm" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Confirmar contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="reset-confirm"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 focus:border-[#C8102E] focus:outline-none focus:ring-4 focus:ring-[#C8102E]/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C8102E] px-4 text-sm font-semibold text-white shadow-md shadow-[#C8102E]/25 transition hover:bg-[#A60D26] disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Actualizando...</span>
                </>
              ) : (
                <span>Guardar contraseña</span>
              )}
            </button>
          </form>
        </>
      )}

      {step === 'done' && (
        <div className="py-4 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Contraseña actualizada
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Tu clave de acceso se restableció correctamente. Ya puedes iniciar sesión.
          </p>
          <button
            type="button"
            onClick={onBackToLogin}
            className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 cursor-pointer"
          >
            Ir a iniciar sesión
          </button>
        </div>
      )}
    </div>
  );
};

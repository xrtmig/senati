import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
} from 'lucide-react';
import {
  authenticateUser,
  isValidDocument,
  isValidEmail,
  loadRememberedCredentials,
  saveRememberedCredentials,
  SEEDED_USERS,
  type AuthSession,
  type DocumentType,
  type LoginMethod,
} from '../data/authStorage';
import { GoogleLogo, MicrosoftLogo } from './PeruEmblem';

interface LoginFormProps {
  onSuccess: (session: AuthSession) => void;
  onGoRegister: () => void;
  onGoForgot: () => void;
  onOpenSso: (provider: 'google' | 'microsoft') => void;
  onToast: (message: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onGoRegister,
  onGoForgot,
  onOpenSso,
  onToast,
}) => {
  const [method, setMethod] = useState<LoginMethod>('email');
  const [documentType, setDocumentType] = useState<DocumentType>('DNI');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    const saved = loadRememberedCredentials();
    if (saved) {
      setMethod(saved.method);
      setDocumentType(saved.documentType);
      setIdentifier(saved.identifier);
      setRememberMe(true);
    }
  }, []);

  const handleMethodChange = (next: LoginMethod) => {
    setMethod(next);
    setIdentifier('');
    setFieldError(null);
    setSubmitError(null);
  };

  const handleIdentifierChange = (raw: string) => {
    setSubmitError(null);
    if (method === 'dni') {
      if (documentType === 'DNI') {
        const numeric = raw.replace(/\D/g, '').slice(0, 8);
        setIdentifier(numeric);
        if (fieldError && numeric.length === 8) setFieldError(null);
      } else {
        const alnum = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
        setIdentifier(alnum);
        if (fieldError && alnum.length >= 9) setFieldError(null);
      }
    } else {
      setIdentifier(raw);
      if (fieldError && isValidEmail(raw)) setFieldError(null);
    }
  };

  const validateIdentifier = (): boolean => {
    if (method === 'email') {
      if (!identifier.trim()) {
        setFieldError('Ingresa tu correo electrónico.');
        return false;
      }
      if (!isValidEmail(identifier)) {
        setFieldError('Ingresa un correo válido (ej. nombre@peru.pe).');
        return false;
      }
    } else {
      if (!identifier.trim()) {
        setFieldError(`Ingresa tu número de ${documentType}.`);
        return false;
      }
      if (!isValidDocument(documentType, identifier)) {
        setFieldError(
          documentType === 'DNI'
            ? 'El DNI peruano debe tener exactamente 8 dígitos.'
            : 'El Carné de Extranjería debe tener entre 9 y 12 caracteres.',
        );
        return false;
      }
    }
    setFieldError(null);
    return true;
  };

  const handleKeyCheck = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleFillDemo = () => {
    const demo = SEEDED_USERS[0];
    setFieldError(null);
    setSubmitError(null);
    if (method === 'email') {
      setIdentifier(demo.email);
    } else {
      setDocumentType('DNI');
      setIdentifier(demo.documentNumber);
    }
    setPassword(demo.password);
    onToast('Credenciales de prueba completadas. Haz clic en Iniciar sesión.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validId = validateIdentifier();
    if (!validId) {
      setShakeKey((k) => k + 1);
      return;
    }

    if (!password) {
      setSubmitError('Ingresa tu contraseña para continuar.');
      setShakeKey((k) => k + 1);
      return;
    }

    setIsLoading(true);

    window.setTimeout(() => {
      const result = authenticateUser({
        method,
        identifier,
        documentType,
        password,
      });

      setIsLoading(false);

      if (!result.ok) {
        setSubmitError(result.error);
        setShakeKey((k) => k + 1);
        return;
      }

      if (rememberMe) {
        saveRememberedCredentials({
          method,
          documentType,
          identifier: identifier.trim(),
        });
      } else {
        saveRememberedCredentials(null);
      }

      onSuccess(result.session);
    }, 750);
  };

  const isDocValid = method === 'dni' && isValidDocument(documentType, identifier);

  return (
    <div key={shakeKey} className={shakeKey > 0 && (submitError || fieldError) ? 'animate-shake' : ''}>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Iniciar sesión
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Accede con tu correo electrónico o documento de identidad peruano.
        </p>
      </div>

      {/* Method segmented toggle */}
      <div
        className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200/70"
        role="tablist"
        aria-label="Método de identificación"
      >
        <button
          type="button"
          role="tab"
          aria-selected={method === 'email'}
          onClick={() => handleMethodChange('email')}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
            method === 'email'
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          Correo electrónico
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={method === 'dni'}
          onClick={() => handleMethodChange('dni')}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
            method === 'dni'
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          DNI / Documento
        </button>
      </div>

      {submitError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 px-3.5 py-2.5 text-xs text-red-800 animate-fade-slide"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-[#C8102E] mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Identifier Input */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="login-identifier"
              className="text-xs font-semibold text-slate-700"
            >
              {method === 'email' ? 'Correo electrónico' : 'Número de documento'}
            </label>
            {method === 'dni' && (
              <span
                className={`text-[11px] font-medium ${
                  isDocValid ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {documentType === 'DNI'
                  ? `${identifier.length}/8 dígitos`
                  : `${identifier.length}/12 caracteres`}
              </span>
            )}
          </div>

          <div className="relative flex items-center">
            {method === 'email' ? (
              <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
            ) : (
              <div className="absolute left-1.5 flex items-center">
                <select
                  aria-label="Tipo de documento"
                  value={documentType}
                  onChange={(e) => {
                    setDocumentType(e.target.value as DocumentType);
                    setIdentifier('');
                    setFieldError(null);
                  }}
                  className="rounded-lg bg-slate-100 py-1 pl-2 pr-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C8102E]/30 cursor-pointer"
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">C.E.</option>
                </select>
              </div>
            )}

            <input
              id="login-identifier"
              type={method === 'email' ? 'email' : 'text'}
              inputMode={method === 'dni' && documentType === 'DNI' ? 'numeric' : 'email'}
              autoComplete={method === 'email' ? 'username' : 'off'}
              placeholder={
                method === 'email'
                  ? 'nombre@peru.pe'
                  : documentType === 'DNI'
                    ? 'Ej. 72485910'
                    : 'Ej. 001928374'
              }
              value={identifier}
              onChange={(e) => handleIdentifierChange(e.target.value)}
              onBlur={() => {
                if (identifier.trim().length > 0) validateIdentifier();
              }}
              aria-invalid={Boolean(fieldError)}
              className={`h-11 w-full rounded-xl border bg-white text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-4 ${
                method === 'email' ? 'pl-10 pr-3.5' : 'pl-[4.75rem] pr-9'
              } ${
                fieldError
                  ? 'border-red-300 focus:border-[#C8102E] focus:ring-red-500/10'
                  : 'border-slate-200 hover:border-slate-300 focus:border-[#C8102E] focus:ring-[#C8102E]/10'
              }`}
            />

            {isDocValid && (
              <Check className="pointer-events-none absolute right-3 h-4 w-4 text-emerald-600" />
            )}
          </div>

          {fieldError && (
            <p className="mt-1.5 text-xs font-medium text-[#C8102E]" role="alert">
              {fieldError}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
              Contraseña
            </label>
            <button
              type="button"
              onClick={onGoForgot}
              className="text-xs font-semibold text-[#C8102E] hover:text-[#990D24] hover:underline transition cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div className="relative flex items-center">
            <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setSubmitError(null);
              }}
              onKeyDown={handleKeyCheck}
              onKeyUp={handleKeyCheck}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition hover:border-slate-300 focus:border-[#C8102E] focus:outline-none focus:ring-4 focus:ring-[#C8102E]/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {capsLockOn && (
            <div
              aria-live="polite"
              className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200"
            >
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              Bloq Mayús activado
            </div>
          )}
        </div>

        {/* Remember & Demo Pill */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#C8102E] accent-[#C8102E] focus:ring-[#C8102E]/30 cursor-pointer"
            />
            Recordar en este equipo
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C8102E] px-4 text-sm font-semibold text-white shadow-md shadow-[#C8102E]/25 transition-all hover:bg-[#A60D26] focus:outline-none focus:ring-4 focus:ring-[#C8102E]/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verificando credenciales...</span>
            </>
          ) : (
            <>
              <span>Iniciar sesión</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Discreet demo credentials helper */}
      <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#C8102E]" />
          <span className="truncate text-slate-600">
            <strong className="font-semibold text-slate-800">Demo:</strong>{' '}
            {method === 'email' ? 'mateo.quispe@peru.pe' : 'DNI 72485910'} ·{' '}
            <code className="rounded bg-slate-200/70 px-1 py-0.5 text-[11px] text-slate-700">
              Peru2026!
            </code>
          </span>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-xs ring-1 ring-slate-200 hover:bg-slate-100 transition cursor-pointer"
        >
          Autocompletar
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-5 flex items-center">
        <div className="grow border-t border-slate-200" />
        <span className="mx-3 shrink text-[11px] font-medium uppercase tracking-wider text-slate-400">
          o continúa con
        </span>
        <div className="grow border-t border-slate-200" />
      </div>

      {/* SSO Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onOpenSso('google')}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] cursor-pointer"
        >
          <GoogleLogo />
          Google
        </button>
        <button
          type="button"
          onClick={() => onOpenSso('microsoft')}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] cursor-pointer"
        >
          <MicrosoftLogo />
          Microsoft
        </button>
      </div>

      <p className="mt-5 text-center text-xs text-slate-500">
        ¿No tienes una cuenta?{' '}
        <button
          type="button"
          onClick={onGoRegister}
          className="font-semibold text-[#C8102E] hover:text-[#990D24] hover:underline cursor-pointer"
        >
          Crear cuenta gratuita
        </button>
      </p>
    </div>
  );
};

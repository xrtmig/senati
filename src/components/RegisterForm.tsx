import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import {
  isValidDocument,
  isValidEmail,
  registerAccount,
  type AuthSession,
  type DocumentType,
} from '../data/authStorage';

interface RegisterFormProps {
  onSuccess: (session: AuthSession) => void;
  onBackToLogin: () => void;
  onOpenLegal: (tab: 'terms' | 'privacy') => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onBackToLogin,
  onOpenLegal,
}) => {
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const strength = useMemo(() => {
    const checks = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    const label =
      score === 0
        ? ''
        : score === 1
          ? 'Débil'
          : score === 2
            ? 'Aceptable'
            : score === 3
              ? 'Fuerte'
              : 'Muy segura';
    const color =
      score <= 1
        ? 'bg-red-500'
        : score === 2
          ? 'bg-amber-500'
          : score === 3
            ? 'bg-emerald-500'
            : 'bg-emerald-600';
    return { checks, score, label, color };
  }, [password]);

  const handleDocChange = (raw: string) => {
    if (documentType === 'DNI') {
      setDocumentNumber(raw.replace(/\D/g, '').slice(0, 8));
    } else {
      setDocumentNumber(raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 4) {
      setError('Ingresa tus nombres y apellidos completos.');
      return;
    }
    if (!isValidDocument(documentType, documentNumber)) {
      setError(
        documentType === 'DNI'
          ? 'El DNI debe contener exactamente 8 dígitos.'
          : 'El Carné de Extranjería debe tener entre 9 y 12 caracteres.',
      );
      return;
    }
    if (!isValidEmail(email)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!acceptTerms) {
      setError('Debes aceptar los Términos de uso y la Política de Privacidad.');
      return;
    }

    setIsLoading(true);
    window.setTimeout(() => {
      const res = registerAccount({
        fullName,
        email,
        documentType,
        documentNumber,
        password,
      });
      setIsLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onSuccess(res.session);
    }, 750);
  };

  return (
    <div className="animate-fade-slide">
      <button
        type="button"
        onClick={onBackToLogin}
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al inicio de sesión
      </button>

      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Crear cuenta
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Registra tu identidad para acceder a los servicios del portal.
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

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        <div>
          <label htmlFor="reg-name" className="mb-1 block text-xs font-semibold text-slate-700">
            Nombres y apellidos
          </label>
          <div className="relative flex items-center">
            <User className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="Ej. Valeria Paredes Salas"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-10.5 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#C8102E] focus:outline-none focus:ring-4 focus:ring-[#C8102E]/10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-doc" className="mb-1 block text-xs font-semibold text-slate-700">
            Documento de identidad
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-1.5 flex items-center">
              <select
                aria-label="Tipo de documento"
                value={documentType}
                onChange={(e) => {
                  setDocumentType(e.target.value as DocumentType);
                  setDocumentNumber('');
                }}
                className="rounded-lg bg-slate-100 py-1 pl-2 pr-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="DNI">DNI</option>
                <option value="CE">C.E.</option>
              </select>
            </div>
            <input
              id="reg-doc"
              type="text"
              inputMode={documentType === 'DNI' ? 'numeric' : 'text'}
              placeholder={documentType === 'DNI' ? '8 dígitos (ej. 74829103)' : '9 a 12 caracteres'}
              value={documentNumber}
              onChange={(e) => handleDocChange(e.target.value)}
              className="h-10.5 w-full rounded-xl border border-slate-200 bg-white pl-[4.75rem] pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#C8102E] focus:outline-none focus:ring-4 focus:ring-[#C8102E]/10"
            />
            {isValidDocument(documentType, documentNumber) ? (
              <Check className="pointer-events-none absolute right-3 h-4 w-4 text-emerald-600" />
            ) : (
              <CreditCard className="pointer-events-none absolute right-3 h-4 w-4 text-slate-300" />
            )}
          </div>
        </div>

        <div>
          <label htmlFor="reg-email" className="mb-1 block text-xs font-semibold text-slate-700">
            Correo electrónico
          </label>
          <div className="relative flex items-center">
            <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="nombre@correo.pe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10.5 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#C8102E] focus:outline-none focus:ring-4 focus:ring-[#C8102E]/10"
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="reg-pass" className="text-xs font-semibold text-slate-700">
              Contraseña
            </label>
            {strength.label && (
              <span className="text-[11px] font-semibold text-slate-600">
                Seguridad: {strength.label}
              </span>
            )}
          </div>
          <div className="relative flex items-center">
            <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              id="reg-pass"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10.5 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#C8102E] focus:outline-none focus:ring-4 focus:ring-[#C8102E]/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {password.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={`h-1 rounded-full transition-colors ${
                      strength.score >= bar ? strength.color : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                <span className={strength.checks.length ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                  • 8+ caracteres
                </span>
                <span className={strength.checks.upper ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                  • Mayúscula
                </span>
                <span className={strength.checks.number ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                  • Número
                </span>
              </div>
            </div>
          )}
        </div>

        <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#C8102E] cursor-pointer"
          />
          <span className="leading-relaxed">
            Acepto los{' '}
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="font-semibold text-[#C8102E] hover:underline cursor-pointer"
            >
              Términos de uso
            </button>{' '}
            y el tratamiento de datos personales conforme a la{' '}
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="font-semibold text-[#C8102E] hover:underline cursor-pointer"
            >
              Ley N.° 29733
            </button>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C8102E] px-4 text-sm font-semibold text-white shadow-md shadow-[#C8102E]/25 transition hover:bg-[#A60D26] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creando cuenta...</span>
            </>
          ) : (
            <>
              <span>Registrarme y entrar</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

import React from 'react';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  LogOut,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { maskDocument, type AuthSession } from '../data/authStorage';
import { PeruFlag } from './PeruEmblem';

interface AuthenticatedViewProps {
  session: AuthSession;
  onLogout: () => void;
}

export const AuthenticatedView: React.FC<AuthenticatedViewProps> = ({
  session,
  onLogout,
}) => {
  const { user, loginMethod, loggedInAt, sessionId } = session;

  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  const formattedTime = (() => {
    try {
      return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(loggedInAt));
    } catch {
      return loggedInAt;
    }
  })();

  const methodLabel =
    loginMethod === 'email'
      ? 'Correo y contraseña'
      : loginMethod === 'dni'
        ? `${user.documentType} y contraseña`
        : loginMethod === 'google'
          ? 'Google OAuth'
          : 'Microsoft Entra ID';

  return (
    <div className="animate-fade-slide">
      <div className="mb-5 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Sesión iniciada correctamente
        </div>
        <span className="font-mono text-[11px] font-medium text-slate-400">
          {sessionId}
        </span>
      </div>

      {/* User profile header */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#C8102E] to-[#910B21] font-display text-base font-bold text-white shadow-sm">
          {initials || 'PE'}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-base font-bold text-slate-900">
            {user.fullName}
          </h2>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
          <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            <PeruFlag className="h-3 w-4" />
            <span>{user.role}</span>
          </div>
        </div>
      </div>

      {/* Session audit metadata */}
      <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white px-4">
        <div className="flex items-center justify-between py-2.5 text-xs">
          <span className="flex items-center gap-2 text-slate-500">
            <CreditCard className="h-3.5 w-3.5 text-slate-400" />
            Documento
          </span>
          <span className="font-mono font-semibold text-slate-800">
            {user.documentType} {maskDocument(user.documentNumber)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 text-xs">
          <span className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            Método de ingreso
          </span>
          <span className="font-semibold text-slate-800">{methodLabel}</span>
        </div>

        <div className="flex items-center justify-between py-2.5 text-xs">
          <span className="flex items-center gap-2 text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            Región detectada
          </span>
          <span className="font-semibold text-slate-800">{user.region}</span>
        </div>

        <div className="flex items-center justify-between py-2.5 text-xs">
          <span className="flex items-center gap-2 text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            Hora de acceso (Lima)
          </span>
          <span className="font-medium text-slate-700">{formattedTime}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  );
};

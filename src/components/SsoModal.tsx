import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, X } from 'lucide-react';
import { GoogleLogo, MicrosoftLogo } from './PeruEmblem';
import { createSsoSession, type AuthSession } from '../data/authStorage';

interface SsoModalProps {
  provider: 'google' | 'microsoft' | null;
  onClose: () => void;
  onSuccess: (session: AuthSession) => void;
}

const SSO_ACCOUNTS = {
  google: [
    {
      fullName: 'Mateo Quispe Huamán',
      email: 'mateo.quispe@gmail.com',
      region: 'Lima, Perú',
      initials: 'MQ',
      accent: 'bg-[#C8102E]',
    },
    {
      fullName: 'Valeria Paredes Salas',
      email: 'valeria.paredes.pe@gmail.com',
      region: 'Arequipa, Perú',
      initials: 'VP',
      accent: 'bg-slate-800',
    },
  ],
  microsoft: [
    {
      fullName: 'Lucía Mendoza Paredes',
      email: 'lucia.mendoza@outlook.com.pe',
      region: 'Cusco, Perú',
      initials: 'LM',
      accent: 'bg-sky-700',
    },
    {
      fullName: 'Mateo Quispe Huamán',
      email: 'mquispe@corporativo.pe',
      region: 'Lima, Perú',
      initials: 'MQ',
      accent: 'bg-[#C8102E]',
    },
  ],
};

export const SsoModal: React.FC<SsoModalProps> = ({ provider, onClose, onSuccess }) => {
  const [authenticatingEmail, setAuthenticatingEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!provider) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !authenticatingEmail) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [provider, authenticatingEmail, onClose]);

  if (!provider) return null;

  const accounts = SSO_ACCOUNTS[provider];
  const providerName = provider === 'google' ? 'Google' : 'Microsoft';

  const handleSelectAccount = (account: (typeof accounts)[number]) => {
    setAuthenticatingEmail(account.email);
    window.setTimeout(() => {
      const session = createSsoSession({
        provider,
        fullName: account.fullName,
        email: account.email,
        region: account.region,
      });
      setAuthenticatingEmail(null);
      onSuccess(session);
    }, 650);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-slide"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sso-modal-title"
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            {provider === 'google' ? (
              <GoogleLogo className="h-5 w-5" />
            ) : (
              <MicrosoftLogo className="h-5 w-5" />
            )}
            <span id="sso-modal-title" className="text-sm font-semibold text-slate-900">
              Iniciar sesión con {providerName}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(authenticatingEmail)}
            aria-label="Cerrar ventana"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="mb-3 text-xs text-slate-500">
            Elige una cuenta verificada para continuar a <strong className="text-slate-800">Portal Perú</strong>:
          </p>

          <div className="space-y-2">
            {accounts.map((acc) => {
              const isBusy = authenticatingEmail === acc.email;
              return (
                <button
                  key={acc.email}
                  type="button"
                  disabled={Boolean(authenticatingEmail)}
                  onClick={() => handleSelectAccount(acc)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${acc.accent}`}
                  >
                    {acc.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {acc.fullName}
                    </div>
                    <div className="truncate text-xs text-slate-500">{acc.email}</div>
                  </div>
                  {isBusy && <Loader2 className="h-4 w-4 animate-spin text-[#C8102E]" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Autenticación simulada OAuth 2.0 · Entorno seguro Perú</span>
          </div>
        </div>
      </div>
    </div>
  );
};

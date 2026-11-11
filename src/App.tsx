import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { PERU_SCENES } from './data/peruScenes';
import {
  loadPreferredSceneId,
  loadSession,
  savePreferredSceneId,
  saveSession,
  type AuthSession,
} from './data/authStorage';
import { PeruBackdrop } from './components/PeruBackdrop';
import { PeruFlag, PortalLogo } from './components/PeruEmblem';
import { SceneSwitcher } from './components/SceneSwitcher';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { AuthenticatedView } from './components/AuthenticatedView';
import { SsoModal } from './components/SsoModal';
import { LegalModal, type LegalTab } from './components/LegalModal';

type CardView = 'login' | 'register' | 'forgot';

export function App() {
  const [activeSceneId, setActiveSceneId] = useState<string>(() => {
    const saved = loadPreferredSceneId();
    return saved && PERU_SCENES.some((s) => s.id === saved)
      ? saved
      : PERU_SCENES[0].id;
  });

  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const [view, setView] = useState<CardView>('login');
  const [ssoProvider, setSsoProvider] = useState<'google' | 'microsoft' | null>(null);
  const [legalTab, setLegalTab] = useState<LegalTab>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const activeScene =
    PERU_SCENES.find((s) => s.id === activeSceneId) ?? PERU_SCENES[0];

  const handleSelectScene = (id: string) => {
    setActiveSceneId(id);
    savePreferredSceneId(id);
  };

  const handleLoginSuccess = (nextSession: AuthSession) => {
    setSession(nextSession);
    setSsoProvider(null);
    setToast(`Bienvenido, ${nextSession.user.fullName.split(' ')[0]}.`);
  };

  const handleLogout = () => {
    saveSession(null);
    setSession(null);
    setView('login');
    setToast('Sesión cerrada de forma segura.');
  };

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden">
      <PeruBackdrop activeSceneId={activeScene.id} />

      {/* Subtle floating feedback toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-950/90 px-4 py-2 text-xs font-medium text-white shadow-xl ring-1 ring-white/15 backdrop-blur-md animate-fade-slide whitespace-nowrap max-w-[92vw] truncate"
        >
          {toast}
        </div>
      )}

      <main className="mx-auto flex min-h-dvh w-full max-w-[1380px] flex-col justify-center px-4 py-6 sm:px-8 lg:px-12 xl:px-14">
        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Showcase Column (Desktop) */}
          <section className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between min-h-[620px] py-2">
            <div>
              <PortalLogo variant="light" />
            </div>

            <div className="my-auto max-w-xl py-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20 backdrop-blur-md">
                <PeruFlag className="h-3 w-4" />
                <span>Plataforma Oficial · República del Perú</span>
              </div>

              <h2 className="font-display text-4xl xl:text-[44px] font-bold tracking-tight text-white leading-[1.12] drop-shadow-sm">
                {activeScene.headline}
              </h2>

              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/80">
                Accede con seguridad a tus trámites, credenciales y servicios en línea
                mediante correo electrónico o documento nacional de identidad.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5 text-xs font-medium text-white/85">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950/45 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur-md">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  Cifrado TLS 1.3
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950/45 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur-md">
                  Validación DNI / C.E.
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950/45 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur-md">
                  Acceso 24/7
                </span>
              </div>
            </div>

            <SceneSwitcher
              activeScene={activeScene}
              onSelectScene={handleSelectScene}
            />
          </section>

          {/* Right Authentication Card Column */}
          <section className="lg:col-span-6 xl:col-span-5 flex flex-col items-center lg:items-end">
            {/* Compact Mobile Header */}
            <div className="mb-5 flex w-full max-w-[440px] items-center justify-between lg:hidden">
              <PortalLogo variant="light" />
            </div>

            {/* Frosted Pearl Glass Card */}
            <div className="w-full max-w-[440px] overflow-hidden rounded-3xl bg-white/[0.95] backdrop-blur-2xl shadow-[0_24px_70px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/75">
              {/* Subtle Peruvian Crimson-White-Crimson Hairline */}
              <div
                className="h-[3px] w-full"
                style={{
                  background:
                    'linear-gradient(90deg, #C8102E 0%, #C8102E 34%, #F1F5F9 34%, #F1F5F9 66%, #C8102E 66%, #C8102E 100%)',
                }}
                aria-hidden="true"
              />

              {/* Micro Security / Locale Bar */}
              <div className="flex items-center justify-between border-b border-slate-100/90 px-6 py-3 sm:px-8">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <Lock className="h-3 w-3 text-emerald-600" />
                  Conexión cifrada
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                  <PeruFlag className="h-3 w-4" />
                  Español (Perú)
                </span>
              </div>

              {/* Card Interactive Content */}
              <div className="px-6 py-6 sm:px-8 sm:py-7">
                {session ? (
                  <AuthenticatedView session={session} onLogout={handleLogout} />
                ) : view === 'login' ? (
                  <LoginForm
                    onSuccess={handleLoginSuccess}
                    onGoRegister={() => setView('register')}
                    onGoForgot={() => setView('forgot')}
                    onOpenSso={(provider) => setSsoProvider(provider)}
                    onToast={setToast}
                  />
                ) : view === 'register' ? (
                  <RegisterForm
                    onSuccess={handleLoginSuccess}
                    onBackToLogin={() => setView('login')}
                    onOpenLegal={(tab) => setLegalTab(tab)}
                  />
                ) : (
                  <ForgotPasswordForm
                    onBackToLogin={() => setView('login')}
                    onToast={setToast}
                  />
                )}
              </div>

              {/* Card Legal Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/90 px-6 py-3 text-[11px] text-slate-500 sm:px-8">
                <span>© 2026 Portal Perú</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLegalTab('terms')}
                    className="hover:text-slate-900 hover:underline cursor-pointer"
                  >
                    Términos
                  </button>
                  <button
                    type="button"
                    onClick={() => setLegalTab('privacy')}
                    className="hover:text-slate-900 hover:underline cursor-pointer"
                  >
                    Privacidad
                  </button>
                  <button
                    type="button"
                    onClick={() => setLegalTab('support')}
                    className="hover:text-slate-900 hover:underline cursor-pointer"
                  >
                    Soporte
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Peru Scene Switcher */}
            <div className="mt-4 w-full max-w-[440px] lg:hidden">
              <SceneSwitcher
                activeScene={activeScene}
                onSelectScene={handleSelectScene}
                compact
              />
            </div>
          </section>
        </div>
      </main>

      <SsoModal
        provider={ssoProvider}
        onClose={() => setSsoProvider(null)}
        onSuccess={handleLoginSuccess}
      />

      <LegalModal tab={legalTab} onClose={() => setLegalTab(null)} />
    </div>
  );
}

export default App;

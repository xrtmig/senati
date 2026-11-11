import React, { useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export type LegalTab = 'terms' | 'privacy' | 'support' | null;

interface LegalModalProps {
  tab: LegalTab;
  onClose: () => void;
}

const CONTENT: Record<Exclude<LegalTab, null>, { title: string; body: string[] }> = {
  terms: {
    title: 'Términos y Condiciones de Uso',
    body: [
      'El acceso a Portal Digital Perú está destinado a usuarios autorizados que cuenten con correo electrónico válido o documento de identidad vigente (DNI o Carné de Extranjería).',
      'Cada usuario es responsable de resguardar la confidencialidad de sus credenciales de acceso y de cerrar sesión al utilizar equipos compartidos.',
      'El sistema registra eventos de inicio de sesión con fines exclusivos de auditoría de seguridad y prevención de accesos no autorizados.',
    ],
  },
  privacy: {
    title: 'Política de Privacidad (Ley N.° 29733)',
    body: [
      'En cumplimiento de la Ley N.° 29733, Ley de Protección de Datos Personales del Perú, y su reglamento vigente, protegemos tu información personal mediante cifrado en tránsito TLS 1.3.',
      'Tus datos de identificación (nombres, correo electrónico y documento nacional de identidad) se utilizan únicamente para verificar tu acceso al portal.',
      'Puedes solicitar la actualización o eliminación de tus datos locales en cualquier momento desde las opciones de tu cuenta.',
    ],
  },
  support: {
    title: 'Centro de Soporte Técnico · Perú',
    body: [
      '¿Tienes problemas para ingresar? Verifica que tu DNI tenga exactamente 8 dígitos numéricos o utiliza el flujo "¿Olvidaste tu contraseña?" para restablecer tu acceso mediante código de verificación.',
      'Horario de atención referencial: Lunes a Viernes de 08:00 a 19:00 PET (Hora de Lima, Perú).',
      'Para pruebas inmediatas puedes utilizar el botón "Autocompletar" ubicado debajo del botón Iniciar sesión.',
    ],
  },
};

export const LegalModal: React.FC<LegalModalProps> = ({ tab, onClose }) => {
  useEffect(() => {
    if (!tab) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tab, onClose]);

  if (!tab) return null;
  const info = CONTENT[tab];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-slide"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#C8102E]" />
            <h2 id="legal-modal-title" className="text-sm font-semibold text-slate-900">
              {info.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-5 text-xs leading-relaxed text-slate-600">
          {info.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

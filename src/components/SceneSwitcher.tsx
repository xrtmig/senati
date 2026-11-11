import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { PERU_SCENES, type PeruScene } from '../data/peruScenes';

interface SceneSwitcherProps {
  activeScene: PeruScene;
  onSelectScene: (id: string) => void;
  compact?: boolean;
}

function getLimaTime(): string {
  try {
    return new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    return '12:00';
  }
}

export const SceneSwitcher: React.FC<SceneSwitcherProps> = ({
  activeScene,
  onSelectScene,
  compact = false,
}) => {
  const [limaTime, setLimaTime] = useState<string>(getLimaTime);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLimaTime(getLimaTime());
    }, 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const currentIdx = PERU_SCENES.findIndex((s) => s.id === activeScene.id);

  const cycle = (delta: number) => {
    const nextIdx = (currentIdx + delta + PERU_SCENES.length) % PERU_SCENES.length;
    onSelectScene(PERU_SCENES[nextIdx].id);
  };

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-950/60 px-3.5 py-2.5 text-white/90 ring-1 ring-white/15 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
          <span className="font-medium text-white">{activeScene.name}</span>
          <span className="text-white/60">· {activeScene.region}</span>
        </div>
        <div className="flex items-center gap-1">
          {PERU_SCENES.map((scene) => {
            const selected = scene.id === activeScene.id;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => onSelectScene(scene.id)}
                title={`${scene.name} (${scene.region})`}
                aria-label={`Cambiar fondo a ${scene.name}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  selected ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="inline-flex w-fit items-center gap-3 rounded-2xl bg-slate-950/55 px-4 py-3 text-white ring-1 ring-white/15 backdrop-blur-xl shadow-xl">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 shrink-0">
          <MapPin className="h-4 w-4 text-rose-300" />
        </div>
        <div className="min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-white">
              {activeScene.name}
            </span>
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/85">
              {activeScene.elevation}
            </span>
          </div>
          <p className="text-xs text-white/75 truncate">
            {activeScene.region} · {activeScene.subtitle}
          </p>
        </div>

        <div className="h-7 w-px bg-white/15" />

        <div className="flex items-center gap-1.5 pl-1">
          <button
            type="button"
            onClick={() => cycle(-1)}
            aria-label="Paisaje anterior del Perú"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/80 hover:bg-white/15 hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => cycle(1)}
            aria-label="Siguiente paisaje del Perú"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/80 hover:bg-white/15 hover:text-white transition cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-white/75">
        <div className="flex items-center gap-1.5">
          {PERU_SCENES.map((scene, index) => {
            const active = scene.id === activeScene.id;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => onSelectScene(scene.id)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-slate-950/45 text-white/80 ring-1 ring-white/15 hover:bg-slate-950/70 hover:text-white backdrop-blur-md'
                }`}
              >
                0{index + 1} · {scene.name.split(',')[0]}
              </button>
            );
          })}
        </div>
        <span className="hidden xl:inline-flex items-center gap-1 text-white/65 ml-1">
          <Clock className="h-3.5 w-3.5" />
          Lima {limaTime} PET
        </span>
      </div>
    </div>
  );
};

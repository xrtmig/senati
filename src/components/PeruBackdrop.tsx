import React from 'react';
import { PERU_SCENES } from '../data/peruScenes';

interface PeruBackdropProps {
  activeSceneId: string;
}

export const PeruBackdrop: React.FC<PeruBackdropProps> = ({ activeSceneId }) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#090d16]" aria-hidden="true">
      {PERU_SCENES.map((scene) => {
        const isActive = scene.id === activeSceneId;
        return (
          <img
            key={scene.id}
            src={scene.image}
            alt={`${scene.name}, ${scene.region}`}
            loading="eager"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-out ${
              isActive ? 'opacity-100 animate-kenburns' : 'opacity-0 pointer-events-none'
            }`}
          />
        );
      })}

      {/* Editorial atmospheric scrim: keeps Peru landscape vibrant while guaranteeing AAA text contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(108deg, rgba(8, 12, 21, 0.78) 0%, rgba(8, 12, 21, 0.36) 48%, rgba(8, 12, 21, 0.62) 100%)',
        }}
      />

      {/* Subtle bottom vignette for location metadata legibility */}
      <div
        className="absolute inset-x-0 bottom-0 h-48"
        style={{
          background: 'linear-gradient(to top, rgba(6, 9, 17, 0.85) 0%, rgba(6, 9, 17, 0) 100%)',
        }}
      />
    </div>
  );
};

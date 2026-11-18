import React from 'react';

export type SiriOrbStatus =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'searching'
  | 'planning'
  | 'speaking';

interface SiriOrbIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: SiriOrbStatus;
  audioLevel?: number;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<SiriOrbIconProps['size']>, string> = {
  xs: 'w-5 h-5',
  sm: 'w-7 h-7',
  md: 'w-11 h-11',
  lg: 'w-16 h-16',
  xl: 'w-28 h-28 sm:w-32 sm:h-32',
};

export const SiriOrbIcon: React.FC<SiriOrbIconProps> = ({
  size = 'md',
  status = 'idle',
  audioLevel = 0,
  className = '',
}) => {
  const isActive = status !== 'idle';
  const clampedLevel = Math.min(Math.max(audioLevel, 0), 1);
  const waveScaleY =
    status === 'listening' || status === 'speaking'
      ? 1 + clampedLevel * 1.35 + 0.18
      : isActive
      ? 1.18
      : 1;

  return (
    <div
      className={`relative rounded-full select-none shrink-0 flex items-center justify-center ${SIZE_CLASSES[size]} ${className}`}
      aria-hidden="true"
    >
      {/* Outer Ambient Plasma Halo when active */}
      <div
        className={`absolute -inset-1.5 rounded-full pointer-events-none transition-opacity duration-300 ${
          isActive ? 'opacity-95' : 'opacity-45'
        }`}
        style={{
          background:
            'radial-gradient(circle at 50% 52%, rgba(255, 106, 61, 0.42), rgba(56, 189, 248, 0.36) 55%, transparent 76%)',
          filter: size === 'xl' || size === 'lg' ? 'blur(10px)' : 'blur(4px)',
          transform: `scale(${1 + clampedLevel * 0.35})`,
        }}
      />

      {/* 3D Smoked Obsidian Glass Sphere Core (Matches attached _______5__988034c7.jpg) */}
      <div
        className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center siri-orb-sphere"
        style={{
          transform: `scale(${1 + clampedLevel * 0.12})`,
        }}
      >
        {/* Multi-Layered Horizontal Iridescent Plasma Ribbon Wave inside Center */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="orbBgGrad" cx="50%" cy="46%" r="54%">
              <stop offset="0%" stopColor="#171316" />
              <stop offset="68%" stopColor="#09080B" />
              <stop offset="100%" stopColor="#030305" />
            </radialGradient>

            {/* Top Coral-Orange-Crimson Plasma Wave */}
            <linearGradient id="plasmaTopCoral" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF5E3A" stopOpacity="0.1" />
              <stop offset="22%" stopColor="#FF4B3E" stopOpacity="0.92" />
              <stop offset="52%" stopColor="#FF7B38" stopOpacity="0.98" />
              <stop offset="78%" stopColor="#E11D48" stopOpacity="0.82" />
              <stop offset="100%" stopColor="#FF8A3D" stopOpacity="0.1" />
            </linearGradient>

            {/* Middle Golden Amber & Pearl White Ribbon */}
            <linearGradient id="plasmaMidAmber" x1="5%" y1="0%" x2="95%" y2="0%">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.05" />
              <stop offset="28%" stopColor="#F59E0B" stopOpacity="0.95" />
              <stop offset="56%" stopColor="#FFFDF9" stopOpacity="1" />
              <stop offset="82%" stopColor="#FDE68A" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
            </linearGradient>

            {/* Bottom Electric Cyan & Deep Sapphire Wave */}
            <linearGradient id="plasmaBottomCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.12" />
              <stop offset="24%" stopColor="#2563EB" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="1" />
              <stop offset="76%" stopColor="#E0F2FE" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.1" />
            </linearGradient>

            <filter id="plasmaGlowFilter" x="-30%" y="-40%" width="160%" height="180%">
              <feGaussianBlur stdDeviation="5.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Deep Smoked Glass Sphere Base */}
          <circle cx="100" cy="100" r="99" fill="url(#orbBgGrad)" />

          {/* Audio-Reactive Undulating Plasma Waves */}
          <g
            filter="url(#plasmaGlowFilter)"
            className="siri-orb-plasma-group"
            style={{
              transformOrigin: '100px 102px',
              transform: `scaleY(${waveScaleY})`,
              transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Upper Warm Coral-Crimson Arch */}
            <path
              d="M 10 104 C 46 98, 74 66, 104 72 C 134 78, 158 102, 190 104 C 156 112, 128 96, 98 92 C 66 88, 42 106, 10 104 Z"
              fill="url(#plasmaTopCoral)"
              className="siri-wave-coral"
            />

            {/* Middle Golden Amber & White Core Ribbon */}
            <path
              d="M 14 102 C 52 92, 76 80, 104 90 C 132 100, 154 114, 186 104 C 154 120, 124 114, 96 102 C 68 90, 44 104, 14 102 Z"
              fill="url(#plasmaMidAmber)"
              className="siri-wave-amber"
            />

            {/* Lower Electric Cyan & Sapphire Wave */}
            <path
              d="M 12 104 C 44 96, 68 104, 98 116 C 128 128, 154 116, 188 104 C 156 132, 114 136, 82 122 C 52 108, 34 108, 12 104 Z"
              fill="url(#plasmaBottomCyan)"
              className="siri-wave-cyan"
            />

            {/* Bright White-Gold Specular Horizon Filament */}
            <path
              d="M 24 101 Q 66 88 102 102 T 178 103"
              fill="none"
              stroke="#FFFDF9"
              strokeWidth="2.8"
              strokeLinecap="round"
              opacity="0.92"
            />
          </g>
        </svg>

        {/* Glass Sphere Chromatic Specular Rim & Top Lens Reflection */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow:
              'inset 0 2px 4px rgba(255, 232, 210, 0.55), inset 2px 0 5px rgba(255, 112, 67, 0.42), inset -2px -2px 6px rgba(255, 255, 255, 0.65), inset 0 -3px 7px rgba(56, 189, 248, 0.52)',
            background:
              'radial-gradient(80% 50% at 50% 10%, rgba(255, 255, 255, 0.22) 0%, transparent 60%)',
          }}
        />
      </div>
    </div>
  );
};

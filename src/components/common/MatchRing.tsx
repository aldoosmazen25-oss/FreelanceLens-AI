import React from 'react';

interface MatchRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const MatchRing: React.FC<MatchRingProps> = ({
  score,
  size = 64,
  strokeWidth = 5,
  label,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const strokeColor =
    clamped >= 85
      ? '#2be38a'
      : clamped >= 70
      ? '#62d9ff'
      : clamped >= 50
      ? '#ffc15a'
      : '#ff6b7f';

  return (
    <div className="inline-flex flex-col items-center gap-1 shrink-0">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>
        <span
          className="absolute font-mono font-bold tabular-nums text-[#effaf4]"
          style={{ fontSize: size >= 76 ? '1rem' : '0.78rem' }}
        >
          {clamped}%
        </span>
      </div>
      {label && <span className="text-[11px] text-[#a4c2b4] whitespace-nowrap">{label}</span>}
    </div>
  );
};

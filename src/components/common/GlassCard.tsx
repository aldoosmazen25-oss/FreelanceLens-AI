import React, { useRef } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'hot' | 'danger' | 'amber' | 'cyan';
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className = '',
  hoverable = true,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const variantStyles: Record<string, string> = {
    default: 'liquid-glass',
    hot: 'liquid-glass-hot',
    danger: 'liquid-glass-danger',
    amber: 'liquid-glass-amber',
    cyan: 'liquid-glass-cyan',
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      onPointerMove={handlePointerMove}
      className={`group relative rounded-3xl ${variantStyles[variant]} ${
        hoverable ? 'glass-card-hover' : ''
      } ${onClick ? 'glass-card-clickable' : ''} ${className}`}
    >
      <div aria-hidden="true" className="liquid-specular-overlay" />
      {children}
    </div>
  );
};



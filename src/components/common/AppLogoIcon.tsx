import React from 'react';

interface AppLogoIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AppLogoIconProps['size']>, string> = {
  xs: 'w-6 h-6 rounded-lg',
  sm: 'w-8 h-8 rounded-xl',
  md: 'w-9 h-9 rounded-2xl',
  lg: 'w-11 h-11 rounded-2xl',
  xl: 'w-14 h-14 rounded-3xl',
};

export const AppLogoIcon: React.FC<AppLogoIconProps> = ({
  size = 'md',
  className = '',
}) => {
  return (
    <img
      src="/firework-app-icon.svg"
      alt="Firework AI Icon"
      data-testid="firework-app-icon"
      className={`${SIZE_CLASSES[size]} object-contain shrink-0 shadow-[0_6px_18px_rgba(0,0,0,0.45)] select-none ${className}`}
    />
  );
};

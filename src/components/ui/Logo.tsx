import React from 'react';

interface LogoProps {
  variant?: 'default' | 'sidebar' | 'compact' | 'footer' | 'auth';
  className?: string;
}

export const OFFICIAL_LOGO_SRC = '/assets/aistudio/eClinic_transparent-04_c7311664.png';

export const Logo: React.FC<LogoProps> = ({ variant = 'default', className = '' }) => {
  const sizeClass =
    variant === 'compact'
      ? 'h-9 sm:h-10'
      : variant === 'sidebar'
      ? 'h-12'
      : variant === 'footer'
      ? 'h-14 sm:h-16'
      : variant === 'auth'
      ? 'h-12 sm:h-14'
      : 'h-12 sm:h-14';

  return (
    <img
      src={OFFICIAL_LOGO_SRC}
      alt="eClinic by MI'AH ICT Solutions"
      className={`${sizeClass} w-auto max-w-full object-contain select-none ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};

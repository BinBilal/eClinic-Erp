import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../store/themeStore';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className = '',
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        title={isDark ? 'Dark Theme active — Switch to Light' : 'Light Theme active — Switch to Dark'}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-[#F4F6F9] dark:bg-slate-800 text-xs font-semibold text-[#1E396A] dark:text-slate-100 hover:border-[#396BA4] dark:hover:border-[#396BA4] transition-colors whitespace-nowrap shrink-0 ${className}`}
      >
        {isDark ? (
          <>
            <Moon className="h-3.5 w-3.5 text-[#F05D21]" />
            <span>Dark</span>
          </>
        ) : (
          <>
            <Sun className="h-3.5 w-3.5 text-[#F05D21]" />
            <span>Light</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      title={isDark ? 'Dark Theme active — Switch to Light' : 'Light Theme active — Switch to Dark'}
      className={`h-9 px-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-[#396BA4] inline-flex items-center gap-1.5 text-xs font-semibold transition-colors shrink-0 ${className}`}
    >
      {isDark ? (
        <Moon className="h-4 w-4 text-[#F05D21]" />
      ) : (
        <Sun className="h-4 w-4 text-[#F05D21]" />
      )}
      <span className="hidden xl:inline">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
};

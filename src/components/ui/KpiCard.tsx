import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trendText?: string;
  trendPositive?: boolean;
  icon?: React.ReactNode;
  tone?: 'navy' | 'orange' | 'blue' | 'success' | 'warning' | 'error';
  ringPercent?: number;
  onClick?: () => void;
}

const ICON_BG: Record<NonNullable<KpiCardProps['tone']>, string> = {
  navy: 'bg-[#1E396A]/10 text-[#1E396A] dark:bg-[#396BA4]/25 dark:text-sky-300',
  orange: 'bg-[#F05D21]/12 text-[#F05D21] dark:bg-[#F05D21]/20 dark:text-[#FF7A45]',
  blue: 'bg-[#396BA4]/12 text-[#396BA4] dark:bg-[#396BA4]/25 dark:text-sky-300',
  success: 'bg-emerald-50 text-[#16A34A] dark:bg-emerald-950/60 dark:text-emerald-400',
  warning: 'bg-amber-50 text-[#D97706] dark:bg-amber-950/60 dark:text-amber-400',
  error: 'bg-red-50 text-[#DC2626] dark:bg-red-950/60 dark:text-red-400',
};

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subtext,
  trendText,
  trendPositive = true,
  icon,
  tone = 'navy',
  ringPercent,
  onClick,
}) => {
  const interactive = Boolean(onClick);
  const ringR = 19;
  const ringCirc = 2 * Math.PI * ringR;
  const ringFill =
    typeof ringPercent === 'number'
      ? (Math.max(0, Math.min(100, ringPercent)) / 100) * ringCirc
      : 0;

  return (
    <div
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3 transition-colors ${
        interactive
          ? 'cursor-pointer hover:border-[#396BA4] dark:hover:border-[#396BA4] focus-visible:outline-2 focus-visible:outline-[#F05D21]'
          : ''
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {icon && (
          <div
            className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${ICON_BG[tone]}`}
          >
            {icon}
          </div>
        )}

        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            {label}
          </p>
          <p className="mt-0.5 text-xl sm:text-2xl font-bold tracking-tight text-[#1E396A] dark:text-white tabular-nums truncate">
            {value}
          </p>
          {trendText ? (
            <p
              className={`mt-1 text-[11px] font-medium truncate ${
                trendPositive
                  ? 'text-[#16A34A] dark:text-emerald-400'
                  : 'text-[#DC2626] dark:text-red-400'
              }`}
            >
              {trendText}
            </p>
          ) : subtext ? (
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {subtext}
            </p>
          ) : null}
        </div>
      </div>

      {typeof ringPercent === 'number' && (
        <svg viewBox="0 0 46 46" className="h-11 w-11 -rotate-90 shrink-0">
          <circle
            cx="23"
            cy="23"
            r={ringR}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeWidth="4.5"
          />
          <circle
            cx="23"
            cy="23"
            r={ringR}
            fill="none"
            stroke="#F05D21"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray={`${ringFill} ${ringCirc}`}
          />
        </svg>
      )}
    </div>
  );
};

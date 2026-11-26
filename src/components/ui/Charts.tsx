import React, { useState } from 'react';

export interface ChartPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface BarChartProps {
  data: ChartPoint[];
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  formatValue?: (v: number) => string;
}

export const SimpleBarChart: React.FC<BarChartProps> = ({
  data,
  height = 170,
  primaryColor = '#1E396A',
  secondaryColor = '#396BA4',
  primaryLabel = 'Primary',
  secondaryLabel = 'Secondary',
  formatValue = (v) => String(v),
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(
    1,
    ...data.map((d) => Math.max(d.value, d.secondaryValue || 0))
  );

  const hasSecondary = data.some((d) => typeof d.secondaryValue === 'number');

  return (
    <div className="w-full">
      {hasSecondary && (
        <div className="flex items-center justify-end gap-5 mb-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: primaryColor }} />
            {primaryLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: secondaryColor }} />
            {secondaryLabel}
          </span>
        </div>
      )}

      <div
        className="relative flex items-end justify-between gap-1.5 sm:gap-2.5 pt-5 pb-1 border-b border-slate-200 dark:border-slate-700"
        style={{ height }}
      >
        {data.map((item, idx) => {
          const pct = Math.max(6, Math.round((item.value / maxVal) * 100));
          const secPct =
            typeof item.secondaryValue === 'number'
              ? Math.max(6, Math.round((item.secondaryValue / maxVal) * 100))
              : 0;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.label}
              className="relative flex-1 h-full flex flex-col items-center justify-end"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {isHovered && (
                <div className="absolute -top-2 z-20 px-2.5 py-1.5 rounded-lg bg-[#1E396A] text-white text-[11px] font-medium whitespace-nowrap shadow-md tabular-nums pointer-events-none border border-white/15">
                  <div>{item.label}</div>
                  <div>
                    {primaryLabel}: {formatValue(item.value)}
                  </div>
                  {typeof item.secondaryValue === 'number' && (
                    <div>
                      {secondaryLabel}: {formatValue(item.secondaryValue)}
                    </div>
                  )}
                </div>
              )}

              <div className="w-full h-full flex items-end justify-center gap-1 px-0.5">
                <div
                  className="w-full max-w-[20px] rounded-t-md transition-opacity duration-150"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: primaryColor,
                    opacity: hoveredIdx !== null && !isHovered ? 0.65 : 1,
                  }}
                />
                {typeof item.secondaryValue === 'number' && (
                  <div
                    className="w-full max-w-[20px] rounded-t-md transition-opacity duration-150"
                    style={{
                      height: `${secPct}%`,
                      backgroundColor: secondaryColor,
                      opacity: hoveredIdx !== null && !isHovered ? 0.65 : 1,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 pt-2">
        {data.map((item) => (
          <div
            key={item.label}
            className="flex-1 text-center text-[11px] text-slate-500 dark:text-slate-400 truncate"
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export interface SegmentItem {
  label: string;
  value: number;
  color: string;
}

export const DonutOverviewChart: React.FC<{
  items: SegmentItem[];
  centerValue: string | number;
  centerLabel: string;
  formatValue?: (v: number) => string;
}> = ({ items, centerValue, centerLabel, formatValue = (v) => String(v) }) => {
  const total = Math.max(
    1,
    items.reduce((acc, i) => acc + i.value, 0)
  );
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative h-36 w-36 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 130 130" className="h-36 w-36 -rotate-90">
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="16"
          />
          {items.map((item) => {
            const fraction = item.value / total;
            const dashLength = fraction * circumference;
            const dashOffset = -accumulated * circumference;
            accumulated += fraction;
            if (item.value <= 0) return null;
            return (
              <circle
                key={item.label}
                cx="65"
                cy="65"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="16"
                strokeDasharray={`${dashLength} ${circumference}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-bold text-[#1E396A] dark:text-white tabular-nums leading-none">
            {centerValue}
          </span>
          <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {centerLabel}
          </span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-2.5">
        {items.map((item) => {
          const pct = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={item.label} className="flex items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="text-slate-700 dark:text-slate-200 tabular-nums font-semibold shrink-0">
                {formatValue(item.value)}{' '}
                <span className="text-slate-400 font-normal">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SemiCircleGauge: React.FC<{
  percentage: number;
  caption: string;
  accentColor?: string;
}> = ({ percentage, caption, accentColor = '#396BA4' }) => {
  const clamped = Math.max(0, Math.min(100, percentage));
  const r = 64;
  const arcLen = Math.PI * r;
  const filledLen = (clamped / 100) * arcLen;

  return (
    <div className="relative flex flex-col items-center justify-center pt-1">
      <svg viewBox="0 0 160 92" className="w-44 h-24 overflow-visible">
        <path
          d="M 16 80 A 64 64 0 0 1 144 80"
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 16 80 A 64 64 0 0 1 144 80"
          fill="none"
          stroke={accentColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filledLen} ${arcLen}`}
        />
      </svg>
      <div className="-mt-10 text-center">
        <p className="text-2xl font-bold text-[#1E396A] dark:text-white tabular-nums">
          {clamped}%
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{caption}</p>
      </div>
    </div>
  );
};

export const AreaTrendChart: React.FC<{
  points: { label: string; value: number }[];
  strokeColor?: string;
  badgeText?: string;
  formatValue?: (v: number) => string;
}> = ({
  points,
  strokeColor = '#396BA4',
  badgeText,
  formatValue = (v) => String(v),
}) => {
  const width = 340;
  const height = 135;
  const padX = 16;
  const padY = 18;
  const maxVal = Math.max(1, ...points.map((p) => p.value)) * 1.15;

  const coords = points.map((pt, idx) => {
    const x =
      padX +
      (points.length > 1 ? (idx / (points.length - 1)) * (width - padX * 2) : 0);
    const y = height - padY - (pt.value / maxVal) * (height - padY * 2);
    return { ...pt, x, y };
  });

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x} ${c.y}`)
    .join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1]?.x || 0} ${
    height - padY
  } L ${coords[0]?.x || 0} ${height - padY} Z`;

  const last = coords[coords.length - 1];

  return (
    <div className="w-full">
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
          <defs>
            <linearGradient id="areaGradNexora" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Subtle horizontal gridlines */}
          {[0.25, 0.5, 0.75].map((f) => {
            const gy = height - padY - f * (height - padY * 2);
            return (
              <line
                key={f}
                x1={padX}
                y1={gy}
                x2={width - padX}
                y2={gy}
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            );
          })}

          <path d={areaPath} fill="url(#areaGradNexora)" />
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coords.map((c) => (
            <circle
              key={c.label}
              cx={c.x}
              cy={c.y}
              r="3.5"
              className="fill-white dark:fill-[#111B2E]"
              stroke={strokeColor}
              strokeWidth="2"
            >
              <title>{`${c.label}: ${formatValue(c.value)}`}</title>
            </circle>
          ))}
        </svg>

        {badgeText && last && (
          <div className="absolute top-1 right-2 px-2.5 py-1 rounded-md bg-[#1E396A] text-white text-[11px] font-semibold tabular-nums shadow-xs border border-white/15">
            {badgeText}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
        {points.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>
    </div>
  );
};

export const DistributionBreakdown: React.FC<{
  items: SegmentItem[];
  formatValue?: (v: number) => string;
}> = ({ items, formatValue = (v) => String(v) }) => {
  const total = Math.max(
    1,
    items.reduce((acc, i) => acc + i.value, 0)
  );

  return (
    <div className="space-y-4">
      <div className="h-3 w-full rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex">
        {items.map((item) => {
          const pct = (item.value / total) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={item.label}
              style={{ width: `${pct}%`, backgroundColor: item.color }}
              title={`${item.label}: ${formatValue(item.value)}`}
            />
          );
        })}
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                <span
                  className="h-2.5 w-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
              <span className="text-slate-600 dark:text-slate-300 tabular-nums font-medium">
                {formatValue(item.value)} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

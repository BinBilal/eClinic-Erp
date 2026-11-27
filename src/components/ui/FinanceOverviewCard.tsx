import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { TenantScope } from '../../types/erp';

type DatePeriod = 'Weekly' | 'Monthly' | 'Yearly';
type MetricKey = 'revenue' | 'expenses' | 'profit';

interface FinancePoint {
  label: string;
  fullLabel: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface FinanceOverviewCardProps {
  tenantScope: TenantScope;
  liveSalesTotal: number;
  liveExpensesTotal: number;
  onViewFinance?: () => void;
}

const BASELINE_SEED_SALES: Record<TenantScope, number> = {
  pharmacy: 314.4,
  pharmaceutical: 3935.0,
};

const BASELINE_SEED_EXPENSES: Record<TenantScope, number> = {
  pharmacy: 1005.0,
  pharmaceutical: 1810.0,
};

function formatCurrency(val: number): string {
  const abs = Math.abs(val);
  const formatted =
    abs >= 1000
      ? abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      : abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${val < 0 ? '-' : ''}$${formatted}`;
}

function formatAxisCurrency(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 1000) {
    return `${val < 0 ? '-' : ''}$${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}k`;
  }
  return `${val < 0 ? '-' : ''}$${Math.round(abs)}`;
}

function calcPctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function buildSmoothPath(coords: { x: number; y: number }[]): string {
  if (coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0].x.toFixed(2)} ${coords[0].y.toFixed(2)}`;
  if (coords.length === 2) {
    return `M ${coords[0].x.toFixed(2)} ${coords[0].y.toFixed(2)} L ${coords[1].x.toFixed(
      2
    )} ${coords[1].y.toFixed(2)}`;
  }

  let d = `M ${coords[0].x.toFixed(2)} ${coords[0].y.toFixed(2)}`;
  const tension = 0.22;

  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(
      2
    )}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d;
}

function getTenantSeriesData(
  tenantScope: TenantScope,
  period: DatePeriod,
  salesDelta: number,
  expensesDelta: number
): {
  series: FinancePoint[];
  prevTotals: { revenue: number; expenses: number; profit: number };
  periodLabel: string;
  avgDivisorLabel: string;
} {
  if (tenantScope === 'pharmacy') {
    if (period === 'Weekly') {
      const raw = [
        { label: 'Fri', fullLabel: 'Fri, Nov 20', revenue: 495, expenses: 215 },
        { label: 'Sat', fullLabel: 'Sat, Nov 21', revenue: 635, expenses: 250 },
        { label: 'Sun', fullLabel: 'Sun, Nov 22', revenue: 545, expenses: 205 },
        { label: 'Mon', fullLabel: 'Mon, Nov 23', revenue: 705, expenses: 275 },
        { label: 'Tue', fullLabel: 'Tue, Nov 24', revenue: 640, expenses: 240 },
        { label: 'Wed', fullLabel: 'Wed, Nov 25', revenue: 745, expenses: 285 },
        {
          label: 'Thu',
          fullLabel: 'Thu, Nov 26 (Today)',
          revenue: Math.max(0, 810 + salesDelta),
          expenses: Math.max(0, 270 + expensesDelta),
        },
      ];
      return {
        series: raw.map((p) => ({ ...p, profit: p.revenue - p.expenses })),
        prevTotals: { revenue: 4120, expenses: 1810, profit: 2310 },
        periodLabel: '7-day performance',
        avgDivisorLabel: 'day',
      };
    }
    if (period === 'Monthly') {
      const raw = [
        { label: 'Jun', fullLabel: 'June 2026', revenue: 9840, expenses: 5420 },
        { label: 'Jul', fullLabel: 'July 2026', revenue: 10950, expenses: 5890 },
        { label: 'Aug', fullLabel: 'August 2026', revenue: 11620, expenses: 6140 },
        { label: 'Sep', fullLabel: 'September 2026', revenue: 12480, expenses: 6410 },
        { label: 'Oct', fullLabel: 'October 2026', revenue: 13540, expenses: 6820 },
        {
          label: 'Nov',
          fullLabel: 'November 2026 (MTD)',
          revenue: Math.max(0, 14680 + salesDelta),
          expenses: Math.max(0, 7120 + expensesDelta),
        },
      ];
      return {
        series: raw.map((p) => ({ ...p, profit: p.revenue - p.expenses })),
        prevTotals: { revenue: 64200, expenses: 39100, profit: 25100 },
        periodLabel: '6-month trend',
        avgDivisorLabel: 'mo',
      };
    }
    const raw = [
      { label: '22', fullLabel: 'FY 2022', revenue: 92400, expenses: 58200 },
      { label: '23', fullLabel: 'FY 2023', revenue: 112800, expenses: 68900 },
      { label: '24', fullLabel: 'FY 2024', revenue: 129500, expenses: 76400 },
      { label: '25', fullLabel: 'FY 2025', revenue: 146200, expenses: 84100 },
      {
        label: '26',
        fullLabel: 'FY 2026 (YTD)',
        revenue: Math.max(0, 159800 + salesDelta),
        expenses: Math.max(0, 89600 + expensesDelta),
      },
    ];
    return {
      series: raw.map((p) => ({ ...p, profit: p.revenue - p.expenses })),
      prevTotals: { revenue: 542000, expenses: 356000, profit: 186000 },
      periodLabel: '5-year trajectory',
      avgDivisorLabel: 'yr',
    };
  }

  // Pharmaceutical Tenant Data (strictly isolated)
  if (period === 'Weekly') {
    const raw = [
      { label: 'Fri', fullLabel: 'Fri, Nov 20', revenue: 2150, expenses: 1180 },
      { label: 'Sat', fullLabel: 'Sat, Nov 21', revenue: 2840, expenses: 1420 },
      { label: 'Sun', fullLabel: 'Sun, Nov 22', revenue: 2490, expenses: 1290 },
      { label: 'Mon', fullLabel: 'Mon, Nov 23', revenue: 3320, expenses: 1680 },
      { label: 'Tue', fullLabel: 'Tue, Nov 24', revenue: 3110, expenses: 1540 },
      { label: 'Wed', fullLabel: 'Wed, Nov 25', revenue: 3640, expenses: 1790 },
      {
        label: 'Thu',
        fullLabel: 'Thu, Nov 26 (Today)',
        revenue: Math.max(0, 3935 + salesDelta),
        expenses: Math.max(0, 1810 + expensesDelta),
      },
    ];
    return {
      series: raw.map((p) => ({ ...p, profit: p.revenue - p.expenses })),
      prevTotals: { revenue: 18900, expenses: 10980, profit: 7920 },
      periodLabel: '7-day performance',
      avgDivisorLabel: 'day',
    };
  }
  if (period === 'Monthly') {
    const raw = [
      { label: 'Jun', fullLabel: 'June 2026', revenue: 46200, expenses: 28400 },
      { label: 'Jul', fullLabel: 'July 2026', revenue: 51800, expenses: 31200 },
      { label: 'Aug', fullLabel: 'August 2026', revenue: 54900, expenses: 32600 },
      { label: 'Sep', fullLabel: 'September 2026', revenue: 59400, expenses: 34800 },
      { label: 'Oct', fullLabel: 'October 2026', revenue: 64100, expenses: 37100 },
      {
        label: 'Nov',
        fullLabel: 'November 2026 (MTD)',
        revenue: Math.max(0, 69850 + salesDelta),
        expenses: Math.max(0, 39400 + expensesDelta),
      },
    ];
    return {
      series: raw.map((p) => ({ ...p, profit: p.revenue - p.expenses })),
      prevTotals: { revenue: 298500, expenses: 192400, profit: 106100 },
      periodLabel: '6-month trend',
      avgDivisorLabel: 'mo',
    };
  }
  const raw = [
    { label: '22', fullLabel: 'FY 2022', revenue: 412000, expenses: 268000 },
    { label: '23', fullLabel: 'FY 2023', revenue: 486000, expenses: 309000 },
    { label: '24', fullLabel: 'FY 2024', revenue: 548000, expenses: 342000 },
    { label: '25', fullLabel: 'FY 2025', revenue: 624000, expenses: 381000 },
    {
      label: '26',
      fullLabel: 'FY 2026 (YTD)',
      revenue: Math.max(0, 692500 + salesDelta),
      expenses: Math.max(0, 412800 + expensesDelta),
    },
  ];
  return {
    series: raw.map((p) => ({ ...p, profit: p.revenue - p.expenses })),
    prevTotals: { revenue: 2340000, expenses: 1585000, profit: 755000 },
    periodLabel: '5-year trajectory',
    avgDivisorLabel: 'yr',
  };
}

interface MetricCardConfig {
  metricKey: MetricKey;
  title: string;
  subtitle: string;
  positiveIsGood: boolean;
  strokeLight: string;
  strokeDark: string;
  strokeClass: string;
  dotStrokeClass: string;
  glowFillClass: string;
  textAccentClass: string;
  iconBoxClass: string;
  areaTopOpacity: number;
  showAvgBaseline?: boolean;
  dashedCurve?: boolean;
  icon: React.ReactNode;
}

const CARD_CONFIGS: MetricCardConfig[] = [
  {
    metricKey: 'revenue',
    title: 'Total Revenue',
    subtitle: 'Gross sales inflow',
    positiveIsGood: true,
    strokeLight: '#1E396A',
    strokeDark: '#93C5FD',
    strokeClass: 'stroke-[#1E396A] dark:stroke-[#93C5FD]',
    dotStrokeClass: 'stroke-[#1E396A] dark:stroke-[#93C5FD]',
    glowFillClass: 'fill-[#1E396A]/15 dark:fill-[#93C5FD]/25',
    textAccentClass: 'text-[#1E396A] dark:text-[#93C5FD]',
    iconBoxClass:
      'bg-[#1E396A]/8 dark:bg-[#396BA4]/20 text-[#1E396A] dark:text-[#93C5FD] border-[#1E396A]/15 dark:border-[#396BA4]/30',
    areaTopOpacity: 0.18,
    icon: <Wallet className="h-4 w-4" />,
  },
  {
    metricKey: 'expenses',
    title: 'Total Expenses',
    subtitle: 'Operating & stock outflow',
    positiveIsGood: false,
    strokeLight: '#F05D21',
    strokeDark: '#FF7A45',
    strokeClass: 'stroke-[#F05D21] dark:stroke-[#FF7A45]',
    dotStrokeClass: 'stroke-[#F05D21] dark:stroke-[#FF7A45]',
    glowFillClass: 'fill-[#F05D21]/15 dark:fill-[#FF7A45]/25',
    textAccentClass: 'text-[#F05D21] dark:text-[#FF7A45]',
    iconBoxClass:
      'bg-[#F05D21]/10 dark:bg-[#F05D21]/15 text-[#F05D21] dark:text-[#FF7A45] border-[#F05D21]/20 dark:border-[#F05D21]/30',
    areaTopOpacity: 0.13,
    showAvgBaseline: true,
    icon: <Receipt className="h-4 w-4" />,
  },
  {
    metricKey: 'profit',
    title: 'Net Profit',
    subtitle: 'Bottom-line surplus',
    positiveIsGood: true,
    strokeLight: '#396BA4',
    strokeDark: '#38BDF8',
    strokeClass: 'stroke-[#396BA4] dark:stroke-[#38BDF8]',
    dotStrokeClass: 'stroke-[#396BA4] dark:stroke-[#38BDF8]',
    glowFillClass: 'fill-[#396BA4]/15 dark:fill-[#38BDF8]/25',
    textAccentClass: 'text-[#396BA4] dark:text-[#38BDF8]',
    iconBoxClass:
      'bg-[#396BA4]/10 dark:bg-[#396BA4]/20 text-[#396BA4] dark:text-[#38BDF8] border-[#396BA4]/20 dark:border-[#396BA4]/30',
    areaTopOpacity: 0.2,
    icon: <TrendingUp className="h-4 w-4" />,
  },
];

interface SingleFinanceChartCardProps {
  config: MetricCardConfig;
  period: DatePeriod;
  tenantScope: TenantScope;
  salesDelta: number;
  expensesDelta: number;
}

const SingleFinanceChartCard: React.FC<SingleFinanceChartCardProps> = ({
  config,
  period,
  tenantScope,
  salesDelta,
  expensesDelta,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    setHoveredIdx(null);
  }, [period]);

  const { series, prevTotals, periodLabel, avgDivisorLabel } = useMemo(
    () => getTenantSeriesData(tenantScope, period, salesDelta, expensesDelta),
    [tenantScope, period, salesDelta, expensesDelta]
  );

  const metrics = useMemo(() => {
    const totalRevenue = series.reduce((sum, p) => sum + p.revenue, 0);
    const totalExpenses = series.reduce((sum, p) => sum + p.expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;

    const value =
      config.metricKey === 'revenue'
        ? totalRevenue
        : config.metricKey === 'expenses'
        ? totalExpenses
        : totalProfit;

    const prevValue =
      config.metricKey === 'revenue'
        ? prevTotals.revenue
        : config.metricKey === 'expenses'
        ? prevTotals.expenses
        : prevTotals.profit;

    const pct = calcPctChange(value, prevValue);
    const avg = series.length > 0 ? value / series.length : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return { value, prevValue, pct, avg, profitMargin };
  }, [series, prevTotals, config.metricKey]);

  const pointValues = useMemo(
    () => series.map((p) => p[config.metricKey]),
    [series, config.metricKey]
  );

  const width = 380;
  const height = 186;
  const padLeft = 46;
  const padRight = 14;
  const padTop = 14;
  const padBottom = 26;

  const minVal = Math.min(0, ...pointValues);
  const rawMax = Math.max(100, ...pointValues);
  const maxVal = rawMax * 1.14;
  const valueSpan = Math.max(1, maxVal - minVal);

  const getX = (idx: number) =>
    padLeft + (series.length > 1 ? (idx / (series.length - 1)) * (width - padLeft - padRight) : 0);

  const getY = (val: number) =>
    height - padBottom - ((val - minVal) / valueSpan) * (height - padTop - padBottom);

  const coords = pointValues.map((val, idx) => ({ x: getX(idx), y: getY(val) }));
  const linePath = buildSmoothPath(coords);
  const baselineY = getY(0).toFixed(2);
  const areaPath = `${linePath} L ${getX(series.length - 1).toFixed(
    2
  )} ${baselineY} L ${getX(0).toFixed(2)} ${baselineY} Z`;

  const gridTicks = [0, 0.33, 0.66, 1].map((fraction) => {
    const val = minVal + fraction * valueSpan;
    return { val, y: getY(val) };
  });

  const avgY = getY(metrics.avg);
  const gradId = `finCardGrad-${tenantScope}-${config.metricKey}`;
  const isUp = metrics.pct >= 0;
  const isPositiveOutcome = config.positiveIsGood ? isUp : !isUp;
  const trendColor = isPositiveOutcome
    ? 'text-[#16A34A] dark:text-emerald-400'
    : 'text-[#F05D21] dark:text-[#FF7A45]';

  const safeHoveredIdx = hoveredIdx !== null && hoveredIdx < series.length ? hoveredIdx : null;
  const activePoint = safeHoveredIdx !== null ? series[safeHoveredIdx] : null;
  const activePointVal = activePoint ? activePoint[config.metricKey] : 0;
  const activePointMargin =
    activePoint && activePoint.revenue > 0
      ? (activePoint.profit / activePoint.revenue) * 100
      : 0;

  return (
    <article className="h-full flex flex-col justify-between bg-white dark:bg-[#111B2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_22px_-12px_rgba(30,57,106,0.12)] dark:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.48)] p-4 sm:p-5 transition-shadow duration-200 hover:shadow-[0_2px_6px_rgba(15,23,42,0.05),0_12px_28px_-12px_rgba(30,57,106,0.16)]">
      {/* Top Header + Prominent Figure */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#1E396A] dark:text-white tracking-tight truncate">
              {config.title}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {config.subtitle} · {periodLabel}
            </p>
          </div>
          <div
            className={`h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 ${config.iconBoxClass}`}
            aria-hidden="true"
          >
            {config.icon}
          </div>
        </div>

        <div>
          <p className="text-2xl font-bold tracking-tight text-[#1E396A] dark:text-white tabular-nums leading-none">
            {formatCurrency(metrics.value)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className={`inline-flex items-center gap-0.5 font-semibold tabular-nums ${trendColor}`}>
              {isUp ? (
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
              )}
              {isUp ? '+' : ''}
              {metrics.pct.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {config.metricKey === 'profit'
                ? `${metrics.profitMargin.toFixed(1)}% net margin`
                : `vs ${formatCurrency(metrics.prevValue)} prior`}
            </span>
          </div>
        </div>
      </div>

      {/* Independent Smooth SVG Chart */}
      <div className="relative mt-4 pt-1">
        <svg
          key={`${period}-${config.metricKey}`}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 sm:h-48 overflow-visible select-none"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="currentColor"
                stopOpacity={config.areaTopOpacity}
                className={config.textAccentClass}
              />
              <stop
                offset="100%"
                stopColor="currentColor"
                stopOpacity="0"
                className={config.textAccentClass}
              />
            </linearGradient>
          </defs>

          {/* Minimal Horizontal Gridlines */}
          {gridTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={width - padRight}
                y2={tick.y}
                className="stroke-slate-200/80 dark:stroke-slate-800"
                strokeDasharray={i === 0 ? undefined : '3 4'}
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={tick.y + 3.5}
                textAnchor="end"
                className="fill-slate-400 dark:fill-slate-500 text-[10px] font-medium tabular-nums"
              >
                {formatAxisCurrency(tick.val)}
              </text>
            </g>
          ))}

          {/* Optional Average Threshold Line (distinct visual cue on Expenses) */}
          {config.showAvgBaseline && (
            <line
              x1={padLeft}
              y1={avgY}
              x2={width - padRight}
              y2={avgY}
              className="stroke-[#F05D21]/40 dark:stroke-[#FF7A45]/45"
              strokeDasharray="5 4"
              strokeWidth="1.2"
            />
          )}

          {/* Soft Gradient Area Fill */}
          <path d={areaPath} fill={`url(#${gradId})`} />

          {/* Active Hover Vertical Hairline */}
          {safeHoveredIdx !== null && (
            <line
              x1={getX(safeHoveredIdx)}
              y1={padTop}
              x2={getX(safeHoveredIdx)}
              y2={height - padBottom}
              className="stroke-slate-300 dark:stroke-slate-600"
              strokeDasharray="3 3"
              strokeWidth="1.2"
            />
          )}

          {/* Smooth Line Curve */}
          <path
            d={linePath}
            fill="none"
            className={`${config.strokeClass} transition-all duration-300`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Nodes, X-Axis Labels & Hit Targets */}
          {series.map((pt, idx) => {
            const cx = getX(idx);
            const cy = getY(pt[config.metricKey]);
            const isActive = safeHoveredIdx === idx;
            const colWidth =
              series.length > 1 ? (width - padLeft - padRight) / (series.length - 1) : 60;

            return (
              <g key={pt.label}>
                {isActive && <circle cx={cx} cy={cy} r="8" className={config.glowFillClass} />}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 4.5 : 2.8}
                  className={`fill-white dark:fill-[#111B2E] ${config.dotStrokeClass} transition-all duration-150`}
                  strokeWidth="2.1"
                />
                <text
                  x={cx}
                  y={height - 6}
                  textAnchor="middle"
                  className={`text-[10.5px] tabular-nums transition-colors ${
                    isActive
                      ? 'fill-[#1E396A] dark:fill-white font-bold'
                      : 'fill-slate-500 dark:fill-slate-400 font-medium'
                  }`}
                >
                  {pt.label}
                </text>
                <rect
                  x={cx - colWidth / 2}
                  y={0}
                  width={colWidth}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onClick={() => setHoveredIdx(idx)}
                />
              </g>
            );
          })}
        </svg>

        {/* Interactive Tooltip */}
        {activePoint && safeHoveredIdx !== null && (
          <div
            className={`pointer-events-none absolute top-1 z-20 rounded-xl bg-white/95 dark:bg-[#0D1628]/95 backdrop-blur-md px-3 py-2 text-xs shadow-lg border border-slate-200 dark:border-slate-700 min-w-[144px] ${
              safeHoveredIdx >= Math.ceil(series.length / 2) ? 'right-1' : 'left-10'
            }`}
          >
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {activePoint.fullLabel}
            </p>
            <p className={`mt-0.5 text-sm font-bold tabular-nums ${config.textAccentClass}`}>
              {formatCurrency(activePointVal)}
            </p>
            {config.metricKey === 'profit' && (
              <p className="mt-0.5 text-[10.5px] text-slate-500 dark:text-slate-400 tabular-nums">
                {activePointMargin.toFixed(1)}% point margin
              </p>
            )}
          </div>
        )}
      </div>

      {/* Subtle Financial Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/90 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span>
          Avg per {avgDivisorLabel}:{' '}
          <strong className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
            {formatCurrency(metrics.avg)}
          </strong>
        </span>
        <span className="tabular-nums text-slate-400 dark:text-slate-500">
          Latest: {formatCurrency(pointValues[pointValues.length - 1] ?? 0)}
        </span>
      </div>
    </article>
  );
};

export const FinanceOverviewCard: React.FC<FinanceOverviewCardProps> = ({
  tenantScope,
  liveSalesTotal,
  liveExpensesTotal,
  onViewFinance,
}) => {
  const [period, setPeriod] = useState<DatePeriod>('Monthly');
  const salesDelta = liveSalesTotal - BASELINE_SEED_SALES[tenantScope];
  const expensesDelta = liveExpensesTotal - BASELINE_SEED_EXPENSES[tenantScope];

  return (
    <section aria-label="Finance Overview" className="w-full space-y-3.5">
      {/* Header Row: Title on Left, Single Shared Segmented Filter on Top-Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-0.5">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <h2 className="text-sm sm:text-base font-bold text-[#1E396A] dark:text-white tracking-tight">
            Finance Overview
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {tenantScope === 'pharmacy'
              ? 'Pharmacy revenue, expenses & net profit'
              : 'Pharmaceutical revenue, expenses & net profit'}
          </span>
          {onViewFinance && (
            <button
              type="button"
              onClick={onViewFinance}
              className="text-xs font-semibold text-[#396BA4] dark:text-sky-400 hover:text-[#1E396A] dark:hover:text-sky-300 whitespace-nowrap shrink-0 transition-colors"
            >
              Open Ledger →
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Finance overview shared date filter"
          className="inline-flex self-start sm:self-auto items-center rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-[#111B2E] p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_-8px_rgba(30,57,106,0.14)] dark:shadow-[0_6px_16px_-10px_rgba(0,0,0,0.5)] shrink-0"
        >
          {(['Weekly', 'Monthly', 'Yearly'] as const).map((tab) => {
            const active = period === tab;
            return (
              <button
                key={tab}
                type="button"
                aria-pressed={active}
                onClick={() => setPeriod(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-150 ${
                  active
                    ? 'bg-[#1E396A] dark:bg-[#396BA4] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#1E396A] dark:hover:text-white hover:bg-[#F4F6F9] dark:hover:bg-[#0D1628]/70'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Three Independent Chart Cards in One Horizontal Row (Desktop/Laptop/Tablet) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-5 items-stretch">
        {CARD_CONFIGS.map((config) => (
          <SingleFinanceChartCard
            key={`${tenantScope}-${config.metricKey}`}
            config={config}
            period={period}
            tenantScope={tenantScope}
            salesDelta={salesDelta}
            expensesDelta={expensesDelta}
          />
        ))}
      </div>
    </section>
  );
};

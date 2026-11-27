import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import { AreaTrendChart, SemiCircleGauge, SimpleBarChart } from './Charts';

export const GreetingHeader: React.FC<{
  title: string;
  subtitle: string;
  dateRange: string;
  onDateRangeChange: (val: string) => void;
  filterLabel?: string;
  onFilterClick?: () => void;
}> = ({
  title,
  subtitle,
  dateRange,
  onDateRangeChange,
  filterLabel = 'Filters',
  onFilterClick,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#1E396A] dark:text-white tracking-tight">
        {title}
      </h1>
      <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>
    </div>

    <div className="flex items-center gap-2.5">
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200">
        <Calendar className="h-3.5 w-3.5 text-slate-400" />
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="bg-transparent focus:outline-none cursor-pointer dark:text-slate-200"
        >
          <option value="Nov 19 – Nov 26, 2026">Nov 19 – Nov 26, 2026</option>
          <option value="Nov 01 – Nov 26, 2026">Nov 01 – Nov 26, 2026</option>
          <option value="Q4 2026 (Oct – Nov)">Q4 2026 (Oct – Nov)</option>
        </select>
      </div>

      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-700 hover:border-[#396BA4] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
        >
          <Filter className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          {filterLabel}
        </button>
      )}
    </div>
  </div>
);

export interface PipelineStage {
  id: string;
  title: string;
  countLabel: string;
  metricLabel: string;
  color: string;
  items: {
    id: string;
    name: string;
    value: string;
    initial: string;
    onClick?: () => void;
  }[];
  moreCount?: number;
}

export const PipelineCard: React.FC<{
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  stages: PipelineStage[];
}> = ({ title, actionLabel = 'View All', onAction, stages }) => (
  <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between h-full">
    <div className="flex items-center justify-between gap-2 mb-4">
      <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">{title}</h2>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-semibold text-[#396BA4] dark:text-sky-400 hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
      {stages.map((stage) => (
        <div key={stage.id} className="flex flex-col">
          {/* Chevron-styled Header */}
          <div
            className="rounded-lg px-3 py-2 text-white"
            style={{ backgroundColor: stage.color }}
          >
            <p className="text-xs font-bold truncate">{stage.title}</p>
            <p className="text-[11px] opacity-90 truncate">{stage.countLabel}</p>
          </div>

          <div className="py-2 px-1 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-[#1E396A] dark:text-slate-100 tabular-nums">
              {stage.metricLabel}
            </p>
          </div>

          <div className="pt-2 space-y-2 flex-1">
            {stage.items.length === 0 ? (
              <p className="text-[11px] text-slate-400 px-1 py-2">No items</p>
            ) : (
              stage.items.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className="w-full text-left px-1.5 py-1.5 rounded-lg hover:bg-[#F4F6F9] dark:hover:bg-slate-800/70 flex items-center gap-2 transition-colors"
                >
                  <span
                    className="h-6 w-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                    style={{ backgroundColor: stage.color }}
                  >
                    {item.initial}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums truncate">
                      {item.value}
                    </p>
                  </div>
                </button>
              ))
            )}

            {typeof stage.moreCount === 'number' && stage.moreCount > 0 && (
              <p className="px-1.5 pt-0.5 text-[11px] font-medium text-slate-400 tabular-nums">
                +{stage.moreCount} more
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const TargetProgressCard: React.FC<{
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  targetLabel: string;
  targetValue: string;
  achievedValue: string;
  remainingValue: string;
  percentage: number;
  gaugeCaption: string;
  bars: { label: string; value: number }[];
}> = ({
  title,
  actionLabel = 'View Report',
  onAction,
  targetLabel,
  targetValue,
  achievedValue,
  remainingValue,
  percentage,
  gaugeCaption,
  bars,
}) => (
  <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4">
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">{title}</h2>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-semibold text-[#396BA4] dark:text-sky-400 hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>

    <div className="grid grid-cols-12 gap-3 items-center">
      <div className="col-span-5 space-y-2.5 text-xs">
        <div>
          <p className="text-slate-500 dark:text-slate-400">{targetLabel}</p>
          <p className="text-base font-bold text-[#1E396A] dark:text-white tabular-nums">
            {targetValue}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Achieved</p>
          <p className="text-sm font-bold text-[#16A34A] dark:text-emerald-400 tabular-nums">
            {achievedValue}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Remaining</p>
          <p className="text-sm font-bold text-[#F05D21] dark:text-[#FF7A45] tabular-nums">
            {remainingValue}
          </p>
        </div>
      </div>

      <div className="col-span-7 flex justify-center">
        <SemiCircleGauge
          percentage={percentage}
          caption={gaugeCaption}
          accentColor="#396BA4"
        />
      </div>
    </div>

    <SimpleBarChart
      data={bars}
      height={115}
      primaryColor="#396BA4"
      primaryLabel="Monthly"
    />
  </div>
);

export const LeaderboardCard: React.FC<{
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  rows: {
    id: string;
    name: string;
    valueText: string;
    percent: number;
    color?: string;
  }[];
}> = ({ title, actionLabel = 'View All', onAction, rows }) => (
  <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
    <div className="flex items-center justify-between gap-2 mb-4">
      <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">{title}</h2>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-semibold text-[#396BA4] dark:text-sky-400 hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>

    <div className="space-y-3.5">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-3 text-xs">
          <div className="h-7 w-7 rounded-full bg-[#1E396A] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {row.name
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0])
              .join('')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                {row.name}
              </span>
              <span className="font-bold text-[#1E396A] dark:text-sky-300 tabular-nums shrink-0">
                {row.valueText}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#F4F6F9] dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(8, Math.min(100, row.percent))}%`,
                  backgroundColor: row.color || '#396BA4',
                }}
              />
            </div>
          </div>
          <span className="w-9 text-right text-[11px] text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
            {row.percent}%
          </span>
        </div>
      ))}
    </div>
  </div>
);

export const RemindersCard: React.FC<{
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  items: {
    id: string;
    timeLabel: string;
    name: string;
    detail: string;
    icon: React.ReactNode;
    accentBg?: string;
    onClick?: () => void;
  }[];
}> = ({ title, actionLabel = 'View All', onAction, items }) => (
  <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
    <div className="flex items-center justify-between gap-2 mb-4">
      <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">{title}</h2>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-semibold text-[#396BA4] dark:text-sky-400 hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>

    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((item) => (
        <div
          key={item.id}
          className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
        >
          <span className="w-16 text-[11px] font-semibold text-[#F05D21] dark:text-[#FF7A45] tabular-nums shrink-0">
            {item.timeLabel}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {item.name}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {item.detail}
            </p>
          </div>
          <button
            type="button"
            onClick={item.onClick}
            className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
              item.accentBg || 'bg-[#F4F6F9] dark:bg-slate-800 text-[#1E396A] dark:text-sky-300'
            }`}
          >
            {item.icon}
          </button>
        </div>
      ))}
    </div>
  </div>
);

export const ActivityTimelineCard: React.FC<{
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  events: {
    id: string;
    title: string;
    subtitle: string;
    time: string;
    icon: React.ReactNode;
    color: string;
  }[];
}> = ({ title, actionLabel = 'View All', onAction, events }) => (
  <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5">
    <div className="flex items-center justify-between gap-2 mb-6">
      <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">{title}</h2>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-semibold text-[#396BA4] dark:text-sky-400 hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>

    <div className="relative grid grid-cols-2 sm:grid-cols-5 gap-4">
      <div className="hidden sm:block absolute top-5 left-8 right-8 h-0.5 bg-slate-200 dark:bg-slate-700" />
      {events.slice(0, 5).map((ev) => (
        <div key={ev.id} className="relative flex flex-col items-center text-center">
          <div
            className="h-10 w-10 rounded-full text-white flex items-center justify-center z-10 shadow-xs"
            style={{ backgroundColor: ev.color }}
          >
            {ev.icon}
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
            {ev.title}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
            {ev.subtitle}
          </p>
          <p className="mt-1 text-[10px] text-slate-400 tabular-nums">{ev.time}</p>
        </div>
      ))}
    </div>
  </div>
);

export const ForecastCard: React.FC<{
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  primaryLabel: string;
  primaryValue: string;
  trendText: string;
  secondaryLabel: string;
  secondaryValue: string;
  tertiaryLabel: string;
  tertiaryValue: string;
  points: { label: string; value: number }[];
  badgeText: string;
}> = ({
  title,
  actionLabel = 'View Report',
  onAction,
  primaryLabel,
  primaryValue,
  trendText,
  secondaryLabel,
  secondaryValue,
  tertiaryLabel,
  tertiaryValue,
  points,
  badgeText,
}) => (
  <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5">
    <div className="flex items-center justify-between gap-2 mb-4">
      <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">{title}</h2>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-semibold text-[#396BA4] dark:text-sky-400 hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>

    <div className="grid grid-cols-12 gap-4 items-center">
      <div className="col-span-12 sm:col-span-4 space-y-3 text-xs">
        <div>
          <p className="text-slate-500 dark:text-slate-400">{primaryLabel}</p>
          <p className="text-lg font-bold text-[#1E396A] dark:text-white tabular-nums">
            {primaryValue}
          </p>
          <p className="text-[11px] font-medium text-[#16A34A] dark:text-emerald-400">
            {trendText}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">{secondaryLabel}</p>
          <p className="text-sm font-bold text-[#396BA4] dark:text-sky-300 tabular-nums">
            {secondaryValue}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">{tertiaryLabel}</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums">
            {tertiaryValue}
          </p>
        </div>
      </div>

      <div className="col-span-12 sm:col-span-8">
        <AreaTrendChart points={points} badgeText={badgeText} />
      </div>
    </div>
  </div>
);

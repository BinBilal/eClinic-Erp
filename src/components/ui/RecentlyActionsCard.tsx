import React from 'react';
import {
  Activity,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  KeyRound,
  Package,
  Receipt,
  ShieldAlert,
  ShoppingCart,
  Trash2,
  Truck,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { AuditLogRecord } from '../../types/erp';

interface RecentlyActionsCardProps {
  title?: string;
  subtitle?: string;
  activities: AuditLogRecord[];
  maxItems?: number;
  viewAllLabel?: string;
  onViewAll?: () => void;
}

function getActionMeta(log: AuditLogRecord) {
  const action = log.action.toUpperCase();
  const status = log.status;

  let icon = <Activity className="h-4 w-4" />;
  if (action.includes('APPROVE') || action.includes('VERIFY')) {
    icon = <CheckCircle2 className="h-4 w-4" />;
  } else if (action.includes('REJECT')) {
    icon = <XCircle className="h-4 w-4" />;
  } else if (action.includes('SUSPEND')) {
    icon = <ShieldAlert className="h-4 w-4" />;
  } else if (action.includes('DELETE') || action.includes('ARCHIVE')) {
    icon = <Trash2 className="h-4 w-4" />;
  } else if (action.includes('TENANT')) {
    icon = <Building2 className="h-4 w-4" />;
  } else if (action.includes('ACCOUNT') || action.includes('PASSWORD')) {
    icon = <KeyRound className="h-4 w-4" />;
  } else if (action.includes('SALE') || action.includes('POS')) {
    icon = <ShoppingCart className="h-4 w-4" />;
  } else if (action.includes('PRODUCT')) {
    icon = <Package className="h-4 w-4" />;
  } else if (action.includes('STOCK') || action.includes('BATCH')) {
    icon = <Boxes className="h-4 w-4" />;
  } else if (action.includes('CUSTOMER')) {
    icon = <UserPlus className="h-4 w-4" />;
  } else if (action.includes('PURCHASE')) {
    icon = <ClipboardList className="h-4 w-4" />;
  } else if (action.includes('SUPPLIER')) {
    icon = <Truck className="h-4 w-4" />;
  } else if (action.includes('EXPENSE')) {
    icon = <Receipt className="h-4 w-4" />;
  } else if (action.includes('LAB') || action.includes('PATIENT')) {
    icon = <FlaskConical className="h-4 w-4" />;
  }

  let toneClasses =
    'bg-[#F4F6F9] dark:bg-slate-800/80 text-[#396BA4] dark:text-sky-300 border-slate-200/80 dark:border-slate-700';
  let dotClass = 'bg-[#396BA4]';
  let statusText = 'Recorded';

  if (status === 'success' || action.includes('APPROVE') || action.includes('CREATE_TENANT') || action.includes('COMPLETE_POS')) {
    toneClasses =
      'bg-emerald-50 dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-900/60';
    dotClass = 'bg-[#16A34A]';
    statusText = 'Completed';
  } else if (status === 'warning' || action.includes('SUSPEND') || action.includes('ARCHIVE')) {
    toneClasses =
      'bg-amber-50 dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 border-amber-200/70 dark:border-amber-900/60';
    dotClass = 'bg-[#D97706]';
    statusText = action.includes('SUSPEND') ? 'Restricted' : 'Updated';
  } else if (status === 'danger' || action.includes('REJECT') || action.includes('DELETE')) {
    toneClasses =
      'bg-red-50 dark:bg-red-950/60 text-[#DC2626] dark:text-red-400 border-red-200/70 dark:border-red-900/60';
    dotClass = 'bg-[#DC2626]';
    statusText = action.includes('REJECT') ? 'Rejected' : 'Removed';
  } else if (action.includes('EXPENSE') || action.includes('PURCHASE')) {
    toneClasses =
      'bg-orange-50 dark:bg-orange-950/50 text-[#F05D21] dark:text-[#FF7A45] border-orange-200/70 dark:border-orange-900/60';
    dotClass = 'bg-[#F05D21]';
    statusText = 'Recorded';
  }

  return { icon, toneClasses, dotClass, statusText };
}

export const RecentlyActionsCard: React.FC<RecentlyActionsCardProps> = ({
  title = 'Recently Actions',
  subtitle = 'Latest chronological operations within this workspace',
  activities,
  maxItems = 6,
  viewAllLabel = 'View All',
  onViewAll,
}) => {
  const sorted = [...activities]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, maxItems);

  return (
    <div className="bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#1E396A] dark:text-white">{title}</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-[#396BA4] dark:text-sky-400 hover:underline shrink-0"
          >
            {viewAllLabel}
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
          No recent actions recorded yet for this workspace.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/90">
          {sorted.map((item) => {
            const meta = getActionMeta(item);
            const [datePart, timePart] = item.timestamp.split(' ');
            const moduleLabel = item.module || item.resource;

            return (
              <div
                key={item.id}
                className="py-3 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${meta.toneClasses}`}
                  >
                    {meta.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {item.description}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.actor}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {moduleLabel}
                        {item.resourceId ? (
                          <span className="font-mono text-[#1E396A] dark:text-sky-300 ml-1">
                            ({item.resourceId})
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 pl-12 sm:pl-0 shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
                    {meta.statusText}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums whitespace-nowrap">
                    {datePart}
                    {timePart ? ` · ${timePart}` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  XCircle,
} from 'lucide-react';

export type SemanticTone = 'success' | 'warning' | 'error' | 'pending' | 'info' | 'neutral';

interface StatusLabelProps {
  label: string;
  tone?: SemanticTone;
}

const TONE_MAP: Record<
  SemanticTone,
  { text: string; icon: React.ReactNode }
> = {
  success: {
    text: 'text-[#16A34A] dark:text-emerald-400',
    icon: <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#16A34A] dark:text-emerald-400" />,
  },
  warning: {
    text: 'text-[#D97706] dark:text-amber-400',
    icon: <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#D97706] dark:text-amber-400" />,
  },
  error: {
    text: 'text-[#DC2626] dark:text-red-400',
    icon: <XCircle className="h-3.5 w-3.5 shrink-0 text-[#DC2626] dark:text-red-400" />,
  },
  pending: {
    text: 'text-[#D97706] dark:text-amber-400',
    icon: <Clock className="h-3.5 w-3.5 shrink-0 text-[#D97706] dark:text-amber-400" />,
  },
  info: {
    text: 'text-[#396BA4] dark:text-sky-400',
    icon: <Info className="h-3.5 w-3.5 shrink-0 text-[#396BA4] dark:text-sky-400" />,
  },
  neutral: {
    text: 'text-slate-600 dark:text-slate-300',
    icon: <Info className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-400" />,
  },
};

export function inferTone(status: string): SemanticTone {
  const s = status.toLowerCase();
  if (
    s.includes('approved') ||
    s.includes('active') ||
    s.includes('paid') ||
    s.includes('answered') ||
    s.includes('delivered') ||
    s.includes('valid') ||
    s.includes('received')
  ) {
    return 'success';
  }
  if (
    s.includes('rejected') ||
    s.includes('suspended') ||
    s.includes('expired') ||
    s.includes('failed') ||
    s.includes('locked') ||
    s.includes('unpaid') ||
    s.includes('out of stock')
  ) {
    return 'error';
  }
  if (s.includes('near') || s.includes('low') || s.includes('partial')) {
    return 'warning';
  }
  if (s.includes('pending') || s.includes('submitted')) {
    return 'pending';
  }
  if (s.includes('review')) {
    return 'info';
  }
  return 'neutral';
}

export const StatusLabel: React.FC<StatusLabelProps> = ({ label, tone }) => {
  const resolvedTone = tone || inferTone(label);
  const style = TONE_MAP[resolvedTone];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${style.text}`}>
      {style.icon}
      <span>{label}</span>
    </span>
  );
};

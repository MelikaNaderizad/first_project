import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { toPersianDigits, formatPersianNumber } from '../../utils/formatters';

export type KpiVariant = 'standard' | 'progress' | 'sparkline' | 'comparison' | 'badge-highlight';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  variant?: KpiVariant;
  progressPercent?: number;
  progressColor?: string;
  secondaryValue?: string;
  secondaryLabel?: string;
  sparklineData?: number[];
  badge?: string;
  accentColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconBg = 'bg-slate-100',
  iconColor = 'text-slate-700',
  variant = 'standard',
  progressPercent,
  progressColor = 'bg-indigo-600',
  secondaryValue,
  secondaryLabel,
  badge,
}) => {
  const isNumber = typeof value === 'number';
  const displayValue = isNumber ? formatPersianNumber(value) : toPersianDigits(value);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-slate-200/80 transition-all duration-300">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div
              className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center transition-transform group-hover:scale-105 shrink-0`}
            >
              <Icon size={18} strokeWidth={2.2} />
            </div>
          )}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 tracking-normal">{title}</h3>
            {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {badge && (
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {badge}
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline justify-between gap-2 mt-1">
        <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-tabular">
          {displayValue}
        </div>

        {change && (
          <div
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
              changeType === 'positive'
                ? 'text-emerald-700 bg-emerald-50'
                : changeType === 'negative'
                ? 'text-rose-700 bg-rose-50'
                : 'text-slate-600 bg-slate-100'
            }`}
          >
            {changeType === 'positive' ? (
              <TrendingUp size={13} />
            ) : changeType === 'negative' ? (
              <TrendingDown size={13} />
            ) : (
              <Minus size={13} />
            )}
            <span className="font-tabular">{toPersianDigits(change)}</span>
          </div>
        )}
      </div>

      {/* Variant: Progress Bar */}
      {variant === 'progress' && progressPercent !== undefined && (
        <div className="mt-4 pt-2 border-t border-slate-50">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5 font-medium">
            <span>نسبت سهم</span>
            <span className="font-semibold text-slate-800 font-tabular">
              {toPersianDigits(progressPercent.toFixed(1))}٪
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressColor} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      )}

      {/* Variant: Comparison */}
      {variant === 'comparison' && secondaryValue && secondaryLabel && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{secondaryLabel}</span>
          <span className="font-bold text-slate-800 font-tabular">{toPersianDigits(secondaryValue)}</span>
        </div>
      )}
    </div>
  );
};

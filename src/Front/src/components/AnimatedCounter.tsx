import React, { useEffect, useState } from 'react';
import { formatNumber, toPersianDigits } from '../utils/formatters';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatWithCommas?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1400,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  formatWithCommas = true,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = value;

    if (endValue === 0) {
      setDisplayValue(0);
      return;
    }

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutExpo function for a very smooth deceleration
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  const formattedNumber = decimals > 0
    ? toPersianDigits(displayValue.toFixed(decimals))
    : formatWithCommas
    ? formatNumber(Math.round(displayValue))
    : toPersianDigits(Math.round(displayValue));

  return (
    <span className={`inline-block font-mono tracking-tight ${className}`}>
      {prefix && <span className="mr-0.5">{prefix}</span>}
      {formattedNumber}
      {suffix && <span className="ml-1 text-sm font-normal">{suffix}</span>}
    </span>
  );
};

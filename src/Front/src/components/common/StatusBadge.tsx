import React from 'react';

interface StatusBadgeProps {
  status: 'successful' | 'unsuccessful' | 'neutral' | 'insufficient_data' | 'recommended' | 'not_recommended' | 'no_idea' | 'positive' | 'negative' | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  let style = 'bg-[#F1E7E7] text-[#5B4852] border-[#E69DB8]/30';
  let defaultText = label || status;
  let dotColor = 'bg-[#8C4E65]';

  if (status === 'successful' || status === 'positive' || status === 'recommended') {
    // Theme-harmonized warm cream / sage for success/positive/recommended
    style = 'bg-[#FFFECE] text-[#2B543B] border-[#BEDDC7]';
    defaultText = label || (status === 'successful' ? 'موفق' : status === 'recommended' ? 'پیشنهاد شده' : 'مثبت');
    dotColor = 'bg-[#3D704E]';
  } else if (status === 'unsuccessful' || status === 'negative' || status === 'not_recommended') {
    // Theme-harmonized warm berry / blush for unsuccessful/negative/not_recommended
    style = 'bg-[#FFD0C7]/50 text-[#8A253A] border-[#E69DB8]/60';
    defaultText = label || (status === 'unsuccessful' ? 'ناموفق' : status === 'not_recommended' ? 'پیشنهاد نشده' : 'منفی');
    dotColor = 'bg-[#B03A53]';
  } else if (status === 'neutral' || status === 'no_idea') {
    style = 'bg-[#F1E7E7] text-[#6B535F] border-[#E69DB8]/30';
    defaultText = label || (status === 'no_idea' ? 'بدون نظر' : 'خنثی / متوسط');
    dotColor = 'bg-[#8C4E65]';
  } else if (status === 'insufficient_data') {
    style = 'bg-[#F1E7E7]/60 text-[#7A6670] border-[#E69DB8]/20';
    defaultText = label || 'داده ناکافی';
    dotColor = 'bg-[#A3929B]';
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5 gap-1.5' : 'text-xs font-semibold px-3 py-1 gap-2';

  return (
    <span
      className={`inline-flex items-center rounded-full border whitespace-nowrap transition-colors duration-150 ${style} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{defaultText}</span>
    </span>
  );
};


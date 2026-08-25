import React from 'react';
import { ShieldCheck, Sparkles, Server } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-10 pt-4 pb-6 border-t border-white/[0.06] text-xs text-[#B9AEB4]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="font-semibold text-[#F8F4F6]">داشبورد تحلیلی دیجی‌کالا</span>
          <span>•</span>
          <span className="text-[11px] text-[#B9AEB4] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FFB7D1]" />
            تم اختصاصی Icy Cherry Dark
          </span>
          <span>•</span>
          <span className="font-mono text-[11px] text-[#FFB7D1]">نسخه ۱.۴.۲</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-[#00D26A]">
            <Server className="w-3.5 h-3.5" />
            خوشه سرور تهران (Tehran-DC1)
          </span>
          <span className="flex items-center gap-1.5 text-[#B9AEB4]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00D26A]" />
            امنیت داده TLS ۱.۳
          </span>
        </div>
      </div>
    </footer>
  );
};

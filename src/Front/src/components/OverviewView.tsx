import React from 'react';
import {
  Users,
  MessageSquare,
  Package,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { KPISummary } from '../types';
import { formatNumber, toPersianDigits } from '../utils/formatters';
import { AnimatedCounter } from './AnimatedCounter';
import {
  mockCategoryBreakdown,
  mockMonthlyTrend,
} from '../data/mockData';

interface OverviewViewProps {
  kpi: KPISummary;
  onNavigateToComments?: () => void;
  onNavigateToProducts: () => void;
  onNavigateToSellers: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  kpi,
  onNavigateToComments,
  onNavigateToProducts,
  onNavigateToSellers,
}) => {
  // Math proportions for Box 1 (Comments)
  const totalComments = kpi.total_comments || 1;
  const positiveCommentPct = ((kpi.positive_comments / totalComments) * 100).toFixed(1);
  const negativeCommentPct = ((kpi.negative_comments / totalComments) * 100).toFixed(1);
  const neutralCommentPct = (((kpi.neutral_comments || (totalComments - kpi.positive_comments - kpi.negative_comments)) / totalComments) * 100).toFixed(1);

  const commentsDonutData = [
    { name: 'نظرات مثبت', value: kpi.positive_comments, color: '#D5D5D5' },
    { name: 'نظرات منفی', value: kpi.negative_comments, color: '#7A1837' },
    { name: 'نظرات خنثی', value: kpi.neutral_comments || 0, color: '#4A4A4A' },
  ];

  // Math proportions for Box 2 (Sellers)
  const totalSellers = kpi.total_sellers || 1;
  const successfulSellerPct = ((kpi.successful_sellers / totalSellers) * 100).toFixed(1);
  const unsuccessfulSellerPct = ((kpi.unsuccessful_sellers / totalSellers) * 100).toFixed(1);
  const neutralSellerPct = ((kpi.neutral_sellers / totalSellers) * 100).toFixed(1);
  const insufficientSellerPct = ((kpi.insufficient_sellers / totalSellers) * 100).toFixed(1);

  const sellersDonutData = [
    { name: 'فروشندگان موفق', value: kpi.successful_sellers, color: '#00D26A' },
    { name: 'فروشندگان ناموفق', value: kpi.unsuccessful_sellers, color: '#520B24' },
    { name: 'فروشندگان خنثی', value: kpi.neutral_sellers || 0, color: '#8A8A8A' },
    { name: 'داده ناکافی', value: kpi.insufficient_sellers || 0, color: '#242424' },
  ];

  // Math proportions for Box 3 (Products)
  const totalProducts = kpi.total_products || 1;
  const successfulProductPct = ((kpi.successful_products / totalProducts) * 100).toFixed(1);
  const unsuccessfulProductPct = ((kpi.unsuccessful_products / totalProducts) * 100).toFixed(1);
  const neutralProductPct = ((kpi.neutral_products / totalProducts) * 100).toFixed(1);
  const insufficientProductPct = ((kpi.insufficient_products / totalProducts) * 100).toFixed(1);

  const productsDonutData = [
    { name: 'کالاهای موفق', value: kpi.successful_products, color: '#E8E8E8' },
    { name: 'کالاهای ناموفق', value: kpi.unsuccessful_products, color: '#68132F' },
    { name: 'کالاهای خنثی', value: kpi.neutral_products || 0, color: '#8A8A8A' },
    { name: 'داده ناکافی', value: kpi.insufficient_products || 0, color: '#242424' },
  ];

  // Custom Editorial Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="p-3 rounded-xl bg-[#101010]/95 border border-white/[0.15] shadow-2xl backdrop-blur-xl text-right text-xs space-y-1">
          <p className="font-semibold text-[#FFFFFF] font-editorial-sans">
            {data.name || data.payload.category || data.payload.month}
          </p>
          <div className="flex items-center gap-2 text-[#B8B8B8] font-mono-data">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: data.color || '#D5D5D5' }}
            />
            <span>مقدار: <strong className="text-[#FFFFFF]">{formatNumber(data.value)}</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* ========================================================
          EDITORIAL 3-COLUMN MATRIX
          ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D26A] shadow-[0_0_8px_#00D26A]" />
            <h2 className="text-xs font-bold text-[#E8E8E8] font-editorial-sans">
              ماتریس شاخص‌های کلیدی عملکرد دیجی‌کالا
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ----------------- BOX 1: کامنت‌ها ----------------- */}
          <div
            id="hero-box-comments"
            onClick={onNavigateToComments}
            className="glass-card glass-card-hover p-6 relative overflow-hidden flex flex-col justify-between cursor-pointer group"
          >
            <div className="chrome-top-edge" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B0718]/25 rounded-full filter blur-3xl pointer-events-none" />

            {/* Top Index & Title */}
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <h3 className="text-base md:text-lg font-bold text-[#FFFFFF] flex items-center gap-2 font-editorial-sans">
                  کامنت‌ها و نظرات
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#8A8A8A] group-hover:text-[#FFFFFF] transition-colors" />
                </h3>
                <p className="text-[11px] text-[#8A8A8A]">نسبت کامنت‌های مثبت به منفی</p>
              </div>

              <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#D5D5D5] group-hover:border-white/[0.2] transition-colors">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>

            {/* Sculptural Metric Number & Minimal Donut */}
            <div className="my-5 flex items-center justify-between gap-4 relative z-10">
              <div className="space-y-0.5">
                <div className="font-editorial-serif text-3xl md:text-4xl font-bold text-[#FFFFFF] tracking-tight">
                  <AnimatedCounter value={kpi.total_comments} />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#B8B8B8]">
                  <span className="font-semibold text-[#00D26A] font-mono-data">{toPersianDigits(positiveCommentPct)}٪</span>
                  <span>رضایت کل خریداران</span>
                </div>
              </div>

              {/* Minimal Donut Chart */}
              <div className="w-20 h-20 shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={commentsDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={22}
                      outerRadius={34}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {commentsDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#101010" strokeWidth={1} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hairline Progress & Breakdown */}
            <div className="space-y-2 pt-3 border-t border-white/[0.06] relative z-10">
              <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden flex">
                <div
                  style={{ width: `${positiveCommentPct}%` }}
                  className="h-full bg-[#D5D5D5]"
                  title={`مثبت: ${positiveCommentPct}٪`}
                />
                <div
                  style={{ width: `${negativeCommentPct}%` }}
                  className="h-full bg-[#68132F]"
                  title={`منفی: ${negativeCommentPct}٪`}
                />
                <div
                  style={{ width: `${neutralCommentPct}%` }}
                  className="h-full bg-[#4A4A4A]"
                  title={`خنثی: ${neutralCommentPct}٪`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono-data">
                <div className="flex items-center gap-1 text-[#D5D5D5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D5D5D5]" />
                  <span>مثبت: <strong>{toPersianDigits(positiveCommentPct)}٪</strong></span>
                </div>
                <div className="flex items-center gap-1 text-[#CFAEB8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#68132F]" />
                  <span>منفی: <strong>{toPersianDigits(negativeCommentPct)}٪</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------- BOX 2: فروشندگان ----------------- */}
          <div
            id="hero-box-sellers"
            onClick={onNavigateToSellers}
            className="glass-card glass-card-hover p-6 relative overflow-hidden flex flex-col justify-between cursor-pointer group"
          >
            <div className="chrome-top-edge" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#520B24]/15 rounded-full filter blur-3xl pointer-events-none" />

            {/* Top Index & Title */}
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <h3 className="text-base md:text-lg font-bold text-[#FFFFFF] flex items-center gap-2 font-editorial-sans">
                  فروشندگان و تامین‌کنندگان
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#8A8A8A] group-hover:text-[#FFFFFF] transition-colors" />
                </h3>
                <p className="text-[11px] text-[#8A8A8A]">نسبت فروشندگان موفق به ناموفق</p>
              </div>

              <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#D5D5D5] group-hover:border-white/[0.2] transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>

            {/* Sculptural Metric Number & Minimal Donut */}
            <div className="my-5 flex items-center justify-between gap-4 relative z-10">
              <div className="space-y-0.5">
                <div className="font-editorial-serif text-3xl md:text-4xl font-bold text-[#FFFFFF] tracking-tight">
                  <AnimatedCounter value={kpi.total_sellers} />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#B8B8B8]">
                  <span className="font-semibold text-[#00D26A] font-mono-data">{toPersianDigits(successfulSellerPct)}٪</span>
                  <span>فروشندگان موفق</span>
                </div>
              </div>

              {/* Minimal Donut Chart */}
              <div className="w-20 h-20 shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sellersDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={22}
                      outerRadius={34}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {sellersDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#101010" strokeWidth={1} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hairline Progress & Sub-values */}
            <div className="space-y-2 pt-3 border-t border-white/[0.06] relative z-10">
              <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden flex">
                <div
                  style={{ width: `${successfulSellerPct}%` }}
                  className="h-full bg-[#00D26A]"
                  title={`موفق: ${successfulSellerPct}٪`}
                />
                <div
                  style={{ width: `${unsuccessfulSellerPct}%` }}
                  className="h-full bg-[#520B24]"
                  title={`ناموفق: ${unsuccessfulSellerPct}٪`}
                />
                <div
                  style={{ width: `${neutralSellerPct}%` }}
                  className="h-full bg-[#8A8A8A]"
                  title={`خنثی: ${neutralSellerPct}٪`}
                />
                <div
                  style={{ width: `${insufficientSellerPct}%` }}
                  className="h-full bg-[#242424]"
                  title={`ناکافی: ${insufficientSellerPct}٪`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono-data text-[#8A8A8A]">
                <span>فروشنده موفق: <strong className="text-[#00D26A]">{formatNumber(kpi.successful_sellers)}</strong></span>
                <span>ناموفق: <strong className="text-[#CFAEB8]">{formatNumber(kpi.unsuccessful_sellers)}</strong></span>
              </div>
            </div>
          </div>

          {/* ----------------- BOX 3: کالاها ----------------- */}
          <div
            id="hero-box-products"
            onClick={onNavigateToProducts}
            className="glass-card glass-card-hover p-6 relative overflow-hidden flex flex-col justify-between cursor-pointer group"
          >
            <div className="chrome-top-edge" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B0718]/25 rounded-full filter blur-3xl pointer-events-none" />

            {/* Top Index & Title */}
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <h3 className="text-base md:text-lg font-bold text-[#FFFFFF] flex items-center gap-2 font-editorial-sans">
                  محصولات و کاتالوگ
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#8A8A8A] group-hover:text-[#FFFFFF] transition-colors" />
                </h3>
                <p className="text-[11px] text-[#8A8A8A]">نسبت کالاهای موفق به ناموفق</p>
              </div>

              <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#D5D5D5] group-hover:border-white/[0.2] transition-colors">
                <Package className="w-4 h-4" />
              </div>
            </div>

            {/* Sculptural Metric Number & Minimal Donut */}
            <div className="my-5 flex items-center justify-between gap-4 relative z-10">
              <div className="space-y-0.5">
                <div className="font-editorial-serif text-3xl md:text-4xl font-bold text-[#FFFFFF] tracking-tight">
                  <AnimatedCounter value={kpi.total_products} />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#B8B8B8]">
                  <span className="font-semibold text-[#00D26A] font-mono-data">{toPersianDigits(successfulProductPct)}٪</span>
                  <span>کالاهای موفق و تاییدشده</span>
                </div>
              </div>

              {/* Minimal Donut Chart */}
              <div className="w-20 h-20 shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productsDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={22}
                      outerRadius={34}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {productsDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#101010" strokeWidth={1} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hairline Progress & Sub-values */}
            <div className="space-y-2 pt-3 border-t border-white/[0.06] relative z-10">
              <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden flex">
                <div
                  style={{ width: `${successfulProductPct}%` }}
                  className="h-full bg-[#E8E8E8]"
                  title={`موفق: ${successfulProductPct}٪`}
                />
                <div
                  style={{ width: `${unsuccessfulProductPct}%` }}
                  className="h-full bg-[#68132F]"
                  title={`ناموفق: ${unsuccessfulProductPct}٪`}
                />
                <div
                  style={{ width: `${neutralProductPct}%` }}
                  className="h-full bg-[#8A8A8A]"
                  title={`خنثی: ${neutralProductPct}٪`}
                />
                <div
                  style={{ width: `${insufficientProductPct}%` }}
                  className="h-full bg-[#242424]"
                  title={`ناکافی: ${insufficientProductPct}٪`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono-data text-[#8A8A8A]">
                <span>کالای موفق: <strong className="text-[#FFFFFF]">{formatNumber(kpi.successful_products)}</strong></span>
                <span>ناموفق: <strong className="text-[#CFAEB8]">{formatNumber(kpi.unsuccessful_products)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          DATA VISUALIZATION: EDITORIAL AREA CHART & CATEGORIES
          ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (Silver & Dark Cherry Tone) */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4 relative overflow-hidden">
          <div className="chrome-top-edge" />
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#D5D5D5]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm md:text-base text-[#FFFFFF] font-editorial-sans">
                  روند ماهانه احساسات نظرات و شاخص سلامت
                </h3>
                <p className="text-xs text-[#8A8A8A]">تحلیل ۶ ماه اخیر</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#00D26A]/15 border border-[#00D26A]/30 text-[#00D26A]">
              +۸۶.۲٪ کل
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockMonthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cherryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#68132F" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B0718" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="silverGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D5D5D5" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#D5D5D5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
                <XAxis dataKey="month" stroke="#8A8A8A" tick={{ fill: '#8A8A8A', fontSize: 11, fontFamily: 'Vazirmatn' }} />
                <YAxis stroke="#8A8A8A" tick={{ fill: '#8A8A8A', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => `${toPersianDigits(v / 1000)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="positive"
                  name="نظرات مثبت"
                  stroke="#D5D5D5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#silverGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="negative"
                  name="نظرات منفی"
                  stroke="#7A1837"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#cherryGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card p-6 space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="chrome-top-edge" />
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#D5D5D5]">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm md:text-base text-[#FFFFFF] font-editorial-sans">توزیع دسته‌ها</h3>
                <p className="text-xs text-[#8A8A8A]">حجم کاتالوگ محصولات</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 my-auto">
            {mockCategoryBreakdown.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#E8E8E8]">{cat.category}</span>
                  <span className="text-[#D5D5D5] font-mono-data">{toPersianDigits(cat.avgScore)}٪</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-[#3B0718] via-[#520B24] to-[#D5D5D5]"
                    style={{ width: `${(cat.successful / cat.total) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#8A8A8A] font-mono-data">
                  <span>موفق: {formatNumber(cat.successful)}</span>
                  <span>کل: {formatNumber(cat.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Star,
  Search,
  CheckCircle2,
  AlertTriangle,
  Store,
  ArrowUpDown,
  ShieldCheck,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Sparkles,
} from 'lucide-react';
import { SellersResponse, SellerItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PersianRating } from '../common/PersianRating';
import { Pagination } from '../common/Pagination';
import { toPersianDigits, formatPersianNumber, formatPercent } from '../../utils/formatters';

interface SellersViewProps {
  data: SellersResponse;
  onFilterChange: (filters: { status?: string; category?: string; search?: string; sort?: string; page?: number }) => void;
  isLoading: boolean;
}

export const SellersView: React.FC<SellersViewProps> = ({
  data,
  onFilterChange,
  isLoading,
}) => {
  const { metrics, performanceComparison, sellers, totalCount = 0, page = 1, page_size = 20, totalPages = 1 } = data;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('health_desc');
  const [selectedSellerDetail, setSelectedSellerDetail] = useState<SellerItem | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      search: searchQuery,
      status: selectedStatus,
      category: selectedCategory,
      sort: selectedSort,
      page: 1,
    });
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    onFilterChange({
      status,
      category: selectedCategory,
      search: searchQuery,
      sort: selectedSort,
      page: 1,
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onFilterChange({
      status: selectedStatus,
      category,
      search: searchQuery,
      sort: selectedSort,
      page: 1,
    });
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    onFilterChange({
      status: selectedStatus,
      category: selectedCategory,
      search: searchQuery,
      sort,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    onFilterChange({
      status: selectedStatus,
      category: selectedCategory,
      search: searchQuery,
      sort: selectedSort,
      page: newPage,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ========================================================
          HERO KPI: TOTAL SELLERS & KEY REAL SELLER METRICS
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 lg:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Massive KPI on right */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-l border-[#F1E7E7] pb-6 lg:pb-0 lg:pl-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFECE] text-[#8C4E65] text-xs font-semibold mb-3 border border-[#E69DB8]/30">
              <Users size={13} className="text-[#D88CA7]" />
              <span>پایش عملکرد تأمین‌کنندگان</span>
            </div>
            <h1 className="text-xs font-bold text-[#7A6670]">تعداد کل فروشندگان</h1>
            <div className="text-4xl lg:text-5xl font-black text-[#2D2327] tracking-tight font-tabular mt-1.5">
              {toPersianDigits(metrics.total_sellers)}
            </div>
            <p className="text-xs text-[#7A6670] mt-2">تأمین‌کنندگان احراز هویت شده و فعال در سیستم</p>
          </div>

          {/* 4 Secondary Seller KPIs */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Successful sellers */}
            <div className="bg-[#FFFECE]/80 rounded-2xl p-4 border border-[#BEDDC7]/60">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2B543B]">
                <UserCheck size={14} className="text-[#3D704E]" />
                <span>فروشندگان موفق</span>
              </div>
              <div className="text-2xl font-black text-[#2B543B] font-tabular mt-1.5">
                {toPersianDigits(metrics.successful_sellers)}
              </div>
              <div className="text-[11px] text-[#3D704E] mt-1 font-tabular">
                {formatPercent((metrics.successful_sellers / (metrics.total_sellers || 1)) * 100, 0)} جامعه فروشندگان
              </div>
            </div>

            {/* Unsuccessful sellers */}
            <div className="bg-[#FFD0C7]/45 rounded-2xl p-4 border border-[#E69DB8]/50">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A253A]">
                <UserX size={14} className="text-[#B03A53]" />
                <span>فروشندگان ناموفق</span>
              </div>
              <div className="text-2xl font-black text-[#8A253A] font-tabular mt-1.5">
                {toPersianDigits(metrics.unsuccessful_sellers)}
              </div>
              <div className="text-[11px] text-[#B03A53] mt-1 font-tabular">نیازمند بازبینی و ممیزی</div>
            </div>

            {/* Avg Rating */}
            <div className="bg-[#F1E7E7]/50 rounded-2xl p-4 border border-[#E69DB8]/20">
              <div className="text-[11px] font-semibold text-[#7A6670]">میانگین امتیاز کیفی</div>
              <div className="text-2xl font-black text-[#2D2327] font-tabular mt-1.5">
                {toPersianDigits(metrics.avg_seller_rating)}
              </div>
              <div className="text-[11px] text-[#7A6670] mt-1">از ۵ ستاره کیفی</div>
            </div>

            {/* Avg Satisfaction Score */}
            <div className="bg-[#F1E7E7]/50 rounded-2xl p-4 border border-[#E69DB8]/20">
              <div className="text-[11px] font-semibold text-[#7A6670]">میانگین رضایت مشتری</div>
              <div className="text-2xl font-black text-[#8C4E65] font-tabular mt-1.5">
                {formatPercent(metrics.avg_satisfaction_score)}
              </div>
              <div className="text-[11px] text-[#7A6670] mt-1">رضایت کلی خریداران</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          VISUAL COMPARISON: SUCCESSFUL VS UNSUCCESSFUL SELLERS
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-sm font-extrabold text-[#2D2327]">
              مقایسه شاخص‌های کلیدی: فروشندگان موفق در برابر ناموفق
            </h3>
            <p className="text-xs text-[#7A6670] mt-0.5">
              تفاوت چشمگیر کیفیت خدمات، رضایت خریداران، سلامت فروشنده و نرخ کالای فیک
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-[#2B543B]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3D704E]" />
              <span>فروشندگان برتر و موفق</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#8A253A]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B03A53]" />
              <span>فروشندگان نیازمند بهبود</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceComparison.map((comp, idx) => (
            <div key={idx} className="bg-[#F1E7E7]/30 rounded-2xl p-4 border border-[#E69DB8]/20 space-y-3">
              <div className="text-xs font-bold text-[#2D2327]">{comp.metric}</div>

              <div className="space-y-2">
                {/* Successful bar */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#2B543B] font-semibold">موفق</span>
                    <span className="font-bold text-[#2D2327] font-tabular">
                      {toPersianDigits(comp.successful)} {comp.unit}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F1E7E7] rounded-full overflow-hidden border border-[#BEDDC7]/50">
                    <div
                      className="bg-[#3D704E] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, comp.successful)}%` }}
                    />
                  </div>
                </div>

                {/* Unsuccessful bar */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#8A253A] font-semibold">ناموفق</span>
                    <span className="font-bold text-[#2D2327] font-tabular">
                      {toPersianDigits(comp.unsuccessful)} {comp.unit}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F1E7E7] rounded-full overflow-hidden border border-[#E69DB8]/40">
                    <div
                      className="bg-[#B03A53] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, comp.unsuccessful)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          FILTER & SEARCH TOOLBAR
          ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#E69DB8]/30 p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A6670]" />
            <input
              type="text"
              placeholder="جستجوی نام فروشنده یا کد تأمین‌کننده..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-xs bg-[#F1E7E7]/40 border border-[#E69DB8]/30 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#E69DB8] focus:bg-white transition-all text-[#2D2327] placeholder:text-[#7A6670]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-[#F1E7E7]/80 p-1 rounded-xl text-xs font-medium border border-[#E69DB8]/20">
              {[
                { id: 'all', label: 'همه' },
                { id: 'successful', label: 'فروشندگان موفق' },
                { id: 'unsuccessful', label: 'ناموفق' },
                { id: 'neutral', label: 'متوسط / خنثی' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleStatusChange(tab.id)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedStatus === tab.id
                      ? 'bg-white text-[#2D2327] font-bold shadow-xs border border-[#E69DB8]/30'
                      : 'text-[#5B4852] hover:text-[#2D2327]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#F1E7E7]/40 border border-[#E69DB8]/30 rounded-xl text-[#2D2327] focus:outline-hidden focus:ring-2 focus:ring-[#E69DB8] cursor-pointer font-medium"
            >
              <option value="all">همه حوزه‌ها</option>
              <option value="کالای دیجیتال">کالای دیجیتال</option>
              <option value="زیبایی و سلامت">زیبایی و سلامت</option>
              <option value="لوازم خانگی">لوازم خانگی</option>
              <option value="مد و پوشاک">مد و پوشاک</option>
            </select>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 bg-[#F1E7E7]/40 border border-[#E69DB8]/30 rounded-xl px-2.5 py-1 text-xs">
              <ArrowUpDown size={14} className="text-[#7A6670]" />
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-transparent text-[#2D2327] focus:outline-hidden font-medium cursor-pointer"
              >
                <option value="health_desc">بیشترین امتیاز سلامت</option>
                <option value="satisfaction_desc">بیشترین رضایت مشتری</option>
                <option value="comments_desc">بیشترین تعداد کامنت</option>
                <option value="products_desc">بیشترین تنوع کالا</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* ========================================================
          PREMIUM REAL SELLER PERFORMANCE TABLE
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#F1E7E7] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#2D2327]">
              جدول ارزیابی و ماتریس عملکرد فروشندگان ({formatPersianNumber(totalCount || sellers.length)} فروشنده)
            </h3>
            <p className="text-xs text-[#7A6670] mt-0.5">
              رتبه‌بندی دقیق براساس رضایت، نرخ کالای فیک، محصولات کم‌امتیاز و شاخص سلامت ۵۰/۳۰/۲۰
            </p>
          </div>
          {isLoading && <span className="text-xs text-[#E69DB8] font-bold animate-pulse">در حال فراخوانی...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#F1E7E7]/50 border-b border-[#E69DB8]/20 text-[#5B4852] font-bold">
                <th className="py-3.5 px-6">فروشنده و حوزه</th>
                <th className="py-3.5 px-4 text-center">کد فروشنده</th>
                <th className="py-3.5 px-4 text-center">تنوع کالا</th>
                <th className="py-3.5 px-4 text-center">حجم نظرات</th>
                <th className="py-3.5 px-4 text-center">مثبت / منفی</th>
                <th className="py-3.5 px-4 text-center">رضایت مشتری</th>
                <th className="py-3.5 px-4 text-center">کالای غیراصل</th>
                <th className="py-3.5 px-4 text-center">کالای کم‌امتیاز</th>
                <th className="py-3.5 px-4 text-center">امتیاز سلامت</th>
                <th className="py-3.5 px-6 text-center">وضعیت ارزیابی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1E7E7]">
              {sellers.map((seller) => (
                <tr
                  key={seller.seller_code}
                  onClick={() => setSelectedSellerDetail(seller)}
                  className="hover:bg-[#F1E7E7]/30 transition-colors cursor-pointer group"
                >
                  {/* Seller Identity */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F1E7E7] border border-[#E69DB8]/30 flex items-center justify-center text-[#8C4E65] shrink-0 font-bold">
                        <Store size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-[#2D2327] group-hover:text-[#8C4E65] transition-colors">
                          {seller.seller_title}
                        </div>
                        {seller.category && (
                          <span className="bg-[#FFFECE] text-[#8C4E65] border border-[#E69DB8]/30 px-2 py-0.5 rounded-md text-[10px] font-bold inline-block mt-0.5">
                            {seller.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Seller Code */}
                  <td className="py-4 px-4 text-center text-[#7A6670] font-mono text-[11px] whitespace-nowrap">
                    {seller.seller_code}
                  </td>

                  {/* Sold Products Count */}
                  <td className="py-4 px-4 text-center font-bold text-[#2D2327] font-tabular whitespace-nowrap">
                    {toPersianDigits(seller.sold_products)} کالا
                  </td>

                  {/* Total Comments */}
                  <td className="py-4 px-4 text-center font-bold text-[#2D2327] font-tabular whitespace-nowrap">
                    {formatPersianNumber(seller.total_comments)}
                  </td>

                  {/* Positive / Negative */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2 text-[11px] font-tabular">
                      <span className="text-[#2B543B] font-bold flex items-center gap-0.5">
                        <ThumbsUp size={11} className="text-[#3D704E]" />
                        {formatPersianNumber(seller.positive_comments)}
                      </span>
                      <span className="text-[#8A253A] font-bold flex items-center gap-0.5">
                        <ThumbsDown size={11} className="text-[#B03A53]" />
                        {formatPersianNumber(seller.negative_comments)}
                      </span>
                    </div>
                  </td>

                  {/* Customer Satisfaction Score */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span
                      className={`font-bold font-tabular ${
                        seller.customer_satisfaction_score >= 80 ? 'text-[#2B543B]' : 'text-[#8A253A]'
                      }`}
                    >
                      {formatPercent(seller.customer_satisfaction_score)}
                    </span>
                  </td>

                  {/* Fake Product Percent */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span
                      className={`font-bold font-tabular ${
                        seller.fake_product_percent <= 1 ? 'text-[#2B543B]' : 'text-[#8A253A]'
                      }`}
                    >
                      {formatPercent(seller.fake_product_percent)}
                    </span>
                  </td>

                  {/* Low Rated Product Percent */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span
                      className={`font-bold font-tabular ${
                        seller.low_rated_product_percent <= 10 ? 'text-[#2B543B]' : 'text-[#8A253A]'
                      }`}
                    >
                      {formatPercent(seller.low_rated_product_percent)}
                    </span>
                  </td>

                  {/* Health Score */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-black text-[#8C4E65] font-tabular bg-[#F1E7E7]/60 px-2.5 py-1 rounded-lg border border-[#E69DB8]/30">
                      <Activity size={12} className="text-[#D88CA7]" />
                      <span>{toPersianDigits(seller.seller_health_score)}</span>
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <StatusBadge status={seller.seller_status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Server-side Pagination */}
        <div className="px-6 pb-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={page_size}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            itemLabel="فروشنده"
          />
        </div>
      </div>

      {/* ========================================================
          MODAL / DRAWER DETAIL VIEW
          ======================================================== */}
      {selectedSellerDetail && (
        <div className="fixed inset-0 bg-[#2D2327]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E69DB8]/40 animate-scale-up">
            <div className="flex items-start justify-between border-b border-[#F1E7E7] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F1E7E7] border border-[#E69DB8]/30 flex items-center justify-center text-[#8C4E65] font-bold">
                  <Store size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#2D2327]">{selectedSellerDetail.seller_title}</h3>
                  <p className="text-xs text-[#7A6670] mt-0.5">
                    کد: {selectedSellerDetail.seller_code} • حوزه: {selectedSellerDetail.category}
                  </p>
                </div>
              </div>
              <StatusBadge status={selectedSellerDetail.seller_status} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
              <div className="bg-[#FFFECE]/80 p-3 rounded-xl border border-[#BEDDC7]/60">
                <span className="text-[#2B543B]">رضایت خریداران:</span>
                <p className="font-bold text-[#2B543B] font-tabular mt-1">
                  {formatPercent(selectedSellerDetail.customer_satisfaction_score)}
                </p>
              </div>
              <div className="bg-[#F1E7E7]/40 p-3 rounded-xl border border-[#E69DB8]/20">
                <span className="text-[#7A6670]">امتیاز سلامت فروشنده:</span>
                <p className="font-bold text-[#8C4E65] font-tabular mt-1">
                  {toPersianDigits(selectedSellerDetail.seller_health_score)} از ۱۰۰
                </p>
              </div>
              <div className="bg-[#F1E7E7]/40 p-3 rounded-xl border border-[#E69DB8]/20">
                <span className="text-[#7A6670]">تعداد محصولات کاتالوگ:</span>
                <p className="font-bold text-[#2D2327] font-tabular mt-1">
                  {toPersianDigits(selectedSellerDetail.sold_products)} کالا
                </p>
              </div>
              <div className="bg-[#F1E7E7]/40 p-3 rounded-xl border border-[#E69DB8]/20">
                <span className="text-[#7A6670]">کل نظرات دریافتی:</span>
                <p className="font-bold text-[#2D2327] font-tabular mt-1">
                  {formatPersianNumber(selectedSellerDetail.total_comments)} کامنت
                </p>
              </div>
              <div className="bg-[#FFD0C7]/45 p-3 rounded-xl border border-[#E69DB8]/50">
                <span className="text-[#8A253A]">درصد کالای غیراصل (فیک):</span>
                <p className="font-bold text-[#8A253A] font-tabular mt-1">
                  {formatPercent(selectedSellerDetail.fake_product_percent)}
                </p>
              </div>
              <div className="bg-[#FFD0C7]/45 p-3 rounded-xl border border-[#E69DB8]/50">
                <span className="text-[#8A253A]">درصد کالای کم‌امتیاز:</span>
                <p className="font-bold text-[#8A253A] font-tabular mt-1">
                  {formatPercent(selectedSellerDetail.low_rated_product_percent)}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-[#7A6670] bg-[#F1E7E7]/30 p-3 rounded-xl border border-[#E69DB8]/20 mb-4">
              💡 <span className="font-semibold text-[#2D2327]">فرمول نمره سلامت:</span> ۵۰٪ رضایت خریداران + ۳۰٪ اصالت کالا + ۲۰٪ کالاهای با امتیاز بالا
            </div>

            <button
              onClick={() => setSelectedSellerDetail(null)}
              className="w-full py-2.5 rounded-xl bg-[#E69DB8] hover:bg-[#D88CA7] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              بستن پنجره جزئیات
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

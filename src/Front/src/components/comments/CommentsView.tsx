import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown,
  ShoppingBag,
  Store,
  PlusCircle,
  MinusCircle,
  Sparkles,
} from 'lucide-react';
import { CommentsResponse, CommentItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PersianRating } from '../common/PersianRating';
import { toPersianDigits, formatPersianNumber, formatPercent } from '../../utils/formatters';

interface CommentsViewProps {
  data: CommentsResponse;
  onFilterChange: (filters: { sentiment?: string; rating?: string; category?: string; search?: string }) => void;
  isLoading: boolean;
}

export const CommentsView: React.FC<CommentsViewProps> = ({
  data,
  onFilterChange,
  isLoading,
}) => {
  const { metrics, ratingDistribution, comments } = data;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCommentDetail, setSelectedCommentDetail] = useState<CommentItem | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      search: searchQuery,
      sentiment: selectedSentiment,
      rating: selectedRating,
      category: selectedCategory,
    });
  };

  const handleSentimentChange = (sentiment: string) => {
    setSelectedSentiment(sentiment);
    onFilterChange({
      sentiment,
      rating: selectedRating,
      category: selectedCategory,
      search: searchQuery,
    });
  };

  const handleRatingChange = (rating: string) => {
    setSelectedRating(rating);
    onFilterChange({
      sentiment: selectedSentiment,
      rating,
      category: selectedCategory,
      search: searchQuery,
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onFilterChange({
      sentiment: selectedSentiment,
      rating: selectedRating,
      category,
      search: searchQuery,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ========================================================
          HERO KPI: TOTAL COMMENTS & REAL COMMENT METRICS
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 lg:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Massive KPI */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-l border-[#F1E7E7] pb-6 lg:pb-0 lg:pl-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFECE] text-[#8C4E65] text-xs font-semibold mb-3 border border-[#E69DB8]/30">
              <MessageSquare size={13} className="text-[#D88CA7]" />
              <span>پایش نظرات خریداران</span>
            </div>
            <h1 className="text-xs font-bold text-[#7A6670]">تعداد کل کامنت‌های ثبت‌شده</h1>
            <div className="text-4xl lg:text-5xl font-black text-[#2D2327] tracking-tight font-tabular mt-1.5">
              {formatPersianNumber(metrics.total_comments)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="font-bold text-[#2B543B] font-tabular bg-[#FFFECE] px-2 py-0.5 rounded-md border border-[#BEDDC7]">
                {toPersianDigits(metrics.change_rate)}
              </span>
              <span className="text-[#7A6670]">رشد حجم ثبت نظرات در این ماه</span>
            </div>
          </div>

          {/* 4 Secondary KPIs */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Positive Comments KPI */}
            <div className="bg-[#FFFECE]/80 rounded-2xl p-4 border border-[#BEDDC7]/60">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2B543B]">
                <ThumbsUp size={14} className="text-[#3D704E]" />
                <span>کامنت‌های مثبت</span>
              </div>
              <div className="text-2xl font-black text-[#2B543B] font-tabular mt-1.5">
                {formatPersianNumber(metrics.positive_comments)}
              </div>
              <div className="text-[11px] text-[#3D704E] mt-1 font-tabular">
                {formatPercent(metrics.positive_rate)} کل نظرات
              </div>
            </div>

            {/* Negative Comments KPI */}
            <div className="bg-[#FFD0C7]/45 rounded-2xl p-4 border border-[#E69DB8]/50">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A253A]">
                <ThumbsDown size={14} className="text-[#B03A53]" />
                <span>کامنت‌های منفی</span>
              </div>
              <div className="text-2xl font-black text-[#8A253A] font-tabular mt-1.5">
                {formatPersianNumber(metrics.negative_comments)}
              </div>
              <div className="text-[11px] text-[#B03A53] mt-1 font-tabular">
                {formatPercent(metrics.negative_rate)} نیازمند پیگیری
              </div>
            </div>

            {/* Average Rating KPI */}
            <div className="bg-[#F1E7E7]/50 rounded-2xl p-4 border border-[#E69DB8]/20">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#7A6670]">
                <Star size={13} className="text-[#D88CA7] fill-[#D88CA7]" />
                <span>میانگین امتیاز</span>
              </div>
              <div className="text-2xl font-black text-[#2D2327] font-tabular mt-1.5">
                {toPersianDigits(metrics.average_rating)}
              </div>
              <div className="text-[11px] text-[#7A6670] mt-1">از ۵ ستاره کیفی</div>
            </div>

            {/* Avg Comments per Product */}
            <div className="bg-[#F1E7E7]/50 rounded-2xl p-4 border border-[#E69DB8]/20">
              <div className="text-[11px] font-semibold text-[#7A6670]">میانگین نظر به کالا</div>
              <div className="text-2xl font-black text-[#8C4E65] font-tabular mt-1.5">
                {formatPersianNumber(metrics.avg_comments_per_product)}
              </div>
              <div className="text-[11px] text-[#7A6670] mt-1">مشارکت فعال کاربران</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          DISTRIBUTION BAR MATRIX (RATING BREAKDOWN)
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 shadow-xs">
        <h3 className="text-sm font-extrabold text-[#2D2327] mb-1">
          توزیع امتیازات و دسته‌بندی نظرات کاربران
        </h3>
        <p className="text-xs text-[#7A6670] mb-6">
          ترکیب ستاره‌های کیفی و تناسب پیشنهاد کالا در جامعه آماری خریداران
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {ratingDistribution.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#F1E7E7]/40 rounded-2xl p-3.5 border border-[#E69DB8]/20 space-y-2 hover:bg-[#F1E7E7]/70 transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#2D2327]">{item.stars}</span>
                <span className="text-[#8C4E65] font-tabular">{formatPercent(item.percentage)}</span>
              </div>
              <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#E69DB8]/20">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: idx < 2 ? '#3D704E' : idx === 2 ? '#8C4E65' : '#B03A53',
                  }}
                />
              </div>
              <div className="text-[11px] text-[#7A6670] font-tabular text-left">
                {formatPersianNumber(item.count)} نظر
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
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A6670]" />
            <input
              type="text"
              placeholder="جستجو در عنوان، متن، کالا، فروشنده یا کد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-xs bg-[#F1E7E7]/40 border border-[#E69DB8]/30 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#E69DB8] focus:bg-white transition-all text-[#2D2327] placeholder:text-[#7A6670]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Positive/Negative Filter */}
            <div className="flex items-center bg-[#F1E7E7]/80 p-1 rounded-xl text-xs font-medium border border-[#E69DB8]/20">
              {[
                { id: 'all', label: 'همه نظرات' },
                { id: 'positive', label: 'کامنت‌های مثبت' },
                { id: 'negative', label: 'کامنت‌های منفی' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSentimentChange(tab.id)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedSentiment === tab.id
                      ? 'bg-white text-[#2D2327] font-bold shadow-xs border border-[#E69DB8]/30'
                      : 'text-[#5B4852] hover:text-[#2D2327]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Rating Filter */}
            <select
              value={selectedRating}
              onChange={(e) => handleRatingChange(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#F1E7E7]/40 border border-[#E69DB8]/30 rounded-xl text-[#2D2327] focus:outline-hidden focus:ring-2 focus:ring-[#E69DB8] cursor-pointer font-medium"
            >
              <option value="all">همه امتیازها</option>
              <option value="5">۵ ستاره</option>
              <option value="4">۴ ستاره</option>
              <option value="3">۳ ستاره</option>
              <option value="2">۲ ستاره</option>
              <option value="1">۱ ستاره</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#F1E7E7]/40 border border-[#E69DB8]/30 rounded-xl text-[#2D2327] focus:outline-hidden focus:ring-2 focus:ring-[#E69DB8] cursor-pointer font-medium"
            >
              <option value="all">همه دسته‌بندی‌ها</option>
              <option value="کالای دیجیتال">کالای دیجیتال</option>
              <option value="زیبایی و سلامت">زیبایی و سلامت</option>
              <option value="لوازم خانگی">لوازم خانگی</option>
              <option value="مد و پوشاک">مد و پوشاک</option>
            </select>
          </div>
        </form>
      </div>

      {/* ========================================================
          COMMENTS DATA TABLE
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#F1E7E7] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#2D2327]">
              فهرست نظرات و بازخوردهای ثبت‌شده ({toPersianDigits(comments.length)} مورد)
            </h3>
            <p className="text-xs text-[#7A6670] mt-0.5">
              نمایش داده‌های واقعی کامنت شامل وضعیت پیشنهاد، امتیاز، مزایا، معایب، فروشنده و واکنش‌ها
            </p>
          </div>
          {isLoading && (
            <span className="text-xs text-[#E69DB8] font-bold animate-pulse">در حال بارگذاری...</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#F1E7E7]/50 border-b border-[#E69DB8]/20 text-[#5B4852] font-bold">
                <th className="py-3.5 px-6">عنوان و کالا</th>
                <th className="py-3.5 px-6">متن نظر و نکات</th>
                <th className="py-3.5 px-4 text-center">امتیاز</th>
                <th className="py-3.5 px-4 text-center">وضعیت پیشنهاد</th>
                <th className="py-3.5 px-4 text-center">خریدار</th>
                <th className="py-3.5 px-4">فروشنده</th>
                <th className="py-3.5 px-4 text-center">واکنش‌ها</th>
                <th className="py-3.5 px-6 text-center">تاریخ ثبت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1E7E7]">
              {comments.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedCommentDetail(item)}
                  className="hover:bg-[#F1E7E7]/30 transition-colors cursor-pointer group"
                >
                  {/* Title & Product */}
                  <td className="py-4 px-6 max-w-xs">
                    <div className="font-bold text-[#2D2327] group-hover:text-[#8C4E65] transition-colors line-clamp-1">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#7A6670] mt-0.5 line-clamp-1 flex items-center gap-1">
                      <ShoppingBag size={12} className="text-[#D88CA7] shrink-0" />
                      <span>{item.product_title_fa || item.product_id}</span>
                    </div>
                  </td>

                  {/* Body & Advantages/Disadvantages */}
                  <td className="py-4 px-6 max-w-md">
                    <p className="text-[#5B4852] line-clamp-2 leading-relaxed text-xs">
                      {item.body}
                    </p>
                    {(item.advantages.length > 0 || item.disadvantages.length > 0) && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.advantages.slice(0, 2).map((adv, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] bg-[#FFFECE] text-[#2B543B] px-2 py-0.5 rounded-md border border-[#BEDDC7]"
                          >
                            <PlusCircle size={10} className="text-[#3D704E]" />
                            <span>{adv}</span>
                          </span>
                        ))}
                        {item.disadvantages.slice(0, 1).map((dis, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] bg-[#FFD0C7]/40 text-[#8A253A] px-2 py-0.5 rounded-md border border-[#E69DB8]/40"
                          >
                            <MinusCircle size={10} className="text-[#B03A53]" />
                            <span>{dis}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="py-4 px-4 text-center">
                    <PersianRating rating={item.rate} size="sm" />
                  </td>

                  {/* Recommendation Status */}
                  <td className="py-4 px-4 text-center">
                    <StatusBadge status={item.recommendation_status} size="sm" />
                  </td>

                  {/* Is Buyer */}
                  <td className="py-4 px-4 text-center">
                    {item.is_buyer ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2B543B] bg-[#FFFECE] px-2 py-0.5 rounded-md border border-[#BEDDC7]">
                        <CheckCircle2 size={12} className="text-[#3D704E]" />
                        <span>خریدار</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#7A6670]">کاربر</span>
                    )}
                  </td>

                  {/* Seller */}
                  <td className="py-4 px-4 text-[#5B4852] font-medium whitespace-nowrap">
                    <div className="font-bold text-[#2D2327] flex items-center gap-1">
                      <Store size={12} className="text-[#D88CA7]" />
                      <span>{item.seller_title}</span>
                    </div>
                    <span className="text-[10px] text-[#7A6670] font-mono mt-0.5 block">
                      {item.seller_code}
                    </span>
                  </td>

                  {/* Likes / Dislikes */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px] font-tabular">
                      <span className="text-[#2B543B] font-bold flex items-center gap-0.5">
                        <ThumbsUp size={11} className="text-[#3D704E]" />
                        {toPersianDigits(item.likes)}
                      </span>
                      <span className="text-[#8A253A] font-bold flex items-center gap-0.5">
                        <ThumbsDown size={11} className="text-[#B03A53]" />
                        {toPersianDigits(item.dislikes)}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-6 text-center text-[#7A6670] font-tabular whitespace-nowrap">
                    {toPersianDigits(item.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          COMMENT DETAIL MODAL
          ======================================================== */}
      {selectedCommentDetail && (
        <div className="fixed inset-0 bg-[#2D2327]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E69DB8]/40 animate-scale-up">
            <div className="flex items-start justify-between border-b border-[#F1E7E7] pb-4 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#2D2327]">{selectedCommentDetail.title}</h3>
                <p className="text-xs text-[#7A6670] mt-1 flex items-center gap-1">
                  <ShoppingBag size={13} className="text-[#D88CA7]" />
                  <span>{selectedCommentDetail.product_title_fa || selectedCommentDetail.product_id}</span>
                </p>
              </div>
              <StatusBadge status={selectedCommentDetail.recommendation_status} />
            </div>

            <div className="space-y-3 mb-5 text-xs">
              <div className="bg-[#F1E7E7]/40 p-3.5 rounded-2xl border border-[#E69DB8]/20">
                <span className="text-[#7A6670] block mb-1">متن کامل دیدگاه:</span>
                <p className="text-[#2D2327] leading-relaxed">{selectedCommentDetail.body}</p>
              </div>

              {selectedCommentDetail.advantages.length > 0 && (
                <div className="bg-[#FFFECE]/80 p-3 rounded-xl border border-[#BEDDC7]/60">
                  <span className="text-[#2B543B] font-bold block mb-1">نقاط قوت و مزایا:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[#2B543B]">
                    {selectedCommentDetail.advantages.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCommentDetail.disadvantages.length > 0 && (
                <div className="bg-[#FFD0C7]/45 p-3 rounded-xl border border-[#E69DB8]/50">
                  <span className="text-[#8A253A] font-bold block mb-1">نقاط ضعف و معایب:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[#8A253A]">
                    {selectedCommentDetail.disadvantages.map((dis, i) => (
                      <li key={i}>{dis}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-[#F1E7E7]/30 p-2.5 rounded-xl border border-[#E69DB8]/20">
                  <span className="text-[#7A6670]">فروشنده:</span>
                  <p className="font-bold text-[#2D2327] mt-0.5">
                    {selectedCommentDetail.seller_title} ({selectedCommentDetail.seller_code})
                  </p>
                </div>
                <div className="bg-[#F1E7E7]/30 p-2.5 rounded-xl border border-[#E69DB8]/20">
                  <span className="text-[#7A6670]">تاریخ ثبت:</span>
                  <p className="font-bold text-[#2D2327] font-tabular mt-0.5">
                    {toPersianDigits(selectedCommentDetail.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCommentDetail(null)}
              className="w-full py-2.5 rounded-xl bg-[#E69DB8] hover:bg-[#D88CA7] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              بستن پنجره
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Download,
  ThumbsUp,
  ThumbsDown,
  Star,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Store,
  Package,
  Calendar,
  Sparkles,
  ArrowUpDown,
  User,
  Heart,
  TrendingUp,
  Tag,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { CommentItem } from '../types';
import { formatNumber, toPersianDigits, exportToCsv } from '../utils/formatters';
import { CommentDetailModal } from './CommentDetailModal';
import { AnimatedCounter } from './AnimatedCounter';
import { Skeleton, CommentsSkeleton } from './SkeletonLoader';
import {
  fetchCommentsApi,
  fetchCommentsSummaryApi,
  CommentsSummaryResponse,
} from '../services/api';

interface CommentsViewProps {
  comments?: CommentItem[];
}

type SortOption = 'newest' | 'most_liked' | 'highest_rating' | 'lowest_rating' | 'sentiment_score';

export const CommentsView: React.FC<CommentsViewProps> = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 21; // Exactly 21 comments (3 columns x 7 rows) per page

  // API Data States
  const [summaryData, setSummaryData] = useState<CommentsSummaryResponse | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [recommendationFilter, setRecommendationFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Modal & Local Interactions
  const [selectedComment, setSelectedComment] = useState<CommentItem | null>(null);
  const [likedComments, setLikedComments] = useState<Record<string, 'liked' | 'disliked'>>({});

  // 1. Fetch Summary Data (GET /api/comments-summary)
  const loadSummary = async () => {
    setIsSummaryLoading(true);
    try {
      const data = await fetchCommentsSummaryApi();
      setSummaryData(data);
    } catch (err) {
      console.error('Failed to load comments summary:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // 2. Fetch Paginated Comments (GET /api/comments?page={page}&page_size=21)
  const loadComments = async (page: number) => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await fetchCommentsApi(page, pageSize);
      setComments(data.items);
      setTotalCount(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Failed to load paginated comments:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    loadComments(currentPage);
  }, [currentPage]);

  // Extract unique categories from current items for client filter
  const categories = useMemo(() => {
    const set = new Set(comments.map((c) => c.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [comments]);

  // Filter & Sort client-side for immediate responsive search experience
  const displayComments = useMemo(() => {
    return comments
      .filter((c) => {
        const matchesSearch =
          searchTerm === '' ||
          c.comment_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.product_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.seller_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.user_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSentiment =
          sentimentFilter === 'all' || c.sentiment === sentimentFilter;

        const matchesRating =
          ratingFilter === 'all' || c.rating === parseInt(ratingFilter, 10);

        const matchesRec =
          recommendationFilter === 'all' || c.recommendation_status === recommendationFilter;

        const matchesCategory =
          categoryFilter === 'all' || c.category === categoryFilter;

        return (
          matchesSearch &&
          matchesSentiment &&
          matchesRating &&
          matchesRec &&
          matchesCategory
        );
      })
      .sort((a, b) => {
        if (sortOption === 'most_liked') {
          return b.likes_count - a.likes_count;
        }
        if (sortOption === 'highest_rating') {
          return b.rating - a.rating;
        }
        if (sortOption === 'lowest_rating') {
          return a.rating - b.rating;
        }
        if (sortOption === 'sentiment_score') {
          return b.sentiment_score - a.sentiment_score;
        }
        return b.id.localeCompare(a.id);
      });
  }, [
    comments,
    searchTerm,
    sentimentFilter,
    ratingFilter,
    recommendationFilter,
    categoryFilter,
    sortOption,
  ]);

  // Like / Dislike interaction
  const handleVote = (id: string, type: 'like' | 'dislike', e: React.MouseEvent) => {
    e.stopPropagation();
    const currentVote = likedComments[id];

    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        let newLikes = c.likes_count;
        let newDislikes = c.dislikes_count;

        if (type === 'like') {
          if (currentVote === 'liked') {
            newLikes -= 1;
            setLikedComments((v) => ({ ...v, [id]: undefined as any }));
          } else {
            newLikes += 1;
            if (currentVote === 'disliked') newDislikes -= 1;
            setLikedComments((v) => ({ ...v, [id]: 'liked' }));
          }
        } else {
          if (currentVote === 'disliked') {
            newDislikes -= 1;
            setLikedComments((v) => ({ ...v, [id]: undefined as any }));
          } else {
            newDislikes += 1;
            if (currentVote === 'liked') newLikes -= 1;
            setLikedComments((v) => ({ ...v, [id]: 'disliked' }));
          }
        }

        return {
          ...c,
          likes_count: Math.max(0, newLikes),
          dislikes_count: Math.max(0, newDislikes),
        };
      })
    );
  };

  const handleExportCsv = () => {
    const headers = [
      'شناسه کامنت',
      'عنوان نظر',
      'متن نظر',
      'شناسه کالا',
      'عنوان کالا',
      'فروشنده',
      'نام کاربر',
      'امتیاز ستاره',
      'احساسات NLP',
      'امتیاز احساسات',
      'وضعیت پیشنهاد',
      'تعداد لایک',
      'تعداد دیسلایک',
      'تاریخ ثبت',
      'دسته کالا',
    ];

    const rows = displayComments.map((c) => [
      c.id,
      c.title,
      c.comment_text,
      c.product_id,
      c.product_title,
      c.seller_title,
      c.user_name,
      c.rating,
      c.sentiment,
      c.sentiment_score,
      c.recommendation_status,
      c.likes_count,
      c.dislikes_count,
      c.created_at,
      c.category,
    ]);

    exportToCsv('digikala-comments-page-21.csv', headers, rows);
  };

  const totalSummaryCount = summaryData?.total_comments || 8420650;
  const positiveSummaryCount = summaryData?.positive_comments || 6989139;
  const negativeSummaryCount = summaryData?.negative_comments || 926271;
  const positivePct = summaryData?.positive_percentage || Number(((positiveSummaryCount / totalSummaryCount) * 100).toFixed(1));
  const negativePct = summaryData?.negative_percentage || Number(((negativeSummaryCount / totalSummaryCount) * 100).toFixed(1));

  return (
    <div className="space-y-7">
      {/* ========================================================
          TOP SUMMARY BAR (GET /api/comments-summary)
          ======================================================== */}
      <section className="glass-card p-5 md:p-6 relative overflow-hidden space-y-4">
        <div className="icy-top-reflection" />
        <div className="absolute -top-10 right-1/3 w-80 h-24 bg-[#800020]/20 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          {/* Total Comments Count */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#800020]/30 border border-[#FFB7D1]/30 flex items-center justify-center text-[#FFB7D1] shadow-[0_0_20px_rgba(201,42,75,0.35)] shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#BFA9B2] uppercase tracking-wider">
                خلاصه جامع نظرات خریداران
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-extrabold text-[#F8EEF2] tracking-tight font-['Plus_Jakarta_Sans','Vazirmatn']">
                  <AnimatedCounter value={totalSummaryCount} />
                </span>
                <span className="text-xs text-[#BFA9B2]">کل نظرات ثبت‌شده</span>
              </div>
            </div>
          </div>

          {/* Key Percentages Pills & Export Button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#00D26A]/10 border border-[#00D26A]/30 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D26A] shadow-[0_0_8px_#00D26A]" />
              <span className="text-[#BFA9B2]">مثبت:</span>
              <strong className="text-[#00D26A] font-mono text-sm">{toPersianDigits(positivePct)}٪</strong>
              <span className="text-[10px] text-[#BFA9B2]/80">({formatNumber(positiveSummaryCount)})</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#C92A4B]/15 border border-[#FFB7D1]/30 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C92A4B] shadow-[0_0_8px_#C92A4B]" />
              <span className="text-[#BFA9B2]">منفی:</span>
              <strong className="text-[#FFB7D1] font-mono text-sm">{toPersianDigits(negativePct)}٪</strong>
              <span className="text-[10px] text-[#BFA9B2]/80">({formatNumber(negativeSummaryCount)})</span>
            </div>

            <button
              onClick={handleExportCsv}
              className="glass-btn text-xs px-3.5 py-1.5 hover:border-[#FFB7D1]/40"
              title="خروجی فایل اکسل / CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#FFB7D1]" />
              <span>خروجی CSV</span>
            </button>
          </div>
        </div>

        {/* Horizontal Dual-Colored Progress Bar */}
        <div className="space-y-1.5 relative z-10 pt-1">
          <div className="w-full h-3.5 rounded-full bg-white/[0.06] overflow-hidden flex shadow-inner p-0.5 border border-white/[0.08]">
            {/* Green for Positive */}
            <div
              style={{ width: `${positivePct}%` }}
              className="h-full bg-gradient-to-r from-[#00D26A] via-[#00B85C] to-[#009E4F] rounded-r-full shadow-[0_0_12px_#00D26A] transition-all duration-700"
              title={`نظرات مثبت: ${positivePct}٪`}
            />
            {/* Cherry Red for Negative */}
            <div
              style={{ width: `${negativePct}%` }}
              className="h-full bg-gradient-to-r from-[#C92A4B] via-[#9B111E] to-[#800020] rounded-l-full shadow-[0_0_12px_#C92A4B] transition-all duration-700"
              title={`نظرات منفی: ${negativePct}٪`}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#BFA9B2] px-1">
            <span className="flex items-center gap-1 text-[#00D26A]">
              <ThumbsUp className="w-3 h-3" />
              {toPersianDigits(positivePct)}٪ رضایت و بازخورد مثبت
            </span>
            <span className="flex items-center gap-1 text-[#FFB7D1]">
              {toPersianDigits(negativePct)}٪ نارضایتی و گزارش ایراد
              <ThumbsDown className="w-3 h-3" />
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          COMMENTS GRID: EXACTLY 21 ITEMS (7 ROWS X 3 COLUMNS)
          ======================================================== */}
      {isLoading ? (
        <CommentsSkeleton />
      ) : hasError ? (
        <div className="glass-card p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-[#C92A4B] mx-auto animate-bounce" />
          <h3 className="text-base font-bold text-[#F8EEF2]">خطا در دریافت لیست کامنت‌ها</h3>
          <p className="text-xs text-[#BFA9B2]">
            ارتباط با سرور REST API با وقفه مواجه شد. می‌توانید دوباره تلاش کنید.
          </p>
          <button
            onClick={() => loadComments(currentPage)}
            className="glass-btn-primary text-xs px-4 py-2"
          >
            تلاش مجدد
          </button>
        </div>
      ) : displayComments.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <MessageSquare className="w-10 h-10 text-[#BFA9B2] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[#F8EEF2]">نظری با این فیلترها یافت نشد</h3>
          <p className="text-xs text-[#BFA9B2]">
            لطفاً عبارت جستجو یا فیلترهای انتخابی را تغییر دهید.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSentimentFilter('all');
              setRatingFilter('all');
              setRecommendationFilter('all');
              setCategoryFilter('all');
            }}
            className="glass-btn text-xs px-4 py-2 mt-2"
          >
            پاک کردن تمام فیلترها
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {displayComments.map((comment, index) => {
            const isLiked = likedComments[comment.id] === 'liked';
            const isDisliked = likedComments[comment.id] === 'disliked';

            // Recommendation badge colors and label
            let recBadgeClass = 'badge-gray';
            let recLabel = 'بدون نظر';
            if (comment.recommendation_status === 'recommended') {
              recBadgeClass = 'badge-success';
              recLabel = 'پیشنهاد شده';
            } else if (comment.recommendation_status === 'not_recommended') {
              recBadgeClass = 'badge-danger';
              recLabel = 'پیشنهاد نمی‌شود';
            }

            return (
              <div
                key={comment.id}
                id={`comment-card-${comment.id}`}
                onClick={() => setSelectedComment(comment)}
                className="glass-card glass-card-hover p-5 relative overflow-hidden flex flex-col justify-between cursor-pointer group space-y-4"
              >
                <div className="icy-top-reflection" />
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#800020]/15 filter blur-2xl group-hover:bg-[#C92A4B]/25 transition-all pointer-events-none" />

                {/* Top Row: Stars Rating & Recommendation Badge */}
                <div className="flex items-center justify-between gap-2 relative z-10">
                  {/* Rating in Glowing Stars */}
                  <div className="flex items-center gap-1" title={`${comment.rating} از ۵ ستاره`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= comment.rating
                            ? 'text-[#F5A623] fill-[#F5A623] drop-shadow-[0_0_6px_rgba(245,166,35,0.5)]'
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-mono font-bold text-[#F8EEF2] mr-1">
                      {toPersianDigits(comment.rating)}.۰
                    </span>
                  </div>

                  {/* Recommendation Status Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${recBadgeClass}`}>
                    {recLabel}
                  </span>
                </div>

                {/* Main Content: Title & Comment Excerpt */}
                <div className="space-y-2 relative z-10 flex-1">
                  {comment.title && (
                    <h4 className="font-bold text-sm text-[#F8EEF2] line-clamp-1 group-hover:text-[#FFB7D1] transition-colors">
                      {comment.title}
                    </h4>
                  )}
                  <p className="text-xs text-[#BFA9B2] leading-relaxed line-clamp-3">
                    {comment.comment_text}
                  </p>
                </div>

                {/* Pros / Cons Mini Tag if available */}
                {comment.pros && comment.pros.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-[#00D26A] bg-[#00D26A]/10 px-2 py-1 rounded-lg border border-[#00D26A]/20 truncate">
                    <span className="font-bold">نقطه قوت:</span>
                    <span className="truncate">{comment.pros[0]}</span>
                  </div>
                )}

                {/* Product & Seller context */}
                <div className="pt-2 border-t border-white/[0.06] text-[11px] text-[#BFA9B2] space-y-1 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[#F8EEF2]/90 flex items-center gap-1">
                      <Package className="w-3 h-3 text-[#FFB7D1] shrink-0" />
                      <span className="truncate">{comment.product_title}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#BFA9B2]">
                    <span>فروشنده: {comment.seller_title}</span>
                    <span>{comment.created_at}</span>
                  </div>
                </div>

                {/* Bottom Row: User Name & Likes / Dislikes */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] relative z-10">
                  <div className="flex items-center gap-1.5 text-xs text-[#BFA9B2]">
                    <User className="w-3 h-3 text-[#FFB7D1]" />
                    <span className="font-medium text-[#F8EEF2]">{comment.user_name}</span>
                    {comment.is_buyer && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-white/[0.06] text-[#00D26A]">
                        خریدار
                      </span>
                    )}
                  </div>

                  {/* Likes & Dislikes Interactive Counters */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleVote(comment.id, 'like', e)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all border ${
                        isLiked
                          ? 'bg-[#00D26A]/20 border-[#00D26A]/40 text-[#00D26A] shadow-[0_0_8px_#00D26A]'
                          : 'bg-white/[0.03] border-white/[0.06] text-[#BFA9B2] hover:text-[#00D26A]'
                      }`}
                      title="مفید بود"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span className="font-mono text-[11px]">{toPersianDigits(comment.likes_count)}</span>
                    </button>

                    <button
                      onClick={(e) => handleVote(comment.id, 'dislike', e)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all border ${
                        isDisliked
                          ? 'bg-[#C92A4B]/25 border-[#FFB7D1]/40 text-[#FFB7D1] shadow-[0_0_8px_#C92A4B]'
                          : 'bg-white/[0.03] border-white/[0.06] text-[#BFA9B2] hover:text-[#FFB7D1]'
                      }`}
                      title="مفید نبود"
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span className="font-mono text-[11px]">{toPersianDigits(comment.dislikes_count)}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          BOTTOM PAGINATION CONTROLS
          ======================================================== */}
      <section className="glass-card p-4 md:p-5 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="icy-top-reflection" />
        
        <div className="text-xs text-[#BFA9B2] flex items-center gap-2">
          <span>نمایش صفحه</span>
          <strong className="text-[#FFB7D1] font-mono text-sm">{toPersianDigits(currentPage)}</strong>
          <span>از</span>
          <strong className="text-[#F8EEF2] font-mono">{toPersianDigits(totalPages)}</strong>
          <span>•</span>
          <span>(تعداد ۲۱ نظر در هر صفحه)</span>
        </div>

        {/* Page Nav Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage((p) => p - 1);
                window.scrollTo({ top: 180, behavior: 'smooth' });
              }
            }}
            disabled={currentPage <= 1 || isLoading}
            className="glass-btn text-xs px-3.5 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>صفحه قبلی</span>
          </button>

          {/* Page numbers (first few + active) */}
          <div className="hidden sm:flex items-center gap-1.5">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pNum = i + 1;
              const isActive = pNum === currentPage;
              return (
                <button
                  key={pNum}
                  onClick={() => {
                    setCurrentPage(pNum);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-[#800020] to-[#C92A4B] text-white border border-[#FFB7D1]/50 shadow-[0_0_14px_rgba(201,42,75,0.5)]'
                      : 'bg-white/[0.04] border border-white/[0.08] text-[#BFA9B2] hover:text-[#F8EEF2]'
                  }`}
                >
                  {toPersianDigits(pNum)}
                </button>
              );
            })}
            {totalPages > 5 && <span className="text-xs text-[#BFA9B2] px-1">...</span>}
          </div>

          <button
            onClick={() => {
              if (currentPage < totalPages) {
                setCurrentPage((p) => p + 1);
                window.scrollTo({ top: 180, behavior: 'smooth' });
              }
            }}
            disabled={currentPage >= totalPages || isLoading}
            className="glass-btn text-xs px-3.5 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <span>صفحه بعدی</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Comment Detail Modal */}
      {selectedComment && (
        <CommentDetailModal
          comment={selectedComment}
          onClose={() => setSelectedComment(null)}
        />
      )}
    </div>
  );
};

import React from 'react';
import {
  X,
  ThumbsUp,
  ThumbsDown,
  Star,
  CheckCircle,
  AlertOctagon,
  Sparkles,
  Store,
  Package,
  Calendar,
  User,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CommentItem } from '../types';
import { toPersianDigits } from '../utils/formatters';

interface CommentDetailModalProps {
  comment: CommentItem | null;
  onClose: () => void;
}

export const CommentDetailModal: React.FC<CommentDetailModalProps> = ({
  comment,
  onClose,
}) => {
  if (!comment) return null;

  const isPositive = comment.sentiment === 'positive';
  const isNegative = comment.sentiment === 'negative';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-2xl glass-card max-h-[90vh] overflow-y-auto p-6 md:p-8 border border-[rgba(255,255,255,0.12)] shadow-[0_25px_70px_rgba(143,18,57,0.45)]">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(255,255,255,0.08)] pb-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs text-[#FFB7D1] bg-[#8F1239]/25 px-2.5 py-0.5 rounded-lg border border-[#FFB7D1]/30">
                {comment.id}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  isPositive
                    ? 'badge-success'
                    : isNegative
                    ? 'badge-danger'
                    : 'badge-warning'
                }`}
              >
                {isPositive ? 'احساسات مثبت' : isNegative ? 'احساسات منفی / شکایت' : 'احساسات خنثی'}
              </span>
              {comment.is_buyer && (
                <span className="text-xs text-[#3ECF8E] bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 px-2 py-0.5 rounded-lg flex items-center gap-1 font-medium">
                  <CheckCircle className="w-3 h-3" />
                  خریدار تاییدشده
                </span>
              )}
              <span className="text-xs text-[#B8B0BA] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded-lg border border-[rgba(255,255,255,0.06)]">
                {comment.category}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs text-[#B8B0BA]">
              <span className="flex items-center gap-1 text-[#F7F5F8] font-medium">
                <User className="w-3.5 h-3.5 text-[#FFB7D1]" />
                {comment.user_name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#B8B0BA]" />
                {comment.created_at}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.1)] text-[#B8B0BA] hover:text-white transition-colors cursor-pointer border border-[rgba(255,255,255,0.06)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product & Seller context */}
        <div className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] mb-5 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Package className="w-4 h-4 text-[#FFB7D1] shrink-0" />
            <span className="text-[#B8B0BA]">کالا:</span>
            <span className="font-semibold text-[#F7F5F8]">{comment.product_title}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Store className="w-4 h-4 text-[#3ECF8E] shrink-0" />
            <span className="text-[#B8B0BA]">فروشنده:</span>
            <span className="font-medium text-[#F7F5F8]">{comment.seller_title}</span>
          </div>
        </div>

        {/* Stars and NLP Score Card */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] text-center">
            <span className="text-[11px] text-[#B8B0BA] block mb-1">امتیاز ثبت‌شده</span>
            <div className="flex items-center justify-center gap-1 text-amber-400">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < comment.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-mono font-bold text-[#F7F5F8] block mt-1">
              {toPersianDigits(comment.rating)} از ۵ ستاره
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] text-center">
            <span className="text-[11px] text-[#B8B0BA] block mb-1">امتیاز تحلیل NLP</span>
            <span
              className={`text-2xl font-black font-mono ${
                isPositive ? 'text-[#3ECF8E]' : isNegative ? 'text-[#FF85A2]' : 'text-amber-400'
              }`}
            >
              {toPersianDigits(comment.sentiment_score)}٪
            </span>
            <span className="text-[10px] text-[#B8B0BA] block mt-0.5">ضریب اطمینان مدل</span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] text-center flex flex-col justify-center">
            <span className="text-[11px] text-[#B8B0BA] block mb-1">توصیه خریدار</span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-lg ${
                comment.recommendation_status === 'recommended'
                  ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/40'
                  : comment.recommendation_status === 'not_recommended'
                  ? 'bg-[#8F1239]/30 text-[#FF85A2] border border-[#FF4D68]/40'
                  : 'bg-[rgba(255,255,255,0.06)] text-[#F7F5F8] border border-[rgba(255,255,255,0.1)]'
              }`}
            >
              {comment.recommendation_status === 'recommended'
                ? 'خرید را پیشنهاد می‌کنم'
                : comment.recommendation_status === 'not_recommended'
                ? 'خرید را پیشنهاد نمی‌کنم'
                : 'نظری ندارم'}
            </span>
          </div>
        </div>

        {/* Comment Title & Body */}
        <div className="space-y-3 mb-6">
          <h3 className="text-base font-bold text-[#F7F5F8] leading-snug">
            {comment.title}
          </h3>
          <p className="text-xs md:text-sm text-[#D8D4DA] leading-relaxed p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
            {comment.comment_text}
          </p>
        </div>

        {/* Pros & Cons */}
        {(comment.pros.length > 0 || comment.cons.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {/* Pros */}
            {comment.pros.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#3ECF8E]/5 border border-[#3ECF8E]/20">
                <span className="text-xs font-bold text-[#3ECF8E] flex items-center gap-1.5 mb-2">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  نقاط قوت ذکر شده:
                </span>
                <ul className="space-y-1.5 text-xs text-[#F7F5F8]">
                  {comment.pros.map((pro, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] shrink-0" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons */}
            {comment.cons.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#8F1239]/10 border border-[#FF4D68]/20">
                <span className="text-xs font-bold text-[#FF85A2] flex items-center gap-1.5 mb-2">
                  <ThumbsDown className="w-3.5 h-3.5" />
                  نقاط ضعف و ایرادات:
                </span>
                <ul className="space-y-1.5 text-xs text-[#F7F5F8]">
                  {comment.cons.map((con, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF85A2] shrink-0" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Likes / Dislikes Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.08)] text-xs text-[#B8B0BA]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#3ECF8E] font-mono">
              <ThumbsUp className="w-3.5 h-3.5" />
              {toPersianDigits(comment.likes_count)} نفر پسندیدند
            </span>
            <span className="flex items-center gap-1 text-[#FF85A2] font-mono">
              <ThumbsDown className="w-3.5 h-3.5" />
              {toPersianDigits(comment.dislikes_count)} نفر نپسندیدند
            </span>
          </div>

          <span className="text-[11px] text-[#B8B0BA]">
            شناسه ارزیابی هوش مصنوعی: <span className="font-mono text-[#FFB7D1]">NLP-PER-v2</span>
          </span>
        </div>
      </div>
    </div>
  );
};

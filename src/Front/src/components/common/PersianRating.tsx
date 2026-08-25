import React from 'react';
import { Star } from 'lucide-react';
import { toPersianDigits } from '../../utils/formatters';

interface PersianRatingProps {
  rating: number;
  maxStars?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
}

export const PersianRating: React.FC<PersianRatingProps> = ({
  rating,
  maxStars = 5,
  showScore = true,
  size = 'md',
  count,
}) => {
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;

  return (
    <div className="inline-flex items-center gap-1.5 direction-ltr">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starIndex = maxStars - 1 - index;
          const isFilled = rating >= starIndex + 1;
          const isHalf = !isFilled && rating > starIndex;

          return (
            <Star
              key={index}
              size={iconSize}
              className={`${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : isHalf
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-slate-200 fill-slate-100'
              } transition-colors`}
            />
          );
        })}
      </div>

      {showScore && (
        <span className="text-xs font-semibold text-slate-800 font-tabular ml-1">
          {toPersianDigits(rating.toFixed(1))}
        </span>
      )}

      {count !== undefined && (
        <span className="text-xs text-slate-400 font-tabular">({toPersianDigits(count)})</span>
      )}
    </div>
  );
};

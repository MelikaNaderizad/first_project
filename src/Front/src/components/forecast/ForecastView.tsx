import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  Search,
  AlertCircle,
  RefreshCw,
  Package,
  CalendarDays,
  Sparkles,
  Info,
  CheckCircle2,
  TrendingDown,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { apiClient } from '../../api/client';
import { ForecastProductListItem, ProductForecastResponse } from '../../types';
import { toPersianDigits, formatPersianNumber, formatPercent } from '../../utils/formatters';

const PERSIAN_MONTHS = [
  '',
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

interface MergedChartPoint {
  ds: string;
  year: number;
  month: number;
  label: string;
  actual?: number;
  backtestPredicted?: number;
  forecastPredicted?: number;
  backtestBand?: [number, number];
  forecastBand?: [number, number];
}

export const ForecastView: React.FC = () => {
  // Product list states
  const [products, setProducts] = useState<ForecastProductListItem[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Selected product forecast data states
  const [forecastData, setForecastData] = useState<ProductForecastResponse | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  // Fetch products list (with optional search)
  const fetchProducts = useCallback(async (search?: string) => {
    try {
      setIsProductsLoading(true);
      setProductsError(null);
      const res = await apiClient.getForecastProducts({ search: search?.trim() || undefined, limit: 50 });
      setProducts(res.products);

      // If we don't have a selected product or the current one is not in results, select first
      if (res.products.length > 0) {
        setSelectedProductId((prev) => {
          if (!prev || !res.products.some((p) => p.id === prev)) {
            return res.products[0].id;
          }
          return prev;
        });
      }
    } catch (err: any) {
      setProductsError(err?.message || 'خطا در دریافت لیست محصولات پیش‌بینی');
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounce search query (~400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchProducts]);

  // Fetch forecast for selected product
  const fetchForecastForProduct = useCallback(async (id: string | number) => {
    try {
      setIsForecastLoading(true);
      setForecastError(null);
      const res = await apiClient.getProductForecast(id);
      setForecastData(res);
    } catch (err: any) {
      setForecastError(err?.message || 'خطا در دریافت پیش‌بینی محصول');
      setForecastData(null);
    } finally {
      setIsForecastLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchForecastForProduct(selectedProductId);
    } else {
      setForecastData(null);
    }
  }, [selectedProductId, fetchForecastForProduct]);

  // Build merged chart data
  const { chartData, labelMap, firstBacktestDs, firstForecastDs } = useMemo(() => {
    if (!forecastData) {
      return {
        chartData: [] as MergedChartPoint[],
        labelMap: new Map<string, string>(),
        firstBacktestDs: undefined,
        firstForecastDs: undefined,
      };
    }

    const map = new Map<string, MergedChartPoint>();
    const labels = new Map<string, string>();

    // 1. History points
    for (const h of forecastData.history || []) {
      const monthName = PERSIAN_MONTHS[h.month] || '';
      const label = `${monthName} ${toPersianDigits(h.year)}`;
      labels.set(h.ds, label);
      map.set(h.ds, {
        ds: h.ds,
        year: h.year,
        month: h.month,
        label,
        actual: h.y,
      });
    }

    // 2. Backtest points
    for (const b of forecastData.backtest || []) {
      const existing = map.get(b.ds);
      const monthName = PERSIAN_MONTHS[b.month] || '';
      const label = existing?.label || `${monthName} ${toPersianDigits(b.year)}`;
      labels.set(b.ds, label);
      map.set(b.ds, {
        ds: b.ds,
        year: b.year,
        month: b.month,
        label,
        actual: b.actual, // keeps the actual curve continuous
        backtestPredicted: b.predicted,
        backtestBand: [b.lower, b.upper],
      });
    }

    // 3. Forecast future points
    for (const f of forecastData.forecast || []) {
      const existing = map.get(f.ds);
      const monthName = PERSIAN_MONTHS[f.month] || '';
      const label = existing?.label || `${monthName} ${toPersianDigits(f.year)}`;
      labels.set(f.ds, label);
      map.set(f.ds, {
        ds: f.ds,
        year: f.year,
        month: f.month,
        label,
        forecastPredicted: f.predicted,
        forecastBand: [f.lower, f.upper],
      });
    }

    // Sort chronologically by year and month
    const sorted = Array.from(map.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    const firstBacktest = forecastData.backtest?.[0]?.ds;
    const firstForecast = forecastData.forecast?.[0]?.ds;

    return {
      chartData: sorted,
      labelMap: labels,
      firstBacktestDs: firstBacktest,
      firstForecastDs: firstForecast,
    };
  }, [forecastData]);

  // Selected product details
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = chartData.find((p) => p.ds === label);
      const displayLabel = point?.label || labelMap.get(label) || label;

      return (
        <div
          dir="rtl"
          className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#E69DB8]/40 shadow-lg text-xs leading-relaxed text-right min-w-[210px]"
        >
          <div className="font-bold text-[#2D2327] mb-2.5 border-b border-[#F1E7E7] pb-1.5 flex items-center justify-between">
            <span>{displayLabel}</span>
            <span className="text-[10px] text-[#7A6670] font-mono">{toPersianDigits(label)}</span>
          </div>
          <div className="space-y-2 font-tabular">
            {point?.actual !== undefined && point.actual !== null && (
              <div className="flex items-center justify-between gap-4 text-[#2D2327] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2D2327]" />
                  کامنت‌های واقعی:
                </span>
                <span className="font-bold">{formatPersianNumber(point.actual)}</span>
              </div>
            )}

            {point?.backtestPredicted !== undefined && point.backtestPredicted !== null && (
              <div className="flex items-center justify-between gap-4 text-[#8C4E65] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E69DB8]" />
                  پیش‌بینی تست:
                </span>
                <span className="font-bold">{toPersianDigits(Number(point.backtestPredicted).toFixed(1))}</span>
              </div>
            )}

            {point?.forecastPredicted !== undefined && point.forecastPredicted !== null && (
              <div className="flex items-center justify-between gap-4 text-[#8C4E65] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8C4E65]" />
                  پیش‌بینی آینده:
                </span>
                <span className="font-bold">{toPersianDigits(Number(point.forecastPredicted).toFixed(1))}</span>
              </div>
            )}

            {point?.backtestBand && (
              <div className="text-[10px] text-[#7A6670] pt-1.5 border-t border-[#F1E7E7] flex justify-between">
                <span>بازه تخمین تست:</span>
                <span>
                  [{toPersianDigits(Number(point.backtestBand[0]).toFixed(1))} تا{' '}
                  {toPersianDigits(Number(point.backtestBand[1]).toFixed(1))}]
                </span>
              </div>
            )}

            {point?.forecastBand && (
              <div className="text-[10px] text-[#7A6670] pt-1.5 border-t border-[#F1E7E7] flex justify-between">
                <span>بازه تخمین آینده:</span>
                <span>
                  [{toPersianDigits(Number(point.forecastBand[0]).toFixed(1))} تا{' '}
                  {toPersianDigits(Number(point.forecastBand[1]).toFixed(1))}]
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Helper for event name
  const formatEventName = (name: string) => {
    if (name.toLowerCase() === 'nowruz') {
      return 'نوروز (اثر روی اسفند)';
    }
    return name;
  };

  // Helper for event coef
  const formatEventCoef = (coef: number) => {
    const sign = coef > 0 ? '+' : '';
    const num = toPersianDigits(Number(coef).toFixed(2));
    return `${sign}${num} کامنت اضافه در ماه رویداد`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ========================================================
          HERO BANNER: PRODUCT FORECAST HEADER
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFECE] text-[#8C4E65] text-xs font-semibold mb-3 border border-[#E69DB8]/30">
              <TrendingUp size={13} className="text-[#D88CA7]" />
              <span>مدل‌سازی سری زمانی و تحلیل تقاضا</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-[#2D2327] tracking-tight">
              پیشبینی روند نظرات محصول
            </h1>
            <p className="text-xs text-[#7A6670] mt-1.5">
              پیش‌بینی حجم کامنت‌ها و تقاضای آتی محصولات با الگوریتم‌های سری زمانی و ارزیابی خطا روی دوره آزمون
            </p>
          </div>

          {selectedProduct && (
            <div className="bg-[#F1E7E7]/50 rounded-2xl p-4 border border-[#E69DB8]/30 min-w-[240px]">
              <span className="text-[11px] font-semibold text-[#7A6670] block">محصول در حال تحلیل</span>
              <p className="text-sm font-bold text-[#2D2327] truncate mt-0.5" title={selectedProduct.title_fa}>
                {selectedProduct.title_fa}
              </p>
              <div className="flex items-center gap-3 text-xs text-[#7A6670] mt-1 font-tabular">
                <span>برند: <strong className="text-[#2D2327]">{selectedProduct.brand || 'نامشخص'}</strong></span>
                <span>•</span>
                <span>{formatPersianNumber(selectedProduct.total_comments)} نظر</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          PRODUCT SELECTOR BOX (SEARCH & CLICKABLE CARDS)
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#2D2327]">
            <Package size={18} className="text-[#8C4E65]" />
            <span>انتخاب کالا جهت مشاهده پیش‌بینی</span>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در بین محصولات پیش‌بینی‌شده..."
              className="w-full pl-9 pr-4 py-2 bg-[#F1E7E7]/40 border border-[#E69DB8]/30 rounded-xl text-xs text-[#2D2327] placeholder:text-[#7A6670] focus:outline-none focus:ring-2 focus:ring-[#E69DB8]/50"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6670]" />
          </div>
        </div>

        {/* Product Cards List */}
        {isProductsLoading ? (
          <div className="flex items-center justify-center py-8 gap-3 text-xs text-[#7A6670]">
            <div className="w-5 h-5 border-2 border-[#8C4E65] border-t-transparent rounded-full animate-spin" />
            <span>در حال بارگذاری لیست کالاهای دارای پیش‌بینی...</span>
          </div>
        ) : productsError ? (
          <div className="bg-[#FFD0C7]/30 border border-[#E69DB8]/50 rounded-2xl p-4 text-center">
            <p className="text-xs font-semibold text-[#8A253A] mb-2">{productsError}</p>
            <button
              onClick={() => fetchProducts(searchQuery)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2D2327] text-white text-xs font-medium hover:bg-[#8C4E65] transition cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>تلاش مجدد</span>
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-[#FFFECE]/70 border border-[#E69DB8]/40 rounded-2xl p-6 text-center">
            <AlertCircle size={24} className="text-[#8C4E65] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#2D2327] mb-1">
              هنوز پیشبینیای ساخته نشده است. ابتدا job پیشمحاسبه (<code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E69DB8]/30 text-[#8C4E65]">python -m forecast_prophet.run_batch</code>) اجرا شود.
            </p>
            {searchQuery && (
              <p className="text-[11px] text-[#7A6670] mt-1">
                کالایی با عبارت «{searchQuery}» یافت نشد. می‌توانید عبارت جستجو را پاک کنید.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
            {products.map((p) => {
              const isSelected = p.id === selectedProductId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`text-right p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#FFFECE]/90 border-[#8C4E65] shadow-xs ring-2 ring-[#E69DB8]/40'
                      : 'bg-white hover:bg-[#F1E7E7]/40 border-[#E69DB8]/30'
                  }`}
                >
                  <div>
                    <h3
                      className={`text-xs font-bold line-clamp-2 leading-relaxed ${
                        isSelected ? 'text-[#2D2327]' : 'text-[#2D2327]'
                      }`}
                      title={p.title_fa}
                    >
                      {p.title_fa}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-[#7A6670] mt-1.5 flex-wrap">
                      {p.brand && (
                        <span className="bg-[#F1E7E7]/80 px-2 py-0.5 rounded-md border border-[#E69DB8]/20">
                          {p.brand}
                        </span>
                      )}
                      {p.category1 && (
                        <span className="truncate max-w-[110px]" title={p.category1}>
                          {p.category1}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7A6670] mt-3 pt-2 border-t border-[#F1E7E7] font-tabular">
                    <span>{formatPersianNumber(p.total_comments)} نظر</span>
                    {p.mae > 0 && (
                      <span className="text-[#8C4E65] font-semibold">
                        خطا: {toPersianDigits(p.mae.toFixed(1))}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          FORECAST DETAILS & CONTENT AREA
          ======================================================== */}
      {isForecastLoading ? (
        <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-12 text-center shadow-xs">
          <div className="w-10 h-10 border-3 border-[#8C4E65] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-[#2D2327]">
            در حال دریافت پیش‌بینی و پردازش مدل سری زمانی...
          </p>
          <p className="text-[11px] text-[#7A6670] mt-1">محاسبه مقادیر تاریخی، ارزیابی تست و افق زمانی آینده</p>
        </div>
      ) : forecastError ? (
        <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-8 text-center shadow-xs max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD0C7]/50 text-[#8A253A] flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-sm font-bold text-[#2D2327] mb-1">خطا در بارگذاری پیش‌بینی کالا</h3>
          <p className="text-xs text-[#7A6670] mb-5">{forecastError}</p>
          {selectedProductId && (
            <button
              onClick={() => fetchForecastForProduct(selectedProductId)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D2327] text-white text-xs font-bold hover:bg-[#8C4E65] transition cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>تلاش مجدد</span>
            </button>
          )}
        </div>
      ) : forecastData ? (
        <>
          {/* ========================================================
              4 KPI CARDS (MAE, BASELINE MAE, IMPROVEMENT, RMSE)
              ======================================================== */}
          {(() => {
            const { mae, rmse, baseline_mean_mae } = forecastData.metrics || {
              mae: 0,
              rmse: 0,
              baseline_mean_mae: 0,
            };
            const baselineMae = Number(baseline_mean_mae || 0);
            const modelMae = Number(mae || 0);
            const improvement =
              baselineMae > 0 ? ((baselineMae - modelMae) / baselineMae) * 100 : 0;
            const isWorse = improvement < 0;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Model MAE */}
                <div className="bg-[#FFFECE]/80 rounded-2xl p-4 border border-[#BEDDC7]/60 shadow-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2B543B]">
                    <Activity size={14} className="text-[#3D704E]" />
                    <span>خطای مدل (MAE)</span>
                  </div>
                  <div className="text-2xl font-black text-[#2B543B] font-tabular mt-1.5">
                    {toPersianDigits(modelMae.toFixed(2))}
                  </div>
                  <div className="text-[11px] text-[#3D704E] mt-1">
                    میانگین انحراف مطلق پیش‌بینی
                  </div>
                </div>

                {/* 2. Baseline MAE */}
                <div className="bg-[#F1E7E7]/50 rounded-2xl p-4 border border-[#E69DB8]/30 shadow-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7A6670]">
                    <Layers size={14} className="text-[#8C4E65]" />
                    <span>خطای بیسلاین (میانگین ساده)</span>
                  </div>
                  <div className="text-2xl font-black text-[#2D2327] font-tabular mt-1.5">
                    {toPersianDigits(baselineMae.toFixed(2))}
                  </div>
                  <div className="text-[11px] text-[#7A6670] mt-1">
                    مبنای مقایسه (پیش‌بینی با میانگین تاریخی)
                  </div>
                </div>

                {/* 3. Improvement over Baseline */}
                {isWorse ? (
                  <div className="bg-[#FFD0C7]/45 rounded-2xl p-4 border border-[#E69DB8]/50 shadow-xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A253A]">
                      <TrendingDown size={14} className="text-[#B03A53]" />
                      <span>بهبود نسبت به بیسلاین</span>
                    </div>
                    <div className="text-2xl font-black text-[#8A253A] font-tabular mt-1.5">
                      {formatPercent(Math.abs(improvement), 1)}
                    </div>
                    <div className="text-[11px] text-[#B03A53] mt-1 font-bold">
                      بدتر از بیسلاین
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FFFECE]/80 rounded-2xl p-4 border border-[#BEDDC7]/60 shadow-xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2B543B]">
                      <CheckCircle2 size={14} className="text-[#3D704E]" />
                      <span>بهبود نسبت به بیسلاین</span>
                    </div>
                    <div className="text-2xl font-black text-[#2B543B] font-tabular mt-1.5">
                      {toPersianDigits(`+${improvement.toFixed(1)}٪`)}
                    </div>
                    <div className="text-[11px] text-[#3D704E] mt-1 font-semibold">
                      کاهش خطای مدل نسبت به میانگین
                    </div>
                  </div>
                )}

                {/* 4. RMSE */}
                <div className="bg-white rounded-2xl p-4 border border-[#E69DB8]/30 shadow-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7A6670]">
                    <Sparkles size={14} className="text-[#8C4E65]" />
                    <span>ریشه میانگین مربعات خطا (RMSE)</span>
                  </div>
                  <div className="text-2xl font-black text-[#2D2327] font-tabular mt-1.5">
                    {toPersianDigits(Number(rmse || 0).toFixed(2))}
                  </div>
                  <div className="text-[11px] text-[#7A6670] mt-1">
                    حساس به خطاهای بزرگ و نوسانات ناگهانی
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================
              FORECAST CHART (COMPOSED CHART IN LTR)
              ======================================================== */}
          <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 lg:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#2D2327] flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#8C4E65]" />
                  <span>نمودار روند نظرات، ارزیابی تست و پیش‌بینی آینده</span>
                </h2>
                <p className="text-xs text-[#7A6670] mt-1">
                  محور افقی از چپ به راست گذر زمان را نشان می‌دهد (ماه‌های شمسی)
                </p>
              </div>

              {forecastData.product?.title_fa && (
                <div className="text-xs font-semibold text-[#8C4E65] bg-[#FFFECE] px-3 py-1 rounded-full border border-[#E69DB8]/30 self-start sm:self-auto">
                  شناسه کالا: {toPersianDigits(forecastData.product_id)}
                </div>
              )}
            </div>

            {/* Chart inside div dir="ltr" so time flows left to right */}
            <div dir="ltr" className="w-full h-[380px]">
              <ResponsiveContainer width="100%" height={380}>
                <ComposedChart
                  data={chartData}
                  margin={{ top: 25, right: 25, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1E7E7" vertical={false} />
                  <XAxis
                    dataKey="ds"
                    tickFormatter={(ds) => labelMap.get(ds) || ds}
                    minTickGap={24}
                    interval="preserveStartEnd"
                    tick={{ fill: '#7A6670', fontSize: 11 }}
                    stroke="#E69DB8"
                    strokeOpacity={0.4}
                  />
                  <YAxis
                    tickFormatter={(val) => toPersianDigits(val)}
                    tick={{ fill: '#7A6670', fontSize: 11 }}
                    stroke="#E69DB8"
                    strokeOpacity={0.4}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Uncertainty Bands */}
                  <Area
                    type="monotone"
                    dataKey="backtestBand"
                    stroke="none"
                    fill="#E69DB8"
                    fillOpacity={0.25}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="forecastBand"
                    stroke="none"
                    fill="#8C4E65"
                    fillOpacity={0.2}
                    isAnimationActive={false}
                  />

                  {/* Vertical Reference Lines */}
                  {firstBacktestDs && (
                    <ReferenceLine
                      x={firstBacktestDs}
                      stroke="#E69DB8"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'شروع دوره تست',
                        position: 'top',
                        fill: '#8C4E65',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {firstForecastDs && (
                    <ReferenceLine
                      x={firstForecastDs}
                      stroke="#8C4E65"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'شروع پیش‌بینی',
                        position: 'top',
                        fill: '#8C4E65',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  )}

                  {/* Actual Continuous Line */}
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="واقعی"
                    stroke="#2D2327"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#2D2327', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#2D2327' }}
                  />

                  {/* Backtest Predicted Line (Dashed) */}
                  <Line
                    type="monotone"
                    dataKey="backtestPredicted"
                    name="پیش‌بینی دوره تست"
                    stroke="#E69DB8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: '#E69DB8', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#E69DB8' }}
                  />

                  {/* Future Forecast Line */}
                  <Line
                    type="monotone"
                    dataKey="forecastPredicted"
                    name="پیش‌بینی آینده"
                    stroke="#8C4E65"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#8C4E65', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#8C4E65' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Manual Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 border-t border-[#F1E7E7] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-0.5 bg-[#2D2327] rounded-full inline-block" />
                <span className="text-[#2D2327] font-semibold">داده واقعی (تاریخچه و تست)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-0.5 border-t-2 border-dashed border-[#E69DB8] inline-block" />
                <span className="text-[#8C4E65] font-semibold">پیش‌بینی دوره تست</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-0.5 bg-[#8C4E65] rounded-full inline-block" />
                <span className="text-[#8C4E65] font-semibold">پیش‌بینی آینده</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-[#E69DB8]/30 border border-[#E69DB8] rounded-xs inline-block" />
                <span className="text-[#7A6670]">بازه تخمین مدل (عدم قطعیت)</span>
              </div>
            </div>
          </div>

          {/* ========================================================
              EVENT EFFECTS SECTION
              ======================================================== */}
          {forecastData.events && forecastData.events.length > 0 && (
            <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-[#2D2327] mb-3">
                <CalendarDays size={18} className="text-[#8C4E65]" />
                <span>اثر تقویمی رویدادها بر حجم نظرات</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {forecastData.events.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#FFFECE]/70 border border-[#E69DB8]/30 flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-[#2D2327]">
                      {formatEventName(ev.name)}
                    </span>
                    <span className="text-xs font-semibold text-[#8C4E65] mt-1.5 font-tabular">
                      {formatEventCoef(ev.coef)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              MANDATORY EXPLANATORY NOTES
              ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-5 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFFECE] text-[#8C4E65] flex items-center justify-center shrink-0 mt-0.5 border border-[#E69DB8]/30">
                <Info size={16} />
              </div>
              <p className="text-xs leading-relaxed text-[#7A6670]">
                این پیشبینی بر اساس تعداد کامنت ماهانهی خریداران است و تقریبی از حجم فروش محسوب میشود، نه فروش واقعی.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-5 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFFECE] text-[#8C4E65] flex items-center justify-center shrink-0 mt-0.5 border border-[#E69DB8]/30">
                <Info size={16} />
              </div>
              <p className="text-xs leading-relaxed text-[#7A6670]">
                بازهی رنگی یک بازهی تقریبی است و تضمین پوشش ۸۰٪ ندارد.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-5 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFFECE] text-[#8C4E65] flex items-center justify-center shrink-0 mt-0.5 border border-[#E69DB8]/30">
                <Info size={16} />
              </div>
              <p className="text-xs leading-relaxed text-[#7A6670]">
                خط پیشبینی دورهی تست با مدلی ساخته شده که فقط دادهی قبل از تست را دیده است. پیشبینی آینده با مدلی روی کل داده ساخته شده است؛ بنابراین ممکن است بین این دو بخش تفاوت سطح دیده شود.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

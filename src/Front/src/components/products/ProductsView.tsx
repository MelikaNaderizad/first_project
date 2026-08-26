import React, { useState } from "react";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Star,
  Search,
  ArrowUpDown,
  Tag,
  Store,
  Layers,
  ShieldCheck,
  ShieldAlert,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { ProductsResponse, ProductItem } from "../../types";
import { StatusBadge } from "../common/StatusBadge";
import { PersianRating } from "../common/PersianRating";
import {
  toPersianDigits,
  formatPersianNumber,
  formatPercent,
  formatToman,
} from "../../utils/formatters";

interface ProductsViewProps {
  data: ProductsResponse;
  onFilterChange: (filters: {
    page?: number;
    pageSize?: number;
    status?: string;
    category?: string;
    search?: string;
    sort?: string;
  }) => void;
  isLoading: boolean;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  data,
  onFilterChange,
  isLoading,
}) => {
  const { metrics, categoryBreakdown, products } = data;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("rate_desc");
  const [selectedProductDetail, setSelectedProductDetail] =
    useState<ProductItem | null>(null);
  const [currentPage, setCurrentPage] = useState(data.page || 1);
  const PAGE_SIZE = 50;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      search: searchQuery,
      status: selectedStatus,
      category: selectedCategory,
      sort: selectedSort,
    });
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    onFilterChange({
      status,
      category: selectedCategory,
      search: searchQuery,
      sort: selectedSort,
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onFilterChange({
      status: selectedStatus,
      category,
      search: searchQuery,
      sort: selectedSort,
    });
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    onFilterChange({
      status: selectedStatus,
      category: selectedCategory,
      search: searchQuery,
      sort,
    });
  };

  const handlePageChange = (page: number) => {
    const totalPages = data.totalPages || 1;

    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);

    onFilterChange({
      page,
      pageSize: PAGE_SIZE,
      status: selectedStatus,
      category: selectedCategory,
      search: searchQuery,
      sort: selectedSort,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ========================================================
          HERO KPI: TOTAL PRODUCTS & REAL PRODUCT METRICS
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 lg:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Massive KPI */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-l border-[#F1E7E7] pb-6 lg:pb-0 lg:pl-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFECE] text-[#8C4E65] text-xs font-semibold mb-3 border border-[#E69DB8]/30">
              <Package size={13} className="text-[#D88CA7]" />
              <span>پایش کاتالوگ و محصولات</span>
            </div>
            <h1 className="text-xs font-bold text-[#7A6670]">
              تعداد کل کالاهای کاتالوگ
            </h1>
            <div className="text-4xl lg:text-5xl font-black text-[#2D2327] tracking-tight font-tabular mt-1.5">
              {toPersianDigits(metrics.total_products)}
            </div>
            <p className="text-xs text-[#7A6670] mt-2">
              محصولات فعال در دسته‌بندی‌های مختلف بازارگاه
            </p>
          </div>

          {/* 4 Secondary KPIs */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Successful products */}
            <div className="bg-[#FFFECE]/80 rounded-2xl p-4 border border-[#BEDDC7]/60">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2B543B]">
                <CheckCircle2 size={14} className="text-[#3D704E]" />
                <span>محصولات برتر</span>
              </div>
              <div className="text-2xl font-black text-[#2B543B] font-tabular mt-1.5">
                {toPersianDigits(metrics.successful_products)}
              </div>
              <div className="text-[11px] text-[#3D704E] mt-1 font-tabular">
                {formatPercent(
                  (metrics.successful_products /
                    (metrics.total_products || 1)) *
                    100,
                  0,
                )}{" "}
                کاتالوگ محصولات
              </div>
            </div>

            {/* Unsuccessful products */}
            <div className="bg-[#FFD0C7]/45 rounded-2xl p-4 border border-[#E69DB8]/50">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A253A]">
                <AlertTriangle size={14} className="text-[#B03A53]" />
                <span>محصولات ناموفق</span>
              </div>
              <div className="text-2xl font-black text-[#8A253A] font-tabular mt-1.5">
                {toPersianDigits(metrics.unsuccessful_products)}
              </div>
              <div className="text-[11px] text-[#B03A53] mt-1 font-tabular">
                نیازمند بازبینی و ارزیابی
              </div>
            </div>

            {/* Avg Rating */}
            <div className="bg-[#F1E7E7]/50 rounded-2xl p-4 border border-[#E69DB8]/20">
              <div className="text-[11px] font-semibold text-[#7A6670]">
                میانگین امتیاز کیفی
              </div>
              <div className="text-2xl font-black text-[#2D2327] font-tabular mt-1.5">
                {toPersianDigits(metrics.avg_rating)}
              </div>
              <div className="text-[11px] text-[#7A6670] mt-1">
                از ۵ ستاره کیفی
              </div>
            </div>

            {/* Fake products count */}
            <div className="bg-[#F1E7E7]/50 rounded-2xl p-4 border border-[#E69DB8]/20">
              <div className="text-[11px] font-semibold text-[#7A6670]">
                کالاهای غیراصل شناسایی‌شده
              </div>
              <div className="text-2xl font-black text-[#8C4E65] font-tabular mt-1.5">
                {toPersianDigits(metrics.fake_products_count)}
              </div>
              <div className="text-[11px] text-[#7A6670] mt-1">
                مشخص‌شده با برچسب غیراصل
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          CATEGORY BREAKDOWN MATRIX (SUCCESSFUL VS UNSUCCESSFUL)
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 p-6 shadow-xs">
        <h3 className="text-sm font-extrabold text-[#2D2327] mb-1">
          تفکیک وضعیت موفق و ناموفق کالاها در دسته‌بندی‌ها
        </h3>
        <p className="text-xs text-[#7A6670] mb-6">
          نسبت کالاهای استاندارد در برابر کالاهای نیازمند بازنگری در هر شاخه
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryBreakdown.map((cat, idx) => (
            <div
              key={idx}
              className="bg-[#F1E7E7]/40 rounded-2xl p-4 border border-[#E69DB8]/20 space-y-3 hover:bg-[#F1E7E7]/70 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#2D2327] flex items-center gap-1.5">
                  <Layers size={14} className="text-[#D88CA7]" />
                  {cat.name}
                </span>
                <span className="text-[11px] font-bold text-[#8C4E65] font-tabular">
                  {toPersianDigits(cat.total)} کالا
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-white rounded-full overflow-hidden flex border border-[#E69DB8]/20">
                <div
                  className="bg-[#3D704E] h-full rounded-r-full transition-all"
                  style={{
                    width: `${(cat.successful / (cat.total || 1)) * 100}%`,
                  }}
                />
                <div
                  className="bg-[#B03A53] h-full rounded-l-full transition-all"
                  style={{
                    width: `${(cat.unsuccessful / (cat.total || 1)) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] font-tabular">
                <span className="text-[#2B543B] font-bold">
                  {toPersianDigits(cat.successful)} موفق
                </span>
                <span className="text-[#8A253A] font-bold">
                  {toPersianDigits(cat.unsuccessful)} ناموفق
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          FILTER & SEARCH TOOLBAR
          ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#E69DB8]/30 p-4 shadow-xs">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col md:flex-row gap-3 items-center justify-between"
        >
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search
              size={16}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A6670]"
            />
            <input
              type="text"
              placeholder="جستجوی نام کالا، برند، فروشنده یا زیردسته..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-xs bg-[#F1E7E7]/40 border border-[#E69DB8]/30 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#E69DB8] focus:bg-white transition-all text-[#2D2327] placeholder:text-[#7A6670]"
            />
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-[#F1E7E7]/80 p-1 rounded-xl text-xs font-medium border border-[#E69DB8]/20">
              {[
                { id: "all", label: "همه" },
                { id: "successful", label: "محصولات برتر" },
                { id: "unsuccessful", label: "نیازمند بهبود" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleStatusChange(tab.id)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedStatus === tab.id
                      ? "bg-white text-[#2D2327] font-bold shadow-xs border border-[#E69DB8]/30"
                      : "text-[#5B4852] hover:text-[#2D2327]"
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
              <option value="all">همه دسته‌ها</option>
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
                <option value="rate_desc">بیشترین امتیاز</option>
                <option value="rate_cnt_desc">بیشترین تعداد امتیازها</option>
                <option value="bayesian_desc">بالاترین امتیاز بیزین</option>
                <option value="health_desc">بالاترین سلامت محصول</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* ========================================================
          REAL PRODUCT CATALOG TABLE
          ======================================================== */}
      <div className="bg-white rounded-3xl border border-[#E69DB8]/30 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#F1E7E7] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#2D2327]">
              ماتریس تحلیلی کاتالوگ محصولات ({toPersianDigits(products.length)}{" "}
              مورد)
            </h3>
            <p className="text-xs text-[#7A6670] mt-0.5">
              پایش فیلدهای واقعی شامل برند، دسته‌بندی، زیردسته، قیمت، اصالت،
              امتیاز و وضعیت
            </p>
          </div>
          {isLoading && (
            <span className="text-xs text-[#E69DB8] font-bold animate-pulse">
              در حال دریافت داده‌ها...
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#F1E7E7]/50 border-b border-[#E69DB8]/20 text-[#5B4852] font-bold">
                <th className="py-3.5 px-6">محصول و تصویر</th>
                <th className="py-3.5 px-4">برند</th>
                <th className="py-3.5 px-4">دسته و زیردسته</th>
                <th className="py-3.5 px-4">فروشنده</th>
                <th className="py-3.5 px-4 text-center">قیمت فعلی</th>
                <th className="py-3.5 px-4 text-center">حداقل ماه قبل</th>
                <th className="py-3.5 px-4 text-center">امتیاز و تعداد</th>
                <th className="py-3.5 px-4 text-center">اصالت</th>
                <th className="py-3.5 px-6 text-center">وضعیت عملکرد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1E7E7]">
              {products.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => setSelectedProductDetail(product)}
                  className="hover:bg-[#F1E7E7]/30 transition-colors cursor-pointer group"
                >
                  {/* Product Title & Thumbnail */}
                  <td className="py-4 px-6 max-w-xs">
                    <div className="flex items-center gap-3">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.title_fa}
                          className="w-11 h-11 rounded-xl object-cover border border-[#E69DB8]/30 shrink-0"
                        />
                      )}
                      <div>
                        <div className="font-bold text-[#2D2327] group-hover:text-[#8C4E65] transition-colors line-clamp-1">
                          {product.title_fa}
                        </div>
                        <span className="text-[10px] text-[#7A6670] font-mono mt-0.5 block">
                          شناسه: {product.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Brand */}
                  <td className="py-4 px-4 text-[#5B4852] font-semibold whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 bg-[#F1E7E7]/60 px-2 py-0.5 rounded-md border border-[#E69DB8]/20">
                      <Tag size={11} className="text-[#D88CA7]" />
                      <span>{product.brand}</span>
                    </span>
                  </td>

                  {/* Category & Sub-category */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-bold text-[#8C4E65] bg-[#FFFECE] px-2 py-0.5 rounded-md border border-[#E69DB8]/30 inline-block text-[11px]">
                      {product.category1}
                    </div>
                    {product.sub_category && (
                      <div className="text-[11px] text-[#7A6670] mt-0.5">
                        {product.sub_category}
                      </div>
                    )}
                  </td>

                  {/* Seller */}
                  <td className="py-4 px-4 text-[#5B4852] font-medium whitespace-nowrap">
                    <div className="font-bold text-[#2D2327] flex items-center gap-1">
                      <Store size={12} className="text-[#D88CA7]" />
                      <span>{product.seller}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4 text-center font-bold text-[#2D2327] font-tabular whitespace-nowrap">
                    {formatToman(product.price)}
                  </td>

                  {/* Min Price Last Month */}
                  <td className="py-4 px-4 text-center text-[#7A6670] font-tabular whitespace-nowrap">
                    {formatToman(product.min_price_last_month)}
                  </td>

                  {/* Rating & Rate Count */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <PersianRating rating={product.rate} size="sm" />
                    <div className="text-[10px] text-[#7A6670] font-tabular mt-0.5">
                      ({formatPersianNumber(product.rate_cnt)} رأی)
                    </div>
                  </td>

                  {/* Is Fake */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    {product.is_fake ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A253A] bg-[#FFD0C7]/50 px-2 py-0.5 rounded-md border border-[#E69DB8]/50">
                        <ShieldAlert size={12} className="text-[#B03A53]" />
                        <span>غیراصل</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2B543B] bg-[#FFFECE] px-2 py-0.5 rounded-md border border-[#BEDDC7]">
                        <ShieldCheck size={12} className="text-[#3D704E]" />
                        <span>اورجینال</span>
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6 text-center">
                    <StatusBadge
                      status={product.product_status || "successful"}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL DETAIL VIEW
          ======================================================== */}
      {selectedProductDetail && (
        <div className="fixed inset-0 bg-[#2D2327]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E69DB8]/40 animate-scale-up">
            <div className="flex items-start justify-between border-b border-[#F1E7E7] pb-4 mb-4">
              <div className="flex items-center gap-3">
                {selectedProductDetail.image && (
                  <img
                    src={selectedProductDetail.image}
                    alt={selectedProductDetail.title_fa}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#E69DB8]/30 shrink-0"
                  />
                )}
                <div>
                  <h3 className="text-sm font-extrabold text-[#2D2327] line-clamp-1">
                    {selectedProductDetail.title_fa}
                  </h3>
                  <p className="text-xs text-[#7A6670] mt-0.5">
                    برند: {selectedProductDetail.brand} • فروشنده:{" "}
                    {selectedProductDetail.seller}
                  </p>
                </div>
              </div>
              <StatusBadge
                status={selectedProductDetail.product_status || "successful"}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
              <div className="bg-[#F1E7E7]/40 p-3 rounded-xl border border-[#E69DB8]/20">
                <span className="text-[#7A6670]">قیمت فروش جاری:</span>
                <p className="font-bold text-[#2D2327] font-tabular mt-1">
                  {formatToman(selectedProductDetail.price)}
                </p>
              </div>
              <div className="bg-[#F1E7E7]/40 p-3 rounded-xl border border-[#E69DB8]/20">
                <span className="text-[#7A6670]">حداقل قیمت ۳۰ روز قبل:</span>
                <p className="font-bold text-[#2D2327] font-tabular mt-1">
                  {formatToman(selectedProductDetail.min_price_last_month)}
                </p>
              </div>
              <div className="bg-[#FFFECE]/80 p-3 rounded-xl border border-[#BEDDC7]/60">
                <span className="text-[#2B543B]">امتیاز بیزین کیفی:</span>
                <p className="font-bold text-[#2B543B] font-tabular mt-1">
                  {toPersianDigits(
                    selectedProductDetail.bayesian_product_score ||
                      selectedProductDetail.rate,
                  )}{" "}
                  از ۵
                </p>
              </div>
              <div className="bg-[#F1E7E7]/40 p-3 rounded-xl border border-[#E69DB8]/20">
                <span className="text-[#7A6670]">امتیاز سلامت محصول:</span>
                <p className="font-bold text-[#8C4E65] font-tabular mt-1">
                  {toPersianDigits(
                    selectedProductDetail.product_health_score || 90,
                  )}{" "}
                  از ۱۰۰
                </p>
              </div>
              <div className="bg-[#F1E7E7]/40 p-3 rounded-xl border border-[#E69DB8]/20">
                <span className="text-[#7A6670]">دسته‌بندی اصلی / فرعی:</span>
                <p className="font-bold text-[#2D2327] mt-1 truncate">
                  {selectedProductDetail.category1} /{" "}
                  {selectedProductDetail.sub_category}
                </p>
              </div>
              <div className="bg-[#F1E7E7]/40 p-3 rounded-xl border border-[#E69DB8]/20">
                <span className="text-[#7A6670]">اصالت کالا:</span>
                <p className="font-bold text-[#2D2327] mt-1">
                  {selectedProductDetail.is_fake
                    ? "کالای غیراصل (تقلبی)"
                    : "کالای اصل و اورجینال"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedProductDetail(null)}
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

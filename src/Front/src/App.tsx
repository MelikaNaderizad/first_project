import React, { useState, useEffect, useCallback } from "react";
import {
  NavSection,
  OverviewData,
  CommentsResponse,
  SellersResponse,
  ProductsResponse,
} from "./types";
import { apiClient } from "./api/client";
import { Sidebar } from "./components/layout/Sidebar";
import { Navbar } from "./components/layout/Navbar";
import { OverviewView } from "./components/dashboard/OverviewView";
import { CommentsView } from "./components/comments/CommentsView";
import { SellersView } from "./components/sellers/SellersView";
import { ProductsView } from "./components/products/ProductsView";
import { ChatbotComingSoonView } from "./components/chatbot/ChatbotComingSoonView";
import { AlertCircle, RefreshCw } from "lucide-react";

type Cursor = string | number | null;

export default function App() {
  const [currentSection, setCurrentSection] = useState<NavSection>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data states
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [commentsData, setCommentsData] = useState<CommentsResponse | null>(
    null,
  );
  const [sellersData, setSellersData] = useState<SellersResponse | null>(null);
  const [productsData, setProductsData] = useState<ProductsResponse | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states (بدون page/cursor - فقط معیارهای فیلتر)
  const [commentsFilters, setCommentsFilters] = useState<{
    sentiment?: string;
    rating?: string;
    category?: string;
    search?: string;
  }>({});

  const [sellersFilters, setSellersFilters] = useState<{
    status?: string;
    category?: string;
    search?: string;
    sort?: string;
  }>({});

  const [productsFilters, setProductsFilters] = useState<{
    status?: string;
    category?: string;
    search?: string;
    sort?: string;
  }>({});

  // Cursor state + history stack (برای دکمه "قبلی")
  const [commentsCursor, setCommentsCursor] = useState<Cursor>(null);
  const [commentsCursorHistory, setCommentsCursorHistory] = useState<Cursor[]>(
    [],
  );

  const [sellersCursor, setSellersCursor] = useState<Cursor>(null);
  const [sellersCursorHistory, setSellersCursorHistory] = useState<Cursor[]>(
    [],
  );

  const [productsCursor, setProductsCursor] = useState<Cursor>(null);
  const [productsCursorHistory, setProductsCursorHistory] = useState<Cursor[]>(
    [],
  );

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [overviewRes, commentsRes, sellersRes, productsRes] =
        await Promise.all([
          apiClient.getOverview(),
          apiClient.getComments({ ...commentsFilters, cursor: null }),
          apiClient.getSellers({ ...sellersFilters, cursor: null }),
          apiClient.getProducts({ ...productsFilters, cursor: null }),
        ]);

      setOverviewData(overviewRes);
      setCommentsData(commentsRes);
      setSellersData(sellersRes);
      setProductsData(productsRes);

      setCommentsCursor(null);
      setCommentsCursorHistory([]);
      setSellersCursor(null);
      setSellersCursorHistory([]);
      setProductsCursor(null);
      setProductsCursorHistory([]);
    } catch (err: any) {
      console.error("Data fetch error:", err);
      setError(err.message || "خطا در برقراری ارتباط با سرور تحلیل داده‌ها");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
     COMMENTS
  ========================================================= */
  const handleCommentsFilter = async (filters: {
    sentiment?: string;
    rating?: string;
    category?: string;
    search?: string;
  }) => {
    const merged = { ...commentsFilters, ...filters };
    setCommentsFilters(merged);
    setCommentsCursor(null);
    setCommentsCursorHistory([]);

    try {
      setIsLoading(true);
      const res = await apiClient.getComments({ ...merged, cursor: null });
      setCommentsData(res);
    } catch (err: any) {
      console.error("Comments filter error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentsNext = async () => {
    if (!commentsData?.has_next || commentsData.next_cursor == null) return;
    const nextCursor = commentsData.next_cursor;

    try {
      setIsLoading(true);
      setCommentsCursorHistory((prev) => [...prev, commentsCursor]);
      setCommentsCursor(nextCursor);
      const res = await apiClient.getComments({
        ...commentsFilters,
        cursor: nextCursor,
      });
      setCommentsData(res);
    } catch (err: any) {
      console.error("Comments next page error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentsPrev = async () => {
    if (commentsCursorHistory.length === 0) return;
    const newHistory = [...commentsCursorHistory];
    const prevCursor = newHistory.pop() ?? null;

    try {
      setIsLoading(true);
      setCommentsCursorHistory(newHistory);
      setCommentsCursor(prevCursor);
      const res = await apiClient.getComments({
        ...commentsFilters,
        cursor: prevCursor,
      });
      setCommentsData(res);
    } catch (err: any) {
      console.error("Comments prev page error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     SELLERS
  ========================================================= */
  const handleSellersFilter = async (filters: {
    status?: string;
    category?: string;
    search?: string;
    sort?: string;
  }) => {
    const merged = { ...sellersFilters, ...filters };
    setSellersFilters(merged);
    setSellersCursor(null);
    setSellersCursorHistory([]);

    try {
      setIsLoading(true);
      const res = await apiClient.getSellers({ ...merged, cursor: null });
      setSellersData(res);
    } catch (err: any) {
      console.error("Sellers filter error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellersNext = async () => {
    if (!sellersData?.has_next || sellersData.next_cursor == null) return;
    const nextCursor = sellersData.next_cursor;

    try {
      setIsLoading(true);
      setSellersCursorHistory((prev) => [...prev, sellersCursor]);
      setSellersCursor(nextCursor);
      const res = await apiClient.getSellers({
        ...sellersFilters,
        cursor: nextCursor,
      });
      setSellersData(res);
    } catch (err: any) {
      console.error("Sellers next page error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellersPrev = async () => {
    if (sellersCursorHistory.length === 0) return;
    const newHistory = [...sellersCursorHistory];
    const prevCursor = newHistory.pop() ?? null;

    try {
      setIsLoading(true);
      setSellersCursorHistory(newHistory);
      setSellersCursor(prevCursor);
      const res = await apiClient.getSellers({
        ...sellersFilters,
        cursor: prevCursor,
      });
      setSellersData(res);
    } catch (err: any) {
      console.error("Sellers prev page error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     PRODUCTS
  ========================================================= */
  const handleProductsFilter = async (filters: {
    status?: string;
    category?: string;
    search?: string;
    sort?: string;
  }) => {
    const merged = { ...productsFilters, ...filters };
    setProductsFilters(merged);
    setProductsCursor(null);
    setProductsCursorHistory([]);

    try {
      setIsLoading(true);
      const res = await apiClient.getProducts({ ...merged, cursor: null });
      setProductsData(res);
    } catch (err: any) {
      console.error("Products filter error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductsNext = async () => {
    if (!productsData?.has_next || productsData.next_cursor == null) return;
    const nextCursor = productsData.next_cursor;

    try {
      setIsLoading(true);
      setProductsCursorHistory((prev) => [...prev, productsCursor]);
      setProductsCursor(nextCursor);
      const res = await apiClient.getProducts({
        ...productsFilters,
        cursor: nextCursor,
      });
      setProductsData(res);
    } catch (err: any) {
      console.error("Products next page error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductsPrev = async () => {
    if (productsCursorHistory.length === 0) return;
    const newHistory = [...productsCursorHistory];
    const prevCursor = newHistory.pop() ?? null;

    try {
      setIsLoading(true);
      setProductsCursorHistory(newHistory);
      setProductsCursor(prevCursor);
      const res = await apiClient.getProducts({
        ...productsFilters,
        cursor: prevCursor,
      });
      setProductsData(res);
    } catch (err: any) {
      console.error("Products prev page error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSectionTitle = () => {
    switch (currentSection) {
      case "dashboard":
        return "نمای کلی داشبورد تحلیلی";
      case "comments":
        return "تحلیل عمیق نظرات و بازخوردها";
      case "sellers":
        return "پایش عملکرد و کیفیت فروشندگان";
      case "products":
        return "تحلیل کاتالوگ و رضایت محصولات";
      case "chatbot":
        return "دستیار هوشمند تحلیلی AI";
      default:
        return "داشبورد";
    }
  };

  return (
    <div className="min-h-screen bg-[#F1E7E7] text-[#2D2327] flex flex-col font-sans antialiased selection:bg-[#E69DB8] selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(section) => setCurrentSection(section)}
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        totalComments={
          overviewData?.kpis?.total_comments ??
          commentsData?.totalCount ??
          commentsData?.metrics?.total_comments
        }
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col lg:mr-64 transition-all duration-300 min-w-0">
        {/* Top Navbar */}
        <Navbar
          activeSectionTitle={getSectionTitle()}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onRefresh={fetchData}
          isLoading={isLoading}
        />

        {/* View Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {error ? (
            <div className="bg-white rounded-3xl border border-rose-100 p-8 text-center max-w-lg mx-auto mt-12 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                خطا در بارگذاری داده‌ها
              </h3>
              <p className="text-xs text-slate-500 mb-6">{error}</p>
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>تلاش مجدد</span>
              </button>
            </div>
          ) : isLoading && !overviewData ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-500">
                در حال دریافت و تحلیل شاخص‌های کسب‌وکار...
              </p>
            </div>
          ) : (
            <>
              {currentSection === "dashboard" && overviewData && (
                <OverviewView
                  data={overviewData}
                  onNavigateToComments={() => setCurrentSection("comments")}
                  onNavigateToSellers={() => setCurrentSection("sellers")}
                  onNavigateToProducts={() => setCurrentSection("products")}
                />
              )}

              {currentSection === "comments" && commentsData && (
                <CommentsView
                  data={commentsData}
                  onFilterChange={handleCommentsFilter}
                  onNextPage={handleCommentsNext}
                  onPrevPage={handleCommentsPrev}
                  hasPrevPage={commentsCursorHistory.length > 0}
                  isLoading={isLoading}
                />
              )}

              {currentSection === "sellers" && sellersData && (
                <SellersView
                  data={sellersData}
                  onFilterChange={handleSellersFilter}
                  onNextPage={handleSellersNext}
                  onPrevPage={handleSellersPrev}
                  hasPrevPage={sellersCursorHistory.length > 0}
                  isLoading={isLoading}
                />
              )}

              {currentSection === "products" && productsData && (
                <ProductsView
                  data={productsData}
                  onFilterChange={handleProductsFilter}
                  onNextPage={handleProductsNext}
                  onPrevPage={handleProductsPrev}
                  hasPrevPage={productsCursorHistory.length > 0}
                  isLoading={isLoading}
                />
              )}

              {currentSection === "chatbot" && <ChatbotComingSoonView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

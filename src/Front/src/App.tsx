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

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ابتدا overview که سبک‌تره لود می‌شه
      const overviewRes = await apiClient.getOverview();
      setOverviewData(overviewRes);

      // بقیه به‌صورت موازی ولی جدا از هم لود می‌شن تا خطای یکی مانع بقیه نشه
      // و تایپ هرکدوم دقیقاً با ستر مربوطه match باشه
      await Promise.all([
        apiClient
          .getComments()
          .then(setCommentsData)
          .catch((e) => console.error("Comments fetch error:", e)),
        apiClient
          .getSellers()
          .then(setSellersData)
          .catch((e) => console.error("Sellers fetch error:", e)),
        apiClient
          .getProducts()
          .then(setProductsData)
          .catch((e) => console.error("Products fetch error:", e)),
      ]);
    } catch (err: any) {
      console.error("Data fetch error:", err);
      setError(err.message || "خطا در برقراری ارتباط با سرور تحلیل داده‌ها");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler for comments filters
  const handleCommentsFilter = async (filters: {
    sentiment?: string;
    rating?: string;
    category?: string;
    search?: string;
  }) => {
    try {
      setIsLoading(true);
      const res = await apiClient.getComments(filters);
      setCommentsData(res);
    } catch (err: any) {
      console.error("Comments filter error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for sellers filters
  const handleSellersFilter = async (filters: {
    status?: string;
    category?: string;
    search?: string;
    sort?: string;
  }) => {
    try {
      setIsLoading(true);
      const res = await apiClient.getSellers(filters);
      setSellersData(res);
    } catch (err: any) {
      console.error("Sellers filter error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for products filters
  const handleProductsFilter = async (filters: {
    page?: number;
    pageSize?: number;
    status?: string;
    category?: string;
    search?: string;
    sort?: string;
  }) => {
    try {
      setIsLoading(true);
      const res = await apiClient.getProducts(filters);
      setProductsData(res);
    } catch (err: any) {
      console.error("Products filter error:", err);
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
        return "دستیار هوشمند AI (به‌زودی)";
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
                  isLoading={isLoading}
                />
              )}

              {currentSection === "sellers" && sellersData && (
                <SellersView
                  data={sellersData}
                  onFilterChange={handleSellersFilter}
                  isLoading={isLoading}
                />
              )}

              {currentSection === "products" && productsData && (
                <ProductsView
                  data={productsData}
                  onFilterChange={handleProductsFilter}
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

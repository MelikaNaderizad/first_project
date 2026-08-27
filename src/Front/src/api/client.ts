import {
  OverviewData,
  CommentsResponse,
  SellersResponse,
  ProductsResponse,
  CommentItem,
  SellerItem,
  ProductItem,
  SellerStatus,
  ProductStatus,
  ChatbotStatusResponse,
  ChatbotMessageResponse,
} from "../types";

/* =========================================================
   BASE URL
========================================================= */

export const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_BASE_URL;

  if (url && typeof url === "string") {
    return url.replace(/\/+$/, "");
  }

  return "";
};

/* =========================================================
   HELPERS
========================================================= */

export function parseStringList(val: any): string[] {
  if (!val) return [];

  if (Array.isArray(val)) {
    return val.map(String).filter(Boolean);
  }

  if (typeof val === "string") {
    const trimmed = val.trim();

    if (!trimmed) return [];

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);

        if (Array.isArray(parsed)) {
          return parsed.map(String).filter(Boolean);
        }
      } catch {
        // Fallback to plain text parsing
      }
    }

    if (trimmed.includes("\n")) {
      return trimmed
        .split("\n")
        .map((s) => s.trim().replace(/^[-*•\d.]\s*/, ""))
        .filter(Boolean);
    }

    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (trimmed.includes("،")) {
      return trimmed
        .split("،")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    return [trimmed];
  }

  return [];
}

/* =========================================================
   NORMALIZE COMMENT
========================================================= */

export function normalizeComment(c: any): CommentItem {
  const rate = Number(c.rate ?? 0);

  let recStatus = c.recommendation_status;

  if (!recStatus) {
    recStatus =
      rate >= 4 ? "recommended" : rate <= 2 ? "not_recommended" : "no_idea";
  }

  return {
    id: c.id !== undefined ? c.id : String(Math.random()),
    title: c.title || "بدون عنوان",
    body: c.body || "",
    created_at: String(c.created_at || "۱۴۰۳/۰۵/۰۱"),
    rate,
    recommendation_status: recStatus,
    is_buyer: Boolean(c.is_buyer),
    product_id: c.product_id !== undefined ? c.product_id : "",
    product_title_fa: c.product_title_fa || c.product_title || undefined,
    advantages: parseStringList(c.advantages),
    disadvantages: parseStringList(c.disadvantages),
    likes: Number(c.likes ?? 0),
    dislikes: Number(c.dislikes ?? 0),
    seller_title: c.seller_title || c.seller || "فروشگاه نامشخص",
    seller_code: String(c.seller_code || ""),
    true_to_size_rate:
      c.true_to_size_rate !== undefined
        ? Number(c.true_to_size_rate)
        : undefined,
    category: c.category || c.category1 || undefined,
  };
}

/* =========================================================
   NORMALIZE SELLER
========================================================= */

export function normalizeSeller(s: any): SellerItem {
  const satisfaction = Number(
    s.customer_satisfaction_score ?? s.satisfaction_score ?? 0,
  );

  const fakePercent = Number(s.fake_product_percent ?? 0);

  const lowRatedPercent = Number(s.low_rated_product_percent ?? 0);

  // Health score =
  // 50% customer satisfaction
  // + 30% (100 - fake product percent)
  // + 20% (100 - low rated product percent)

  const calculatedHealth = Math.round(
    0.5 * satisfaction +
      0.3 * (100 - fakePercent) +
      0.2 * (100 - lowRatedPercent),
  );

  const healthScore =
    s.seller_health_score !== undefined
      ? Number(s.seller_health_score)
      : calculatedHealth;

  let sellerStatus: SellerStatus = s.seller_status;

  if (
    !sellerStatus ||
    !["successful", "unsuccessful", "neutral", "insufficient_data"].includes(
      sellerStatus,
    )
  ) {
    if (Number(s.total_comments || 0) < 15) {
      sellerStatus = "insufficient_data";
    } else if (healthScore >= 80) {
      sellerStatus = "successful";
    } else if (healthScore < 55) {
      sellerStatus = "unsuccessful";
    } else {
      sellerStatus = "neutral";
    }
  }

  return {
    seller_code: String(s.seller_code || ""),
    seller_title: s.seller_title || s.title || "فروشگاه نامشخص",

    sold_products: Number(s.sold_products ?? s.products_count ?? 0),

    total_comments: Number(s.total_comments ?? 0),

    positive_comments: Number(s.positive_comments ?? 0),

    negative_comments: Number(s.negative_comments ?? 0),

    customer_satisfaction_score: satisfaction,

    fake_product_percent: fakePercent,

    low_rated_product_percent: lowRatedPercent,

    seller_health_score: healthScore,

    seller_status: sellerStatus,

    category: s.category || s.category1 || "",
  };
}

/* =========================================================
   NORMALIZE PRODUCT
========================================================= */

export function normalizeProduct(p: any): ProductItem {
  const id =
    p.product_id !== undefined ? p.product_id : p.id !== undefined ? p.id : "";

  const rate = Number(
    p.raw_product_rate !== undefined ? p.raw_product_rate : (p.rate ?? 0),
  );

  const bayesian =
    p.bayesian_product_score !== undefined
      ? Number(p.bayesian_product_score)
      : rate;

  const healthScore =
    p.product_health_score !== undefined
      ? Number(p.product_health_score)
      : Math.round(rate * 20);

  let productStatus: ProductStatus = p.product_status;

  if (
    !productStatus ||
    !["successful", "unsuccessful", "neutral", "insufficient_data"].includes(
      productStatus,
    )
  ) {
    if (Number(p.rate_cnt || 0) < 5) {
      productStatus = "insufficient_data";
    } else if (rate >= 4.0) {
      productStatus = "successful";
    } else if (rate <= 2.8) {
      productStatus = "unsuccessful";
    } else {
      productStatus = "neutral";
    }
  }

  return {
    id: String(id),
    product_id: id,

    title_fa: p.title_fa || p.title || "بدون عنوان",

    rate,

    raw_product_rate:
      p.raw_product_rate !== undefined ? Number(p.raw_product_rate) : rate,

    rate_cnt: Number(p.rate_cnt ?? 0),

    category1: p.category1 || "عمومی",

    category2: p.category2 || "",

    brand: p.brand || "متفرقه",

    price: Number(p.price ?? 0),

    seller: p.seller || p.seller_title || "نامشخص",

    seller_code: p.seller_code ? String(p.seller_code) : undefined,

    is_fake: Boolean(p.is_fake),

    min_price_last_month: Number(p.min_price_last_month ?? p.price ?? 0),

    sub_category: p.sub_category || "",

    positive_comments: Number(p.positive_comments ?? 0),

    negative_comments: Number(p.negative_comments ?? 0),

    bayesian_product_score: bayesian,

    sentiment_score:
      p.sentiment_score !== undefined ? Number(p.sentiment_score) : undefined,

    product_health_score: healthScore,

    product_status: productStatus,

    image: p.image,
  };
}

/* =========================================================
   API CLIENT
========================================================= */

export const apiClient = {
  /* =======================================================
     OVERVIEW
  ======================================================= */

  async getOverview(): Promise<OverviewData> {
    const baseUrl = getBaseUrl();

    const res = await fetch(`${baseUrl}/api/overview`);

    if (!res.ok) {
      throw new Error(`خطا در دریافت اطلاعات داشبورد کلی (${res.status})`);
    }

    const json = await res.json();

    return {
      kpis: {
        total_comments: Number(json.kpis?.total_comments ?? 0),

        positive_comments: Number(json.kpis?.positive_comments ?? 0),

        negative_comments: Number(json.kpis?.negative_comments ?? 0),

        positive_percentage: Number(json.kpis?.positive_percentage ?? 0),

        negative_percentage: Number(json.kpis?.negative_percentage ?? 0),

        neutral_percentage: Number(json.kpis?.neutral_percentage ?? 0),

        average_rating: Number(json.kpis?.average_rating ?? 0),

        total_sellers: Number(json.kpis?.total_sellers ?? 0),

        successful_sellers: Number(json.kpis?.successful_sellers ?? 0),

        unsuccessful_sellers: Number(json.kpis?.unsuccessful_sellers ?? 0),

        seller_success_rate: Number(json.kpis?.seller_success_rate ?? 0),

        total_products: Number(json.kpis?.total_products ?? 0),

        successful_products: Number(json.kpis?.successful_products ?? 0),

        unsuccessful_products: Number(json.kpis?.unsuccessful_products ?? 0),

        product_success_rate: Number(json.kpis?.product_success_rate ?? 0),
      },

      sentimentTimeline: Array.isArray(json.sentimentTimeline)
        ? json.sentimentTimeline
        : [],

      categoryDistribution: Array.isArray(json.categoryDistribution)
        ? json.categoryDistribution
        : [],

      topSeller: normalizeSeller(json.topSeller || {}),

      weakestSeller: normalizeSeller(json.weakestSeller || {}),

      topProduct: normalizeProduct(json.topProduct || {}),

      weakestProduct: normalizeProduct(json.weakestProduct || {}),

      recentComments: Array.isArray(json.recentComments)
        ? json.recentComments.map(normalizeComment)
        : [],
    };
  },

  /* =======================================================
     COMMENTS - CURSOR PAGINATION
  ======================================================= */

  async getComments(params?: {
    cursor?: string | number | null;
    limit?: number;

    sentiment?: string;
    rating?: string;
    category?: string;
    search?: string;
  }): Promise<CommentsResponse> {
    const baseUrl = getBaseUrl();

    const query = new URLSearchParams();

    const limit = params?.limit ?? 20;

    /*
     * Cursor pagination:
     *
     * page/page_size نداریم.
     *
     * فقط limit و cursor ارسال می‌شوند.
     */

    query.set("limit", String(limit));

    if (
      params?.cursor !== undefined &&
      params?.cursor !== null &&
      String(params.cursor).trim() !== ""
    ) {
      query.set("cursor", String(params.cursor));
    }

    if (params?.sentiment && params.sentiment !== "all") {
      query.set("sentiment", params.sentiment);
    }

    if (params?.rating && params.rating !== "all") {
      query.set("rating", params.rating);
    }

    if (params?.category && params.category !== "all") {
      query.set("category", params.category);
    }

    if (params?.search && params.search.trim()) {
      query.set("search", params.search.trim());
    }

    const res = await fetch(`${baseUrl}/api/comments?${query.toString()}`);

    if (!res.ok) {
      throw new Error(`خطا در دریافت لیست و آمار نظرات (${res.status})`);
    }

    const json = await res.json();

    /*
     * Backward compatibility:
     * اگر backend موقتاً آرایه برگرداند.
     */

    if (Array.isArray(json)) {
      const rawList = json.map(normalizeComment);

      const total_comments = rawList.length;

      const positive_comments = rawList.filter(
        (c) => c.recommendation_status === "recommended" || c.rate >= 4,
      ).length;

      const negative_comments = rawList.filter(
        (c) => c.recommendation_status === "not_recommended" || c.rate <= 2,
      ).length;

      const avgRating =
        total_comments > 0
          ? Number(
              (
                rawList.reduce((acc, c) => acc + c.rate, 0) / total_comments
              ).toFixed(2),
            )
          : 0;

      const starCounts = [5, 4, 3, 2, 1].map((s) => {
        const count = rawList.filter((c) => Math.round(c.rate) === s).length;

        const pct =
          total_comments > 0
            ? Number(((count / total_comments) * 100).toFixed(1))
            : 0;

        return {
          stars: `${s} ستاره`,
          count,
          percentage: pct,
          color: s >= 4 ? "#10B981" : s === 3 ? "#FBBF24" : "#EF4444",
        };
      });

      return {
        metrics: {
          total_comments,
          positive_comments,
          negative_comments,

          positive_rate:
            total_comments > 0
              ? Number(((positive_comments / total_comments) * 100).toFixed(1))
              : 0,

          negative_rate:
            total_comments > 0
              ? Number(((negative_comments / total_comments) * 100).toFixed(1))
              : 0,

          average_rating: avgRating,

          avg_comments_per_product: total_comments,

          change_rate: "۰٪",
        },

        ratingDistribution: starCounts,

        comments: rawList.slice(0, limit),

        totalCount: total_comments,

        limit,

        next_cursor: null,

        has_next: false,
      };
    }

    /*
     * Normal backend response
     */

    const rawComments = Array.isArray(json.comments)
      ? json.comments.map(normalizeComment)
      : [];

    const totalCount = Number(
      json.totalCount ?? json.total_comments ?? rawComments.length,
    );

    const resolvedLimit = Number(json.limit ?? limit);

    return {
      metrics: {
        total_comments: Number(json.metrics?.total_comments ?? totalCount),

        positive_comments: Number(json.metrics?.positive_comments ?? 0),

        negative_comments: Number(json.metrics?.negative_comments ?? 0),

        positive_rate: Number(json.metrics?.positive_rate ?? 0),

        negative_rate: Number(json.metrics?.negative_rate ?? 0),

        average_rating: Number(json.metrics?.average_rating ?? 0),

        avg_comments_per_product: Number(
          json.metrics?.avg_comments_per_product ?? 0,
        ),

        change_rate: String(json.metrics?.change_rate ?? ""),
      },

      ratingDistribution: Array.isArray(json.ratingDistribution)
        ? json.ratingDistribution
        : [],

      comments: rawComments,

      totalCount,

      limit: resolvedLimit,

      next_cursor: json.next_cursor ?? null,

      has_next: Boolean(json.has_next),
    };
  },

  /* =======================================================
     PRODUCTS - CURSOR PAGINATION
  ======================================================= */

  async getProducts(params?: {
    cursor?: string | number | null;
    limit?: number;

    status?: string;
    category?: string;
    search?: string;
    sort?: string;
  }): Promise<ProductsResponse> {
    const baseUrl = getBaseUrl();

    const query = new URLSearchParams();

    const limit = params?.limit ?? 20;

    query.set("limit", String(limit));

    if (
      params?.cursor !== undefined &&
      params?.cursor !== null &&
      String(params.cursor).trim() !== ""
    ) {
      query.set("cursor", String(params.cursor));
    }

    if (params?.status && params.status !== "all") {
      query.set("status", params.status);
    }

    if (params?.category && params.category !== "all") {
      query.set("category", params.category);
    }

    if (params?.search && params.search.trim()) {
      query.set("search", params.search.trim());
    }

    if (params?.sort) {
      query.set("sort", params.sort);
    }

    const res = await fetch(`${baseUrl}/api/products?${query.toString()}`);

    if (!res.ok) {
      throw new Error(`خطا در دریافت اطلاعات محصولات (${res.status})`);
    }

    const json = await res.json();

    /*
     * Backward compatibility
     */

    if (Array.isArray(json)) {
      const rawList = json.map(normalizeProduct);

      const total_products = rawList.length;

      const successful_products = rawList.filter(
        (p) => p.product_status === "successful",
      ).length;

      const unsuccessful_products = rawList.filter(
        (p) => p.product_status === "unsuccessful",
      ).length;

      const avg_rating =
        total_products > 0
          ? Number(
              (
                rawList.reduce((acc, cur) => acc + cur.rate, 0) / total_products
              ).toFixed(2),
            )
          : 0;

      const fake_products_count = rawList.filter((p) => p.is_fake).length;

      const topProduct =
        [...rawList].sort((a, b) => b.rate - a.rate)[0] || rawList[0];

      const weakestProduct =
        [...rawList].sort((a, b) => a.rate - b.rate)[0] ||
        rawList[rawList.length - 1];

      return {
        metrics: {
          total_products,
          successful_products,
          unsuccessful_products,
          avg_rating,
          fake_products_count,
          topProduct,
          weakestProduct,
        },

        categoryBreakdown: [],

        products: rawList.slice(0, limit),

        totalCount: total_products,

        limit,

        next_cursor: null,

        has_next: false,
      };
    }

    /*
     * Normal backend response
     */

    const rawProducts = Array.isArray(json.products)
      ? json.products.map(normalizeProduct)
      : [];

    const totalCount = Number(
      json.totalCount ?? json.total_products ?? rawProducts.length,
    );

    const resolvedLimit = Number(json.limit ?? limit);

    return {
      metrics: {
        total_products: Number(json.metrics?.total_products ?? totalCount),

        successful_products: Number(json.metrics?.successful_products ?? 0),

        unsuccessful_products: Number(json.metrics?.unsuccessful_products ?? 0),

        avg_rating: Number(json.metrics?.avg_rating ?? 0),

        fake_products_count: Number(json.metrics?.fake_products_count ?? 0),

        topProduct: normalizeProduct(
          json.metrics?.topProduct || rawProducts[0] || {},
        ),

        weakestProduct: normalizeProduct(
          json.metrics?.weakestProduct ||
            rawProducts[rawProducts.length - 1] ||
            {},
        ),
      },

      categoryBreakdown: Array.isArray(json.categoryBreakdown)
        ? json.categoryBreakdown
        : [],

      products: rawProducts,

      totalCount,

      limit: resolvedLimit,

      next_cursor: json.next_cursor ?? null,

      has_next: Boolean(json.has_next),
    };
  },

  /* =======================================================
     SELLERS - CURSOR PAGINATION
  ======================================================= */

  async getSellers(params?: {
    cursor?: string | number | null;
    limit?: number;

    status?: string;
    category?: string;
    search?: string;
    sort?: string;
  }): Promise<SellersResponse> {
    const baseUrl = getBaseUrl();

    const query = new URLSearchParams();

    const limit = params?.limit ?? 20;

    query.set("limit", String(limit));

    if (
      params?.cursor !== undefined &&
      params?.cursor !== null &&
      String(params.cursor).trim() !== ""
    ) {
      query.set("cursor", String(params.cursor));
    }

    if (params?.status && params.status !== "all") {
      query.set("status", params.status);
    }

    if (params?.category && params.category !== "all") {
      query.set("category", params.category);
    }

    if (params?.search && params.search.trim()) {
      query.set("search", params.search.trim());
    }

    if (params?.sort) {
      query.set("sort", params.sort);
    }

    const res = await fetch(`${baseUrl}/api/sellers?${query.toString()}`);

    if (!res.ok) {
      throw new Error(`خطا در دریافت اطلاعات فروشندگان (${res.status})`);
    }

    const json = await res.json();

    /*
     * Backward compatibility
     */

    if (Array.isArray(json)) {
      const rawList = json.map(normalizeSeller);

      const total_sellers = rawList.length;

      const successful_sellers = rawList.filter(
        (s) => s.seller_status === "successful",
      ).length;

      const unsuccessful_sellers = rawList.filter(
        (s) => s.seller_status === "unsuccessful",
      ).length;

      const avg_seller_rating =
        total_sellers > 0
          ? Number(
              (
                rawList.reduce(
                  (acc, cur) => acc + cur.customer_satisfaction_score,
                  0,
                ) /
                (total_sellers * 20)
              ).toFixed(2),
            )
          : 0;

      const avg_satisfaction_score =
        total_sellers > 0
          ? Number(
              (
                rawList.reduce(
                  (acc, cur) => acc + cur.customer_satisfaction_score,
                  0,
                ) / total_sellers
              ).toFixed(1),
            )
          : 0;

      const topSeller =
        [...rawList].sort(
          (a, b) => b.seller_health_score - a.seller_health_score,
        )[0] || rawList[0];

      const weakestSeller =
        [...rawList].sort(
          (a, b) => a.seller_health_score - b.seller_health_score,
        )[0] || rawList[rawList.length - 1];

      return {
        metrics: {
          total_sellers,
          successful_sellers,
          unsuccessful_sellers,
          avg_seller_rating,
          avg_satisfaction_score,
          topSeller,
          weakestSeller,
        },

        performanceComparison: [],

        sellers: rawList.slice(0, limit),

        totalCount: total_sellers,

        limit,

        next_cursor: null,

        has_next: false,
      };
    }

    /*
     * Normal backend response
     */

    const rawSellers = Array.isArray(json.sellers)
      ? json.sellers.map(normalizeSeller)
      : [];

    const totalCount = Number(
      json.totalCount ?? json.total_sellers ?? rawSellers.length,
    );

    const resolvedLimit = Number(json.limit ?? limit);

    return {
      metrics: {
        total_sellers: Number(json.metrics?.total_sellers ?? totalCount),

        successful_sellers: Number(json.metrics?.successful_sellers ?? 0),

        unsuccessful_sellers: Number(json.metrics?.unsuccessful_sellers ?? 0),

        avg_seller_rating: Number(json.metrics?.avg_seller_rating ?? 0),

        avg_satisfaction_score: Number(
          json.metrics?.avg_satisfaction_score ?? 0,
        ),

        topSeller: normalizeSeller(
          json.metrics?.topSeller || rawSellers[0] || {},
        ),

        weakestSeller: normalizeSeller(
          json.metrics?.weakestSeller ||
            rawSellers[rawSellers.length - 1] ||
            {},
        ),
      },

      performanceComparison: Array.isArray(json.performanceComparison)
        ? json.performanceComparison
        : [],

      sellers: rawSellers,

      totalCount,

      limit: resolvedLimit,

      next_cursor: json.next_cursor ?? null,

      has_next: Boolean(json.has_next),
    };
  },

  /* =======================================================
     CHATBOT STATUS
  ======================================================= */

  async getChatbotStatus(): Promise<ChatbotStatusResponse> {
    const baseUrl = getBaseUrl();

    const res = await fetch(`${baseUrl}/api/chatbot/status`);

    if (!res.ok) {
      throw new Error(`خطا در بررسی وضعیت چت‌بات (${res.status})`);
    }

    return await res.json();
  },

  /* =======================================================
     CHATBOT MESSAGE
  ======================================================= */

  async sendChatbotMessage(message: string): Promise<ChatbotMessageResponse> {
    const baseUrl = getBaseUrl();

    const res = await fetch(`${baseUrl}/api/chatbot/message`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        message,
      }),
    });

    if (!res.ok) {
      throw new Error(`خطا در ارسال پیام به چت‌بات (${res.status})`);
    }

    return await res.json();
  },
};

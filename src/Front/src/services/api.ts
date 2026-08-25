import { KPISummary, CommentItem, ProductItem, SellerItem } from "../types";
import {
  mockKPISummary,
  mockComments,
  mockProducts,
  mockSellers,
} from "../data/mockData";

// Shared request options for JSON GET calls.
const JSON_HEADERS = { Accept: "application/json" };

const BASE_URL =
  (import.meta as unknown as { env?: Record<string, string> }).env
    ?.VITE_API_BASE_URL || "";

export interface CommentsSummaryResponse {
  total_comments: number;
  positive_comments: number;
  negative_comments: number;
  neutral_comments?: number;
  positive_percentage?: number;
  negative_percentage?: number;
}

export interface PaginatedCommentsResponse {
  items: CommentItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Fetch KPI Overview Data from GET /api/overview
 */
export async function fetchOverviewApi(): Promise<KPISummary> {
  if (!BASE_URL) {
    // Return mock data immediately if no base url is specified
    return mockKPISummary;
  }

  try {
    const url = `${BASE_URL.replace(/\/$/, "")}/api/overview`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      ...mockKPISummary,
      ...data,
    };
  } catch (err) {
    console.warn(
      "API /api/overview fetch failed, using fallback mock data:",
      err,
    );
    return mockKPISummary;
  }
}

/**
 * Fetch Comments Summary from GET /api/comments-summary
 */
export async function fetchCommentsSummaryApi(): Promise<CommentsSummaryResponse> {
  if (!BASE_URL) {
    return {
      total_comments: mockKPISummary.total_comments,
      positive_comments: mockKPISummary.positive_comments,
      negative_comments: mockKPISummary.negative_comments,
      neutral_comments: mockKPISummary.neutral_comments,
      positive_percentage: Number(
        (
          (mockKPISummary.positive_comments / mockKPISummary.total_comments) *
          100
        ).toFixed(1),
      ),
      negative_percentage: Number(
        (
          (mockKPISummary.negative_comments / mockKPISummary.total_comments) *
          100
        ).toFixed(1),
      ),
    };
  }

  try {
    const url = `${BASE_URL.replace(/\/$/, "")}/api/comments-summary`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const total =
      data.total_comments || data.positive_comments + data.negative_comments;
    return {
      total_comments: total,
      positive_comments: data.positive_comments,
      negative_comments: data.negative_comments,
      neutral_comments: data.neutral_comments || 0,
      positive_percentage:
        total > 0
          ? Number(((data.positive_comments / total) * 100).toFixed(1))
          : 0,
      negative_percentage:
        total > 0
          ? Number(((data.negative_comments / total) * 100).toFixed(1))
          : 0,
    };
  } catch (err) {
    console.warn(
      "API /api/comments-summary fetch failed, using fallback mock data:",
      err,
    );
    return {
      total_comments: mockKPISummary.total_comments,
      positive_comments: mockKPISummary.positive_comments,
      negative_comments: mockKPISummary.negative_comments,
      neutral_comments: mockKPISummary.neutral_comments,
      positive_percentage: Number(
        (
          (mockKPISummary.positive_comments / mockKPISummary.total_comments) *
          100
        ).toFixed(1),
      ),
      negative_percentage: Number(
        (
          (mockKPISummary.negative_comments / mockKPISummary.total_comments) *
          100
        ).toFixed(1),
      ),
    };
  }
}

/**
 * Fetch Paginated Comments from GET /api/comments?page={page}&page_size={pageSize}
 */
export async function fetchCommentsApi(
  page: number = 1,
  pageSize: number = 21,
): Promise<PaginatedCommentsResponse> {
  if (!BASE_URL) {
    // Generate simulated paginated data based on mockComments
    const total =
      mockComments.length >= 21 ? mockComments.length * 3 : mockComments.length;
    // Repeat mock items if necessary to demonstrate multi-page navigation seamlessly
    const allMock: CommentItem[] = [];
    while (allMock.length < total) {
      allMock.push(
        ...mockComments.map((item, idx) => ({
          ...item,
          id: `CMT-${allMock.length + idx + 1000}`,
        })),
      );
    }
    const startIndex = (page - 1) * pageSize;
    const items = allMock.slice(startIndex, startIndex + pageSize);
    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize) || 1,
    };
  }

  try {
    const url = `${BASE_URL.replace(/\/$/, "")}/api/comments?page=${page}&page_size=${pageSize}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const items: CommentItem[] = Array.isArray(data.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];
    const total: number =
      typeof data.total === "number" ? data.total : items.length;

    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize) || 1,
    };
  } catch (err) {
    console.warn(
      `API /api/comments?page=${page}&page_size=${pageSize} fetch failed, using fallback:`,
      err,
    );
    const total = mockComments.length;
    const startIndex = (page - 1) * pageSize;
    const items = mockComments.slice(startIndex, startIndex + pageSize);
    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize) || 1,
    };
  }
}

/**
 * Fetch all Products from GET /api/products
 */
export async function fetchProductsApi(): Promise<ProductItem[]> {
  if (!BASE_URL) {
    return mockProducts;
  }

  try {
    const url = `${BASE_URL.replace(/\/$/, "")}/api/products`;
    const res = await fetch(url, { headers: JSON_HEADERS });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : mockProducts;
  } catch (err) {
    console.warn(
      "API /api/products fetch failed, using fallback mock data:",
      err,
    );
    return mockProducts;
  }
}

/**
 * Fetch all Sellers from GET /api/sellers
 */
export async function fetchSellersApi(): Promise<SellerItem[]> {
  if (!BASE_URL) {
    return mockSellers;
  }

  try {
    const url = `${BASE_URL.replace(/\/$/, "")}/api/sellers`;
    const res = await fetch(url, { headers: JSON_HEADERS });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : mockSellers;
  } catch (err) {
    console.warn(
      "API /api/sellers fetch failed, using fallback mock data:",
      err,
    );
    return mockSellers;
  }
}

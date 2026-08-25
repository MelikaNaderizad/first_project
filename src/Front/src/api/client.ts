import { OverviewData, CommentsResponse, SellersResponse, ProductsResponse } from '../types';

export const apiClient = {
  async getOverview(): Promise<OverviewData> {
    const res = await fetch('/api/overview');
    if (!res.ok) throw new Error('خطا در دریافت اطلاعات داشبورد کلی');
    return res.json();
  },

  async getComments(params?: {
    sentiment?: string;
    rating?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<CommentsResponse> {
    const query = new URLSearchParams();
    if (params?.sentiment && params.sentiment !== 'all') query.set('sentiment', params.sentiment);
    if (params?.rating && params.rating !== 'all') query.set('rating', params.rating);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const res = await fetch(`/api/comments?${query.toString()}`);
    if (!res.ok) throw new Error('خطا در دریافت لیست و آمار نظرات');
    return res.json();
  },

  async getSellers(params?: {
    status?: string;
    category?: string;
    search?: string;
    sort?: string;
  }): Promise<SellersResponse> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`/api/sellers?${query.toString()}`);
    if (!res.ok) throw new Error('خطا در دریافت اطلاعات فروشندگان');
    return res.json();
  },

  async getProducts(params?: {
    status?: string;
    category?: string;
    search?: string;
    sort?: string;
  }): Promise<ProductsResponse> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('خطا در دریافت اطلاعات محصولات');
    return res.json();
  },
};

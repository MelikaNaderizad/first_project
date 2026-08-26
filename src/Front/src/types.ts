export type NavSection = 'dashboard' | 'comments' | 'sellers' | 'products' | 'chatbot';

export type RecommendationStatus = 'recommended' | 'not_recommended' | 'no_idea' | 'positive' | 'negative' | string;

export interface CommentItem {
  id: string | number;
  title: string;
  body: string;
  created_at: string;
  rate: number;
  recommendation_status: RecommendationStatus;
  is_buyer: boolean;
  product_id: string | number;
  product_title_fa?: string;
  advantages: string[];
  disadvantages: string[];
  likes: number;
  dislikes: number;
  seller_title: string;
  seller_code: string;
  true_to_size_rate?: number;
  category?: string;
}

export type SellerStatus = 'successful' | 'unsuccessful' | 'neutral' | 'insufficient_data';

export interface SellerItem {
  seller_code: string;
  seller_title: string;
  sold_products: number;
  total_comments: number;
  positive_comments: number;
  negative_comments: number;
  customer_satisfaction_score: number;
  fake_product_percent: number;
  low_rated_product_percent: number;
  seller_health_score: number;
  seller_status: SellerStatus;
  category?: string;
}

export type ProductStatus = 'successful' | 'unsuccessful' | 'neutral' | 'insufficient_data';

export interface ProductItem {
  id: string | number;
  product_id?: string | number;
  title_fa: string;
  rate: number;
  rate_cnt: number;
  category1: string;
  category2?: string;
  brand: string;
  price: number;
  seller: string;
  seller_code?: string;
  is_fake: boolean;
  min_price_last_month: number;
  sub_category?: string;
  raw_product_rate?: number;
  positive_comments?: number;
  negative_comments?: number;
  bayesian_product_score?: number;
  sentiment_score?: number;
  product_health_score?: number;
  product_status?: ProductStatus;
  image?: string;
}

export interface OverviewData {
  kpis: {
    total_comments: number;
    positive_comments: number;
    negative_comments: number;
    positive_percentage: number;
    negative_percentage: number;
    neutral_percentage: number;
    average_rating: number;
    total_sellers: number;
    successful_sellers: number;
    unsuccessful_sellers: number;
    seller_success_rate: number;
    total_products: number;
    successful_products: number;
    unsuccessful_products: number;
    product_success_rate: number;
  };
  sentimentTimeline: Array<{
    month: string;
    positive: number;
    negative: number;
    neutral?: number;
    total: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    total: number;
    positive: number;
    negative: number;
    positivePercentage: number;
    negativePercentage: number;
  }>;
  topSeller: SellerItem;
  weakestSeller: SellerItem;
  topProduct: ProductItem;
  weakestProduct: ProductItem;
  recentComments: CommentItem[];
}

export interface CommentsResponse {
  metrics: {
    total_comments: number;
    positive_comments: number;
    negative_comments: number;
    positive_rate: number;
    negative_rate: number;
    average_rating: number;
    avg_comments_per_product: number;
    change_rate: string;
  };
  ratingDistribution: Array<{
    stars: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  comments: CommentItem[];
  totalCount: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SellersResponse {
  metrics: {
    total_sellers: number;
    successful_sellers: number;
    unsuccessful_sellers: number;
    avg_seller_rating: number;
    avg_satisfaction_score: number;
    topSeller: SellerItem;
    weakestSeller: SellerItem;
  };
  performanceComparison: Array<{
    metric: string;
    successful: number;
    unsuccessful: number;
    unit: string;
  }>;
  sellers: SellerItem[];
  page: number;
  page_size: number;
  totalCount: number;
  totalPages: number;
}

export interface ProductsResponse {
  metrics: {
    total_products: number;
    successful_products: number;
    unsuccessful_products: number;
    avg_rating: number;
    fake_products_count: number;
    topProduct: ProductItem;
    weakestProduct: ProductItem;
  };
  categoryBreakdown: Array<{
    name: string;
    successful: number;
    unsuccessful: number;
    total: number;
  }>;
  products: ProductItem[];
  page: number;
  page_size: number;
  totalCount: number;
  total_pages: number;
}

export interface ChatbotStatusResponse {
  status: string;
  model?: string;
  ready?: boolean;
}

export interface ChatbotMessageResponse {
  reply?: string;
  message?: string;
  response?: string;
  answer?: string;
}

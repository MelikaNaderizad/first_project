export type ProductStatus = 'successful' | 'unsuccessful' | 'neutral' | 'insufficient_data';
export type SellerStatus = 'successful' | 'unsuccessful' | 'neutral' | 'insufficient_data';
export type CommentSentiment = 'positive' | 'negative' | 'neutral';

export interface CommentItem {
  id: string;
  product_id: string;
  product_title: string;
  seller_title: string;
  user_name: string;
  rating: number; // 1 to 5
  sentiment: CommentSentiment;
  sentiment_score: number; // 0 to 100
  title: string;
  comment_text: string;
  created_at: string;
  is_buyer: boolean;
  recommendation_status: 'recommended' | 'not_recommended' | 'no_idea';
  likes_count: number;
  dislikes_count: number;
  category: string;
  pros: string[];
  cons: string[];
}

export interface ProductItem {
  product_id: string;
  title_fa: string;
  category_fa: string;
  seller_title: string;
  raw_product_rate: number; // 1.0 - 5.0
  rate_cnt: number;
  positive_comments: number;
  negative_comments: number;
  neutral_comments: number;
  bayesian_product_score: number; // 0 - 100
  sentiment_score: number; // 0 - 100
  product_health_score: number; // 0 - 100
  product_status: ProductStatus;
  price_toman: number;
  monthly_sales_cnt: number;
  radar_metrics: {
    attribute: string;
    score: number;
    fullMark: number;
  }[];
  top_pros: string[];
  top_cons: string[];
  recommendation: string;
}

export interface SellerItem {
  seller_code: string;
  seller_title: string;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  city: string;
  sold_products: number;
  total_comments: number;
  positive_comments: number;
  negative_comments: number;
  customer_satisfaction_score: number; // 0 - 100
  fake_product_percent: number; // 0 - 100 %
  low_rated_product_percent: number; // 0 - 100 %
  seller_health_score: number; // 0 - 100
  seller_status: SellerStatus;
  timely_shipping_rate: number; // 0 - 100 %
  return_rate: number; // 0 - 100 %
  commitment_score: number; // 0 - 100
  radar_metrics: {
    attribute: string;
    score: number;
    fullMark: number;
  }[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

export interface KPISummary {
  total_sellers: number;
  total_comments: number;
  total_products: number;
  successful_sellers: number;
  positive_comments: number;
  successful_products: number;
  unsuccessful_sellers: number;
  negative_comments: number;
  unsuccessful_products: number;
  neutral_comments: number;
  neutral_products: number;
  insufficient_products: number;
  neutral_sellers: number;
  insufficient_sellers: number;
  avg_health_score: number;
  overall_sentiment: number;
}

export type TabType = 'overview' | 'comments' | 'products' | 'sellers' | 'agent';

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  attachments?: {
    type: 'metric' | 'alert' | 'recommendation';
    title: string;
    data: string;
  }[];
}

export interface AgentLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'success' | 'process';
  message: string;
}

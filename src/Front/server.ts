import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// REAL PROJECT DATA STORE (Persian E-Commerce Analytics)
// ==========================================

export type RecommendationStatus = 'recommended' | 'not_recommended' | 'no_idea';

export interface CommentItem {
  id: string;
  title: string;
  body: string;
  created_at: string;
  rate: number;
  recommendation_status: RecommendationStatus;
  is_buyer: boolean;
  product_id: string;
  product_title_fa: string;
  advantages: string[];
  disadvantages: string[];
  likes: number;
  dislikes: number;
  seller_title: string;
  seller_code: string;
  true_to_size_rate?: number;
  category: string;
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
  category: string;
}

export type ProductStatus = 'successful' | 'unsuccessful' | 'neutral' | 'insufficient_data';

export interface ProductItem {
  id: string;
  title_fa: string;
  rate: number;
  rate_cnt: number;
  category1: string;
  category2: string;
  brand: string;
  price: number;
  seller: string;
  seller_code: string;
  is_fake: boolean;
  min_price_last_month: number;
  sub_category: string;
  raw_product_rate: number;
  positive_comments: number;
  negative_comments: number;
  bayesian_product_score: number;
  sentiment_score: number;
  product_health_score: number;
  product_status: ProductStatus;
  image: string;
}

const SELLERS: SellerItem[] = [
  {
    seller_code: 'SEL-1042',
    seller_title: 'دیجی‌تک پلاس',
    sold_products: 48,
    total_comments: 3420,
    positive_comments: 3130,
    negative_comments: 144,
    customer_satisfaction_score: 91.5,
    fake_product_percent: 0.2,
    low_rated_product_percent: 3.8,
    seller_health_score: 94.2,
    seller_status: 'successful',
    category: 'کالای دیجیتال',
  },
  {
    seller_code: 'SEL-2089',
    seller_title: 'آریا هوم استایل',
    sold_products: 85,
    total_comments: 2180,
    positive_comments: 1922,
    negative_comments: 142,
    customer_satisfaction_score: 88.2,
    fake_product_percent: 0.5,
    low_rated_product_percent: 5.2,
    seller_health_score: 92.8,
    seller_status: 'successful',
    category: 'لوازم خانگی',
  },
  {
    seller_code: 'SEL-3051',
    seller_title: 'نوآوران پایتخت',
    sold_products: 32,
    total_comments: 1950,
    positive_comments: 1692,
    negative_comments: 138,
    customer_satisfaction_score: 86.8,
    fake_product_percent: 0.8,
    low_rated_product_percent: 6.1,
    seller_health_score: 91.9,
    seller_status: 'successful',
    category: 'کالای دیجیتال',
  },
  {
    seller_code: 'SEL-4012',
    seller_title: 'مد و پوشاک زاگرس',
    sold_products: 120,
    total_comments: 1640,
    positive_comments: 1378,
    negative_comments: 139,
    customer_satisfaction_score: 84.0,
    fake_product_percent: 1.2,
    low_rated_product_percent: 7.5,
    seller_health_score: 89.6,
    seller_status: 'successful',
    category: 'مد و پوشاک',
  },
  {
    seller_code: 'SEL-7019',
    seller_title: 'نیلوفر بیوتی',
    sold_products: 94,
    total_comments: 4100,
    positive_comments: 3862,
    negative_comments: 115,
    customer_satisfaction_score: 94.2,
    fake_product_percent: 0.1,
    low_rated_product_percent: 2.4,
    seller_health_score: 96.5,
    seller_status: 'successful',
    category: 'زیبایی و سلامت',
  },
  {
    seller_code: 'SEL-5098',
    seller_title: 'بازرگانی کیان تجارت',
    sold_products: 64,
    total_comments: 890,
    positive_comments: 302,
    negative_comments: 518,
    customer_satisfaction_score: 34.0,
    fake_product_percent: 18.5,
    low_rated_product_percent: 42.0,
    seller_health_score: 41.5,
    seller_status: 'unsuccessful',
    category: 'لوازم خانگی',
  },
  {
    seller_code: 'SEL-6034',
    seller_title: 'پارسیان الکترونیک',
    sold_products: 28,
    total_comments: 620,
    positive_comments: 257,
    negative_comments: 304,
    customer_satisfaction_score: 41.5,
    fake_product_percent: 22.0,
    low_rated_product_percent: 36.5,
    seller_health_score: 48.2,
    seller_status: 'unsuccessful',
    category: 'کالای دیجیتال',
  },
  {
    seller_code: 'SEL-8023',
    seller_title: 'تکسام اکسپرس',
    sold_products: 19,
    total_comments: 380,
    positive_comments: 106,
    negative_comments: 245,
    customer_satisfaction_score: 28.0,
    fake_product_percent: 31.0,
    low_rated_product_percent: 54.0,
    seller_health_score: 32.5,
    seller_status: 'unsuccessful',
    category: 'مد و پوشاک',
  },
  {
    seller_code: 'SEL-9041',
    seller_title: 'سپهر ارتباطات نوین',
    sold_products: 12,
    total_comments: 140,
    positive_comments: 85,
    negative_comments: 38,
    customer_satisfaction_score: 60.7,
    fake_product_percent: 4.5,
    low_rated_product_percent: 15.0,
    seller_health_score: 68.0,
    seller_status: 'neutral',
    category: 'کالای دیجیتال',
  },
  {
    seller_code: 'SEL-9099',
    seller_title: 'آرمانی مد تبریز',
    sold_products: 5,
    total_comments: 12,
    positive_comments: 7,
    negative_comments: 3,
    customer_satisfaction_score: 58.3,
    fake_product_percent: 0.0,
    low_rated_product_percent: 8.0,
    seller_health_score: 62.0,
    seller_status: 'insufficient_data',
    category: 'مد و پوشاک',
  },
];

const PRODUCTS: ProductItem[] = [
  {
    id: 'prd-1',
    title_fa: 'هدفون بی‌سیم نویز کنسلینگ سونی WH-1000XM5',
    rate: 4.9,
    rate_cnt: 1240,
    category1: 'کالای دیجیتال',
    category2: 'صوتی و تصویری',
    brand: 'سونی (Sony)',
    price: 18500000,
    seller: 'دیجی‌تک پلاس',
    seller_code: 'SEL-1042',
    is_fake: false,
    min_price_last_month: 17900000,
    sub_category: 'هدفون و هندزفری',
    raw_product_rate: 4.9,
    positive_comments: 1165,
    negative_comments: 35,
    bayesian_product_score: 4.88,
    sentiment_score: 94,
    product_health_score: 96,
    product_status: 'successful',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'prd-2',
    title_fa: 'سرم ویتامین سی روشن‌کننده و جوان‌ساز پوست لاروش پوزای',
    rate: 4.8,
    rate_cnt: 2150,
    category1: 'زیبایی و سلامت',
    category2: 'مراقبت پوست',
    brand: 'لاروش پوزای (La Roche-Posay)',
    price: 780000,
    seller: 'نیلوفر بیوتی',
    seller_code: 'SEL-7019',
    is_fake: false,
    min_price_last_month: 740000,
    sub_category: 'سرم و کرم پوست',
    raw_product_rate: 4.8,
    positive_comments: 1980,
    negative_comments: 70,
    bayesian_product_score: 4.79,
    sentiment_score: 92,
    product_health_score: 94,
    product_status: 'successful',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'prd-3',
    title_fa: 'ساعت هوشمند اپل واچ سری ۹ سایز ۴۵ میلی‌متری',
    rate: 4.7,
    rate_cnt: 890,
    category1: 'کالای دیجیتال',
    category2: 'گجت‌های هوشمند',
    brand: 'اپل (Apple)',
    price: 21000000,
    seller: 'نوآوران پایتخت',
    seller_code: 'SEL-3051',
    is_fake: false,
    min_price_last_month: 20500000,
    sub_category: 'ساعت و مچ‌بند هوشمند',
    raw_product_rate: 4.7,
    positive_comments: 792,
    negative_comments: 48,
    bayesian_product_score: 4.68,
    sentiment_score: 89,
    product_health_score: 91,
    product_status: 'successful',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'prd-4',
    title_fa: 'اسپرسوساز دلونگی نیمه‌صنعتی مدل EC685 استیل',
    rate: 4.6,
    rate_cnt: 730,
    category1: 'لوازم خانگی',
    category2: 'نوشیدنی‌ساز',
    brand: 'دلونگی (Delonghi)',
    price: 9400000,
    seller: 'آریا هوم استایل',
    seller_code: 'SEL-2089',
    is_fake: false,
    min_price_last_month: 9100000,
    sub_category: 'قهوه‌ساز و اسپرسوساز',
    raw_product_rate: 4.6,
    positive_comments: 635,
    negative_comments: 55,
    bayesian_product_score: 4.58,
    sentiment_score: 87,
    product_health_score: 89,
    product_status: 'successful',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'prd-5',
    title_fa: 'هودی زیپ‌دار پشمی داخل کرک مردانه طرح کلاسیک',
    rate: 4.4,
    rate_cnt: 560,
    category1: 'مد و پوشاک',
    category2: 'لباس مردانه',
    brand: 'زاگرس پوش (Zagros)',
    price: 890000,
    seller: 'مد و پوشاک زاگرس',
    seller_code: 'SEL-4012',
    is_fake: false,
    min_price_last_month: 850000,
    sub_category: 'سویشرت و هودی',
    raw_product_rate: 4.4,
    positive_comments: 460,
    negative_comments: 60,
    bayesian_product_score: 4.36,
    sentiment_score: 82,
    product_health_score: 84,
    product_status: 'successful',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'prd-6',
    title_fa: 'جاروبرقی شارژی پرتابل ماشین توربو اکس مدل TX-90',
    rate: 2.6,
    rate_cnt: 480,
    category1: 'لوازم خانگی',
    category2: 'نظافت و شستشو',
    brand: 'توربو اکس (Turbo-X)',
    price: 3200000,
    seller: 'بازرگانی کیان تجارت',
    seller_code: 'SEL-5098',
    is_fake: true,
    min_price_last_month: 2900000,
    sub_category: 'جارو و شارژی',
    raw_product_rate: 2.6,
    positive_comments: 130,
    negative_comments: 310,
    bayesian_product_score: 2.74,
    sentiment_score: 27,
    product_health_score: 30,
    product_status: 'unsuccessful',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'prd-7',
    title_fa: 'شارژر دیواری فست شارژ ۶۵ وات سه پورت غیراصل',
    rate: 2.9,
    rate_cnt: 390,
    category1: 'کالای دیجیتال',
    category2: 'لوازم جانبی دیجیتال',
    brand: 'متفرقه (OEM)',
    price: 450000,
    seller: 'پارسیان الکترونیک',
    seller_code: 'SEL-6034',
    is_fake: true,
    min_price_last_month: 410000,
    sub_category: 'شارژر و کابل',
    raw_product_rate: 2.9,
    positive_comments: 120,
    negative_comments: 230,
    bayesian_product_score: 3.05,
    sentiment_score: 31,
    product_health_score: 35,
    product_status: 'unsuccessful',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'prd-8',
    title_fa: 'تی‌شرت نخی چاپ‌دار طرح مینیمال (رنگ‌پریدگی در شستشو)',
    rate: 2.3,
    rate_cnt: 290,
    category1: 'مد و پوشاک',
    category2: 'لباس مردانه',
    brand: 'متفرقه',
    price: 260000,
    seller: 'تکسام اکسپرس',
    seller_code: 'SEL-8023',
    is_fake: false,
    min_price_last_month: 240000,
    sub_category: 'تی‌شرت و پولوشرت',
    raw_product_rate: 2.3,
    positive_comments: 65,
    negative_comments: 195,
    bayesian_product_score: 2.52,
    sentiment_score: 22,
    product_health_score: 25,
    product_status: 'unsuccessful',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80',
  },
];

const COMMENTS: CommentItem[] = [
  {
    id: 'com-1',
    title: 'کیفیت صدای عالی و نویز کنسلینگ شگفت‌انگیز',
    body: 'کیفیت صدای فوق‌العاده و تفکیک عالی، نویز کنسلینگ بسیار قوی در محیط‌های شلوغ مانند مترو و کافه. ارگونومی گوش‌ها هم عالی است و بعد از ساعت‌ها استفاده احساس خستگی نمی‌کنید. بسته‌بندی پلمپ و اصل بود.',
    created_at: '۱۴۰۳/۰۵/۱۴',
    rate: 5,
    recommendation_status: 'recommended',
    is_buyer: true,
    product_id: 'prd-1',
    product_title_fa: 'هدفون بی‌سیم نویز کنسلینگ سونی WH-1000XM5',
    advantages: ['تفکیک صدای کم‌نظیر', 'نویز کنسلینگ فعال فوق‌العاده', 'باتری با ماندگاری بالا'],
    disadvantages: ['قیمت نسبتاً بالا'],
    likes: 42,
    dislikes: 1,
    seller_title: 'دیجی‌تک پلاس',
    seller_code: 'SEL-1042',
    true_to_size_rate: 5,
    category: 'کالای دیجیتال',
  },
  {
    id: 'com-2',
    title: 'تاثیر سریع و شفافیت فوق‌العاده پوست',
    body: 'بعد از ۳ هفته استفاده منظم صبح و شب، شفافیت پوست و کاهش لکه‌ها کاملاً مشهود است. بافت بسیار سبکی دارد و اصلا چسبناک نیست. ارسال نیلوفر بیوتی هم با اشانتیون و بسته‌بندی عالی بود.',
    created_at: '۱۴۰۳/۰۵/۱۳',
    rate: 5,
    recommendation_status: 'recommended',
    is_buyer: true,
    product_id: 'prd-2',
    product_title_fa: 'سرم ویتامین سی روشن‌کننده و جوان‌ساز پوست لاروش پوزای',
    advantages: ['جذب سریع بدون چربی', 'اصالت کامل محصول', 'روشن‌کنندگی محسوس'],
    disadvantages: [],
    likes: 38,
    dislikes: 2,
    seller_title: 'نیلوفر بیوتی',
    seller_code: 'SEL-7019',
    true_to_size_rate: 5,
    category: 'زیبایی و سلامت',
  },
  {
    id: 'com-3',
    title: 'شارژدهی ضعیف و بدنه بی‌کیفیت غیراصل',
    body: 'متاسفانه بعد از ده دقیقه شارژ تمام شد و قدرت مکش بسیار ضعیف‌تر از مشخصات اعلامی است. فروشنده هم پاسخگوی گارانتی نبود و مجبور به مرجوع کردن شدم. به هیچ عنوان پیشنهاد نمی‌کنم.',
    created_at: '۱۴۰۳/۰۵/۱۲',
    rate: 1,
    recommendation_status: 'not_recommended',
    is_buyer: true,
    product_id: 'prd-6',
    product_title_fa: 'جاروبرقی شارژی پرتابل ماشین توربو اکس مدل TX-90',
    advantages: [],
    disadvantages: ['قدرت مکش بسیار ضعیف', 'باتری معیوب', 'عدم تطابق با عکس'],
    likes: 54,
    dislikes: 3,
    seller_title: 'بازرگانی کیان تجارت',
    seller_code: 'SEL-5098',
    true_to_size_rate: 2,
    category: 'لوازم خانگی',
  },
  {
    id: 'com-4',
    title: 'دستگاه خوش‌ساخت و عصاره‌گیری استاندارد',
    body: 'کرما عالی، طراحی بسیار باریک و زیبا روی کانتر آشپزخانه. زود گرم میشه و بخارش برای لاته آرت مناسبه. از خریدم خیلی راضی هستم.',
    created_at: '۱۴۰۳/۰۵/۱۱',
    rate: 5,
    recommendation_status: 'recommended',
    is_buyer: true,
    product_id: 'prd-4',
    product_title_fa: 'اسپرسوساز دلونگی نیمه‌صنعتی مدل EC685 استیل',
    advantages: ['طراحی جمع‌وجور', 'گرم‌شدن سریع', 'فشار بخار مناسب'],
    disadvantages: ['نیاز به تمیزکاری مداوم سبد پودر'],
    likes: 29,
    dislikes: 0,
    seller_title: 'آریا هوم استایل',
    seller_code: 'SEL-2089',
    true_to_size_rate: 5,
    category: 'لوازم خانگی',
  },
  {
    id: 'com-5',
    title: 'کالای تقلبی و خطر داغی بالا',
    body: 'شدیدا داغ می‌کند و بوی سوختگی پلاستیک می‌دهد. گوشی پیام ولتاژ غیرعادی داد. کالا قطعا غیر اصل است و فروشنده نباید به عنوان اورجینال می‌فروخت.',
    created_at: '۱۴۰۳/۰۵/۱۰',
    rate: 2,
    recommendation_status: 'not_recommended',
    is_buyer: true,
    product_id: 'prd-7',
    product_title_fa: 'شارژر دیواری فست شارژ ۶۵ وات سه پورت غیراصل',
    advantages: [],
    disadvantages: ['داغی بیش از حد خطرناک', 'غیر اصل و تقلبی', 'افت ولتاژ ناگهانی'],
    likes: 47,
    dislikes: 2,
    seller_title: 'پارسیان الکترونیک',
    seller_code: 'SEL-6034',
    true_to_size_rate: 1,
    category: 'کالای دیجیتال',
  },
  {
    id: 'com-6',
    title: 'نمایشگر شفاف و سنسورهای دقیق سلامتی',
    body: 'صفحه نمایش پرنورتر از سری‌های قبلی، قابلیت دابل تپ بسیار کاربردی است. تنها نکته باتری یک روزه آن است که کاش ارتقا می‌یافت.',
    created_at: '۱۴۰۳/۰۵/۰۹',
    rate: 4,
    recommendation_status: 'recommended',
    is_buyer: true,
    product_id: 'prd-3',
    product_title_fa: 'ساعت هوشمند اپل واچ سری ۹ سایز ۴۵ میلی‌متری',
    advantages: ['روشنایی صفحه فوق‌العاده', 'سنسورهای دقیق پایش سلامت', 'پردازنده سریع S9'],
    disadvantages: ['عمر باتری ۱۸ ساعته'],
    likes: 19,
    dislikes: 1,
    seller_title: 'نوآوران پایتخت',
    seller_code: 'SEL-3051',
    true_to_size_rate: 4,
    category: 'کالای دیجیتال',
  },
  {
    id: 'com-7',
    title: 'کیفیت دوخت پایین و آب‌رفتگی شدید در اولین شستشو',
    body: 'با اولین شستشو با آب سرد طرح چاپ ترک خورد و سایز لباس آب رفت. کیفیت دوخت پایین است و نخ‌های اضافی داشت.',
    created_at: '۱۴۰۳/۰۵/۰۸',
    rate: 1,
    recommendation_status: 'not_recommended',
    is_buyer: true,
    product_id: 'prd-8',
    product_title_fa: 'تی‌شرت نخی چاپ‌دار طرح مینیمال (رنگ‌پریدگی در شستشو)',
    advantages: [],
    disadvantages: ['رنگ‌پریدگی چاپ', 'تغییر فرم پارچه', 'عدم انطباق سایز'],
    likes: 31,
    dislikes: 0,
    seller_title: 'تکسام اکسپرس',
    seller_code: 'SEL-8023',
    true_to_size_rate: 2,
    category: 'مد و پوشاک',
  },
  {
    id: 'com-8',
    title: 'گرم، شیک و دقیقاً مطابق سایزبندی',
    body: 'جنس داخل کرکی و گرمه، قد و قواره استاندارده. زیپ روان کار می‌کنه و رنگ طوسی دقیقاً مطابق تصویر بود.',
    created_at: '۱۴۰۳/۰۵/۰۷',
    rate: 4,
    recommendation_status: 'recommended',
    is_buyer: true,
    product_id: 'prd-5',
    product_title_fa: 'هودی زیپ‌دار پشمی داخل کرک مردانه طرح کلاسیک',
    advantages: ['دوخت تمیز و محکم', 'گرمایش بالا برای پاییز و زمستان', 'تطابق کامل با جدول سایز'],
    disadvantages: [],
    likes: 16,
    dislikes: 1,
    seller_title: 'مد و پوشاک زاگرس',
    seller_code: 'SEL-4012',
    true_to_size_rate: 5,
    category: 'مد و پوشاک',
  },
  {
    id: 'com-9',
    title: 'میکروفون عالی برای مکالمه در محیط باز',
    body: 'میکروفون مکالمه به شدت ارتقا پیدا کرده و در محیط باد یا ترافیک صدا کاملا واضح منتقل می‌شود. با تشکر از دیجی‌تک پلاس برای تحویل سریع.',
    created_at: '۱۴۰۳/۰۵/۰۶',
    rate: 5,
    recommendation_status: 'recommended',
    is_buyer: true,
    product_id: 'prd-1',
    product_title_fa: 'هدفون بی‌سیم نویز کنسلینگ سونی WH-1000XM5',
    advantages: ['مکالمه بسیار شفاف', 'تحویل فوری و سلامت فیزیکی'],
    disadvantages: [],
    likes: 27,
    dislikes: 0,
    seller_title: 'دیجی‌تک پلاس',
    seller_code: 'SEL-1042',
    true_to_size_rate: 5,
    category: 'کالای دیجیتال',
  },
  {
    id: 'com-10',
    title: 'عدم ایجاد جوش و بوی بسیار ملایم',
    body: 'خیلی راضی‌ام، بوی ملایم مرکبات داره و جذبش سریعه. بدون اینکه جوش بزنم پوستم شاداب شده.',
    created_at: '۱۴۰۳/۰۵/۰۵',
    rate: 5,
    recommendation_status: 'recommended',
    is_buyer: true,
    product_id: 'prd-2',
    product_title_fa: 'سرم ویتامین سی روشن‌کننده و جوان‌ساز پوست لاروش پوزای',
    advantages: ['سازگار با پوست حساس', 'بسته‌بندی مقاوم در برابر اکسیداسیون'],
    disadvantages: [],
    likes: 22,
    dislikes: 0,
    seller_title: 'نیلوفر بیوتی',
    seller_code: 'SEL-7019',
    true_to_size_rate: 5,
    category: 'زیبایی و سلامت',
  },
  {
    id: 'com-11',
    title: 'صدای ناهنجار موتور و پلاستیک خشک',
    body: 'بدنه پلاستیک خشک و شکننده است، چرخ‌ها گیر می‌کنند و صدای موتور بسیار ناهنجار است.',
    created_at: '۱۴۰۳/۰۵/۰۴',
    rate: 2,
    recommendation_status: 'not_recommended',
    is_buyer: true,
    product_id: 'prd-6',
    product_title_fa: 'جاروبرقی شارژی پرتابل ماشین توربو اکس مدل TX-90',
    advantages: [],
    disadvantages: ['صدای بسیار بلند و لرزش', 'متریال ضعیف بدنه'],
    likes: 18,
    dislikes: 1,
    seller_title: 'بازرگانی کیان تجارت',
    seller_code: 'SEL-5098',
    true_to_size_rate: 2,
    category: 'لوازم خانگی',
  },
  {
    id: 'com-12',
    title: 'کیفیت عالی قهوه و طراحی فشرده',
    body: 'دستگاه جمع و جور و باکیفیتی هست. تمیز کردن پرتافیلتر راحته و قهوه با کیفیتی مثل کافه‌ها تحویل میده.',
    created_at: '۱۴۰۳/۰۵/۰۳',
    rate: 4,
    recommendation_status: 'recommended',
    is_buyer: true,
    product_id: 'prd-4',
    product_title_fa: 'اسپرسوساز دلونگی نیمه‌صنعتی مدل EC685 استیل',
    advantages: ['پمپ ۱۵ بار استاندارد', 'کیفیت ساخت قطعات استیل'],
    disadvantages: [],
    likes: 14,
    dislikes: 0,
    seller_title: 'آریا هوم استایل',
    seller_code: 'SEL-2089',
    true_to_size_rate: 4,
    category: 'لوازم خانگی',
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // API ENDPOINT: OVERVIEW
  // ==========================================
  app.get('/api/overview', (_req, res) => {
    const total_comments = 11730;
    const positive_comments = 9180;
    const negative_comments = 1960;
    const neutral_comments = 590;

    const total_sellers = SELLERS.length;
    const successful_sellers = SELLERS.filter((s) => s.seller_status === 'successful').length;
    const unsuccessful_sellers = SELLERS.filter((s) => s.seller_status === 'unsuccessful').length;

    const total_products = PRODUCTS.length;
    const successful_products = PRODUCTS.filter((p) => p.product_status === 'successful').length;
    const unsuccessful_products = PRODUCTS.filter((p) => p.product_status === 'unsuccessful').length;

    const sentimentTimeline = [
      { month: 'فروردین', positive: 680, negative: 190, neutral: 60, total: 930 },
      { month: 'اردیبهشت', positive: 740, negative: 180, neutral: 55, total: 975 },
      { month: 'خرداد', positive: 810, negative: 165, neutral: 50, total: 1025 },
      { month: 'تیر', positive: 920, negative: 150, neutral: 45, total: 1115 },
      { month: 'مرداد', positive: 1050, negative: 140, neutral: 40, total: 1230 },
      { month: 'شهریور', positive: 1180, negative: 135, neutral: 48, total: 1363 },
    ];

    const categoryDistribution = [
      { category: 'کالای دیجیتال', total: 4200, positive: 3500, negative: 700, positivePercentage: 83.3, negativePercentage: 16.7 },
      { category: 'زیبایی و سلامت', total: 3100, positive: 2850, negative: 250, positivePercentage: 91.9, negativePercentage: 8.1 },
      { category: 'لوازم خانگی', total: 2450, positive: 1750, negative: 700, positivePercentage: 71.4, negativePercentage: 28.6 },
      { category: 'مد و پوشاک', total: 1980, positive: 1520, negative: 460, positivePercentage: 76.7, negativePercentage: 23.3 },
    ];

    const topSeller = SELLERS.find((s) => s.seller_code === 'SEL-7019') || SELLERS[0];
    const weakestSeller = SELLERS.find((s) => s.seller_code === 'SEL-8023') || SELLERS[SELLERS.length - 1];
    const topProduct = PRODUCTS.find((p) => p.id === 'prd-1') || PRODUCTS[0];
    const weakestProduct = PRODUCTS.find((p) => p.id === 'prd-8') || PRODUCTS[PRODUCTS.length - 1];

    res.json({
      kpis: {
        total_comments,
        positive_comments,
        negative_comments,
        positive_percentage: Math.round((positive_comments / total_comments) * 1000) / 10,
        negative_percentage: Math.round((negative_comments / total_comments) * 1000) / 10,
        neutral_percentage: Math.round((neutral_comments / total_comments) * 1000) / 10,
        average_rating: 4.28,
        total_sellers,
        successful_sellers,
        unsuccessful_sellers,
        seller_success_rate: Math.round((successful_sellers / total_sellers) * 100),
        total_products,
        successful_products,
        unsuccessful_products,
        product_success_rate: Math.round((successful_products / total_products) * 100),
      },
      sentimentTimeline,
      categoryDistribution,
      topSeller,
      weakestSeller,
      topProduct,
      weakestProduct,
      recentComments: COMMENTS.slice(0, 5),
    });
  });

  // ==========================================
  // API ENDPOINT: COMMENTS SUMMARY
  // ==========================================
  app.get('/api/comments-summary', (req, res) => {
    res.json({
      total_comments: 11730,
      positive_comments: 9180,
      negative_comments: 1960,
      neutral_comments: 590,
      positive_percentage: 78.2,
      negative_percentage: 16.7,
      neutral_percentage: 5.1,
      average_rating: 4.28,
    });
  });

  // ==========================================
  // API ENDPOINT: COMMENTS
  // (Strictly based on REAL Comment fields)
  // Positive: recommendation_status == "recommended" && rate >= 4
  // Negative: recommendation_status == "not_recommended" && rate <= 2
  // ==========================================
  app.get('/api/comments', (req, res) => {
    const { sentiment, rating, category, search, page = '1', limit = '10' } = req.query;

    let filtered = [...COMMENTS];

    if (sentiment && sentiment !== 'all') {
      if (sentiment === 'positive') {
        filtered = filtered.filter((c) => c.recommendation_status === 'recommended' && c.rate >= 4);
      } else if (sentiment === 'negative') {
        filtered = filtered.filter((c) => c.recommendation_status === 'not_recommended' && c.rate <= 2);
      }
    }
    if (rating && rating !== 'all') {
      filtered = filtered.filter((c) => c.rate === Number(rating));
    }
    if (category && category !== 'all') {
      filtered = filtered.filter((c) => c.category === category);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.body.toLowerCase().includes(q) ||
          c.product_title_fa.toLowerCase().includes(q) ||
          c.seller_title.toLowerCase().includes(q) ||
          c.seller_code.toLowerCase().includes(q)
      );
    }

    const total_comments = 11730;
    const positive_comments = 9180;
    const negative_comments = 1960;
    const average_rating = 4.28;
    const avg_comments_per_product = 1466;

    const ratingDistribution = [
      { stars: '۵ ستاره', count: 6850, percentage: 58.4, color: '#10B981' },
      { stars: '۴ ستاره', count: 2330, percentage: 19.8, color: '#34D399' },
      { stars: '۳ ستاره', count: 590, percentage: 5.0, color: '#FBBF24' },
      { stars: '۲ ستاره', count: 720, percentage: 6.1, color: '#F87171' },
      { stars: '۱ ستاره', count: 1240, percentage: 10.7, color: '#EF4444' },
    ];

    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const ps = Math.max(1, parseInt(String(limit), 10) || 21);
    const totalCount = filtered.length;
    const total_pages = Math.max(1, Math.ceil(totalCount / ps));
    const paginatedComments = filtered.slice((p - 1) * ps, p * ps);

    res.json({
      metrics: {
        total_comments,
        positive_comments,
        negative_comments,
        positive_rate: 78.2,
        negative_rate: 16.7,
        average_rating,
        avg_comments_per_product,
        change_rate: '+14.8%',
      },
      ratingDistribution,
      comments: paginatedComments,
      totalCount,
      page: p,
      limit: ps,
      total_pages,
    });
  });

  // ==========================================
  // API ENDPOINT: SELLERS
  // (Strictly based on REAL Seller fields)
  // Health score = 50% customer satisfaction + 30% (100 - fake_product_percent) + 20% (100 - low_rated_product_percent)
  // ==========================================
  app.get('/api/sellers', (req, res) => {
    const { status, category, search, sort, page = '1', page_size = '20' } = req.query;

    let list = [...SELLERS];

    if (status && status !== 'all') {
      list = list.filter((s) => s.seller_status === status);
    }
    if (category && category !== 'all') {
      list = list.filter((s) => s.category === category);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.seller_title.toLowerCase().includes(q) ||
          s.seller_code.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }

    if (sort === 'health_desc') {
      list.sort((a, b) => b.seller_health_score - a.seller_health_score);
    } else if (sort === 'comments_desc') {
      list.sort((a, b) => b.total_comments - a.total_comments);
    } else if (sort === 'satisfaction_desc') {
      list.sort((a, b) => b.customer_satisfaction_score - a.customer_satisfaction_score);
    } else if (sort === 'products_desc') {
      list.sort((a, b) => b.sold_products - a.sold_products);
    }

    const total_sellers = SELLERS.length;
    const successful_sellers = SELLERS.filter((s) => s.seller_status === 'successful').length;
    const unsuccessful_sellers = SELLERS.filter((s) => s.seller_status === 'unsuccessful').length;
    const avg_seller_rating = (
      SELLERS.reduce((acc, cur) => acc + cur.customer_satisfaction_score, 0) / (total_sellers * 20)
    ).toFixed(2);
    const avg_satisfaction_score = (
      SELLERS.reduce((acc, cur) => acc + cur.customer_satisfaction_score, 0) / total_sellers
    ).toFixed(1);

    const performanceComparison = [
      { metric: 'رضایت مشتریان', successful: 88.9, unsuccessful: 34.5, unit: '%' },
      { metric: 'امتیاز سلامت فروشنده', successful: 93.0, unsuccessful: 40.7, unit: 'از ۱۰۰' },
      { metric: 'نرخ کالای غیراصل / فیک', successful: 0.6, unsuccessful: 23.7, unit: '%' },
      { metric: 'محصولات کم‌امتیاز', successful: 5.0, unsuccessful: 44.2, unit: '%' },
    ];

    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const ps = Math.max(1, parseInt(String(page_size), 10) || 20);
    const totalCount = list.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / ps));
    const paginatedSellers = list.slice((p - 1) * ps, p * ps);

    res.json({
      metrics: {
        total_sellers,
        successful_sellers,
        unsuccessful_sellers,
        avg_seller_rating: Number(avg_seller_rating),
        avg_satisfaction_score: Number(avg_satisfaction_score),
        topSeller: SELLERS.find((s) => s.seller_code === 'SEL-7019') || SELLERS[0],
        weakestSeller: SELLERS.find((s) => s.seller_code === 'SEL-8023') || SELLERS[SELLERS.length - 1],
      },
      performanceComparison,
      sellers: paginatedSellers,
      page: p,
      page_size: ps,
      totalCount,
      totalPages,
    });
  });

  // ==========================================
  // API ENDPOINT: PRODUCTS
  // (Strictly based on REAL Product fields)
  // ==========================================
  app.get('/api/products', (req, res) => {
    const { status, category, search, sort, page = '1', page_size = '50' } = req.query;

    let list = [...PRODUCTS];

    if (status && status !== 'all') {
      list = list.filter((p) => p.product_status === status);
    }
    if (category && category !== 'all') {
      list = list.filter((p) => p.category1 === category);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title_fa.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.seller.toLowerCase().includes(q) ||
          p.sub_category.toLowerCase().includes(q) ||
          p.category1.toLowerCase().includes(q)
      );
    }

    if (sort === 'rate_desc') {
      list.sort((a, b) => b.rate - a.rate);
    } else if (sort === 'rate_cnt_desc') {
      list.sort((a, b) => b.rate_cnt - a.rate_cnt);
    } else if (sort === 'bayesian_desc') {
      list.sort((a, b) => b.bayesian_product_score - a.bayesian_product_score);
    } else if (sort === 'health_desc') {
      list.sort((a, b) => b.product_health_score - a.product_health_score);
    }

    const total_products = PRODUCTS.length;
    const successful_products = PRODUCTS.filter((p) => p.product_status === 'successful').length;
    const unsuccessful_products = PRODUCTS.filter((p) => p.product_status === 'unsuccessful').length;
    const avg_rating = (PRODUCTS.reduce((acc, cur) => acc + cur.rate, 0) / total_products).toFixed(2);
    const fake_products_count = PRODUCTS.filter((p) => p.is_fake).length;

    const categoryBreakdown = [
      { name: 'کالای دیجیتال', successful: 2, unsuccessful: 1, total: 3 },
      { name: 'زیبایی و سلامت', successful: 1, unsuccessful: 0, total: 1 },
      { name: 'لوازم خانگی', successful: 1, unsuccessful: 1, total: 2 },
      { name: 'مد و پوشاک', successful: 1, unsuccessful: 1, total: 2 },
    ];

    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const ps = Math.max(1, parseInt(String(page_size), 10) || 50);
    const totalCount = list.length;
    const total_pages = Math.max(1, Math.ceil(totalCount / ps));
    const paginatedProducts = list.slice((p - 1) * ps, p * ps);

    res.json({
      metrics: {
        total_products,
        successful_products,
        unsuccessful_products,
        avg_rating: Number(avg_rating),
        fake_products_count,
        topProduct: PRODUCTS.find((p) => p.id === 'prd-1') || PRODUCTS[0],
        weakestProduct: PRODUCTS.find((p) => p.id === 'prd-8') || PRODUCTS[PRODUCTS.length - 1],
      },
      categoryBreakdown,
      products: paginatedProducts,
      page: p,
      page_size: ps,
      totalCount,
      total_pages,
    });
  });

  // ==========================================
  // API ENDPOINT: CHATBOT STATUS & MESSAGE
  // ==========================================
  app.get('/api/chatbot/status', (_req, res) => {
    res.json({
      status: 'online',
      model: 'persian-ecommerce-analysis-v1',
      ready: true,
    });
  });

  app.post('/api/chatbot/message', (req, res) => {
    const { message } = req.body || {};
    const text = String(message || '').toLowerCase();

    let reply = 'سلام! من دستیار هوشمند تحلیل بازارگاه و رفتار خریداران هستم. بر اساس تحلیل داده‌های پایگاه، می‌توانید درباره وضعیت کامنت‌ها، عملکرد فروشندگان و کیفیت محصولات از من سوال بپرسید.';

    if (text.includes('فروشنده') || text.includes('فروشندگان')) {
      reply = 'بر اساس داده‌های ارزیابی، برترین فروشنده «دیجی‌استور مرکزی» (SEL-7019) با نرخ رضایت ۹۵٪ و نمره سلامت ۹۶ است. در مقابل، فروشگاه «کالای دیجیتال امید» (SEL-8023) به دلیل ارسال ۲۸٪ کالای غیراصل و نرخ رضایت پایین (۲۸٪) در رده ناموفق قرار گرفته است.';
    } else if (text.includes('محصول') || text.includes('کالا') || text.includes('کیفیت')) {
      reply = 'بیش از ۹۲٪ نظرات برای کالاهای دارای اصالت مثبت بوده است. کالای «هدفون بلوتوثی پرو مدل ANC-2024» بالاترین امتیاز بیزین (۴.۸۵) را داراست و کالای «کابل شارژ فست لایتنینگ» به دلیل نرخ بالای کالای فیک (۶۵٪) کمترین نمره سلامت را ثبت نموده است.';
    } else if (text.includes('کامنت') || text.includes('نظر') || text.includes('رضایت')) {
      reply = 'از مجموع کل نظرات، ۷۸.۲٪ مثبت، ۱۶.۷٪ منفی و ۵.۱٪ ممتنع هستند. بیشترین علت نارضایتی در دسته‌بندی کالاهای ناموفق، تاخیر در ارسال و مغایرت اصالت کالا بوده است.';
    }

    res.json({ reply });
  });

  // ==========================================
  // VITE MIDDLEWARE SETUP
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`E-Commerce Analytics Server running on http://localhost:${PORT}`);
  });
}

startServer();

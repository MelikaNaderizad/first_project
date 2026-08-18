-- price in first category
SELECT
    category1,
    COUNT(*) AS product_count,
    AVG(price) AS avg_price,
    MIN(price) AS min_price,
    MAX(price) AS max_price
FROM products
WHERE price > 0
GROUP BY category1
ORDER BY avg_price DESC;

-- percentage
SELECT
    id,
    title_fa,
    category1,
    price,
    min_price_last_month,
    CAST(
        (min_price_last_month - price) * 100.0 / NULLIF(min_price_last_month, 0)
        AS DECIMAL(5,2)
    ) AS discount_percent
FROM products
WHERE min_price_last_month > 0
  AND price > 0
  AND price < min_price_last_month   
ORDER BY discount_percent DESC;

-- CV
SELECT
    category1,
    COUNT(*) AS product_count,
    AVG(price) AS avg_price,
    STDEV(price) AS price_stddev,
    CAST(STDEV(price) / NULLIF(AVG(price), 0) AS DECIMAL(5,2)) AS coeff_of_variation
FROM products
WHERE price > 0
GROUP BY category1
HAVING COUNT(*) >= 10
ORDER BY coeff_of_variation DESC;

-- number of goods in different price various
SELECT
    CASE
        WHEN price < 500000        THEN '1. زیر ۵۰۰ هزار'
        WHEN price < 2000000       THEN '2. ۵۰۰ هزار تا ۲ میلیون'
        WHEN price < 10000000      THEN '3. ۲ تا ۱۰ میلیون'
        ELSE                             '4. بالای ۱۰ میلیون'
    END AS price_bucket,
    COUNT(*) AS product_count,
    CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () AS DECIMAL(5,2)) AS percent_of_total
FROM products
WHERE price > 0
GROUP BY
    CASE
        WHEN price < 500000        THEN '1. زیر ۵۰۰ هزار'
        WHEN price < 2000000       THEN '2. ۵۰۰ هزار تا ۲ میلیون'
        WHEN price < 10000000      THEN '3. ۲ تا ۱۰ میلیون'
        ELSE                             '4. بالای ۱۰ میلیون'
    END
ORDER BY price_bucket;


-- avg rate 
SELECT
    category1,
    COUNT(*) AS product_count,
    AVG(CAST(rate AS FLOAT)) AS avg_rate,
    AVG(rate_cnt) AS avg_rate_count
FROM products
WHERE rate IS NOT NULL
GROUP BY category1
HAVING COUNT(*) >= 10
ORDER BY avg_rate DESC;

-- percentage of goods with at least '4' in rate
SELECT
    category1,
    COUNT(*) AS total_products,
    SUM(CASE WHEN rate >= 4 THEN 1 ELSE 0 END) AS high_rated_count,
    CAST(
        SUM(CASE WHEN rate >= 4 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
        AS DECIMAL(5,2)
    ) AS high_rated_percent
FROM products
WHERE rate IS NOT NULL
GROUP BY category1
HAVING COUNT(*) >= 10
ORDER BY high_rated_percent DESC;

-- correlation between price and rate
WITH stats AS (
    SELECT
        COUNT(*) AS n,
        SUM(CAST(price AS FLOAT))                        AS sum_x,
        SUM(CAST(rate AS FLOAT))                          AS sum_y,
        SUM(CAST(price AS FLOAT) * CAST(rate AS FLOAT))   AS sum_xy,
        SUM(CAST(price AS FLOAT) * CAST(price AS FLOAT))  AS sum_x2,
        SUM(CAST(rate AS FLOAT) * CAST(rate AS FLOAT))    AS sum_y2
    FROM products
    WHERE price > 0 AND rate IS NOT NULL
)

-- Pearson Correlation
SELECT
    n,
    (n * sum_xy - sum_x * sum_y)
    /
    NULLIF(
        SQRT((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y)),
        0
    ) AS price_rate_correlation
FROM stats;

SELECT
    is_fake,
    COUNT(*) AS product_count,
    AVG(price) AS avg_price,
    AVG(CAST(rate AS FLOAT)) AS avg_rate
FROM products
WHERE is_fake IS NOT NULL AND price > 0
GROUP BY is_fake;


SELECT
    recommendation_status,
    COUNT(*) AS comment_count,
    CAST(
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()
        AS DECIMAL(5,2)
    ) AS percent_of_total
FROM comments
GROUP BY recommendation_status
ORDER BY comment_count DESC;


SELECT
    CAST(
        SUM(CASE WHEN is_buyer = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
        AS DECIMAL(5,2)
    ) AS verified_buyer_percent,
    COUNT(*) AS total_comments
FROM comments;


SELECT TOP 20
    product_id,
    SUM(likes)    AS total_likes,
    SUM(dislikes) AS total_dislikes,
    CAST(
        SUM(likes) * 1.0 / NULLIF(SUM(dislikes), 0)
        AS DECIMAL(6,2)
    ) AS like_dislike_ratio,
    COUNT(*) AS comment_count
FROM comments
GROUP BY product_id
HAVING SUM(likes) + SUM(dislikes) >= 20
ORDER BY like_dislike_ratio DESC;

SELECT TOP 20
    product_id,
    COUNT(*) AS total_comments,
    SUM(CASE WHEN recommendation_status = 'not_recommended' THEN 1 ELSE 0 END) AS not_recommended_count,
    CAST(
        SUM(CASE WHEN recommendation_status = 'not_recommended' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
        AS DECIMAL(5,2)
    ) AS not_recommended_percent
FROM comments
GROUP BY product_id
HAVING COUNT(*) >= 15  
ORDER BY not_recommended_percent DESC;


SELECT TOP 20
    product_id,
    COUNT(*) AS comment_count,
    SUM(likes) AS total_likes,
    SUM(dislikes) AS total_dislikes
FROM comments
GROUP BY product_id
ORDER BY comment_count DESC;

SELECT TOP 20
    seller,
    COUNT(*) AS product_count
FROM products
WHERE seller <> ''
GROUP BY seller
ORDER BY product_count DESC;

SELECT
    seller,
    COUNT(*) AS product_count,
    AVG(CAST(rate AS FLOAT)) AS avg_rate,
    SUM(rate_cnt) AS total_reviews
FROM products
WHERE seller <> '' AND rate IS NOT NULL
GROUP BY seller
HAVING COUNT(*) >= 20
ORDER BY avg_rate DESC;

SELECT
    seller,
    COUNT(*) AS total_products,
    SUM(CASE WHEN is_fake = 1 THEN 1 ELSE 0 END) AS fake_count,
    CAST(
        SUM(CASE WHEN is_fake = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
        AS DECIMAL(5,2)
    ) AS fake_percent
FROM products
WHERE seller <> ''
GROUP BY seller
HAVING COUNT(*) >= 20
ORDER BY fake_percent DESC;

SELECT TOP 20
    p.id,
    p.title_fa,
    p.rate AS product_rate,
    COUNT(c.id) AS comment_count,
    SUM(CASE WHEN c.recommendation_status = 'not_recommended' THEN 1 ELSE 0 END) AS not_recommended_count,
    CAST(
        SUM(CASE WHEN c.recommendation_status = 'not_recommended' THEN 1 ELSE 0 END) * 100.0 / COUNT(c.id)
        AS DECIMAL(5,2)
    ) AS not_recommended_percent
FROM products p
JOIN comments c ON c.product_id = p.id
WHERE p.rate >= 4.0
GROUP BY p.id, p.title_fa, p.rate
HAVING COUNT(c.id) >= 15
   AND SUM(CASE WHEN c.recommendation_status = 'not_recommended' THEN 1 ELSE 0 END) * 100.0 / COUNT(c.id) >= 30
ORDER BY not_recommended_percent DESC;

SELECT
    p.category1,
    AVG(p.price) AS avg_price,
    COUNT(DISTINCT p.id) AS product_count,
    CAST(
        SUM(CASE WHEN c.recommendation_status = 'not_recommended' THEN 1 ELSE 0 END) * 100.0
        / NULLIF(COUNT(c.id), 0)
        AS DECIMAL(5,2)
    ) AS not_recommended_percent
FROM products p
JOIN comments c ON c.product_id = p.id
WHERE p.price > 0
GROUP BY p.category1
HAVING COUNT(DISTINCT p.id) >= 10
ORDER BY avg_price DESC, not_recommended_percent DESC;

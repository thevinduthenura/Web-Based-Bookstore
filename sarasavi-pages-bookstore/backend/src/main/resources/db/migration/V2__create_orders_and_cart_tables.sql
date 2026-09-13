-- ==============================================================================
-- Flyway Database Migration: V2
-- Module 6: Orders & Shopping Cart
-- Owner: Diyes C.L. (IT25100263) - Role: ORDER_ADMIN
-- ==============================================================================

-- 1. Books Table (Catalog & Shopping Cart Storefront)
CREATE TABLE IF NOT EXISTS books (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    cover_image VARCHAR(500),
    stock_quantity INT NOT NULL DEFAULT 0,
    isbn VARCHAR(50),
    description TEXT,
    rating NUMERIC(3, 2) DEFAULT 4.5
);

-- 2. Promotions & Coupons Table
CREATE TABLE IF NOT EXISTS promotions (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage NUMERIC(5, 2) NOT NULL,
    max_discount NUMERIC(10, 2) DEFAULT 0,
    min_spend NUMERIC(10, 2) DEFAULT 0,
    valid_until TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- 3. Customer Carts Table
CREATE TABLE IF NOT EXISTS carts (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(100) UNIQUE NOT NULL,
    total_amount NUMERIC(10, 2) DEFAULT 0.00,
    total_items INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Cart Line Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id VARCHAR(50) REFERENCES carts(id) ON DELETE CASCADE,
    book_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    cover_image VARCHAR(500),
    quantity INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(10, 2) NOT NULL
);

-- ── Seed Initial Books Catalog ────────────────────────────────────────────────
INSERT INTO books (id, title, author, category, price, cover_image, stock_quantity, isbn, description, rating)
VALUES
('b1', 'Madol Doova', 'Martin Wickramasinghe', 'Classic Fiction', 1250.00, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f', 45, '978-955-0201-12-1', 'A classic Sri Lankan adventure novel following Upali and Jinna.', 4.8),
('b2', 'Gamperaliya', 'Martin Wickramasinghe', 'Classic Fiction', 1450.00, 'https://images.unsplash.com/photo-1512820790803-83ca734da794', 30, '978-955-0201-15-2', 'The saga of a traditional southern Sri Lankan family navigating social change.', 4.9),
('b3', 'The Village in the Jungle', 'Leonard Woolf', 'Historical', 1850.00, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e', 25, '978-955-0201-88-0', 'Depicts the lives of people in a remote jungle village in southern Ceylon.', 4.7),
('b4', 'Running in the Family', 'Michael Ondaatje', 'Memoir', 2100.00, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6', 20, '978-067-9746-69-0', 'A fictionalized memoir of the author return to his native Sri Lanka.', 4.6),
('b5', 'Clean Code', 'Robert C. Martin', 'Technology', 4500.00, 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a', 15, '978-013-2350-88-4', 'A handbook of agile software craftsmanship.', 4.9)
ON CONFLICT (id) DO NOTHING;

-- ── Seed Initial Promotion Vouchers ───────────────────────────────────────────
INSERT INTO promotions (id, code, discount_percentage, max_discount, min_spend, valid_until, active)
VALUES
('p1', 'PAGE10', 10.00, 500.00, 2000.00, '2026-12-31 23:59:59', TRUE),
('p2', 'WELCOME20', 20.00, 1000.00, 3000.00, '2026-12-31 23:59:59', TRUE),
('p3', 'SLIITBOOK', 15.00, 750.00, 1500.00, '2026-12-31 23:59:59', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- Flyway Database Migration: V3
-- Module 4: Inventory & Book Catalog Management
-- Owner: Dissanayake S.A.S.D. (IT25101062) - Role: INVENTORY_ADMIN
-- ==============================================================================

-- 1. Inventory Items Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'inventory_items')
BEGIN
    CREATE TABLE inventory_items (
        id                  BIGINT          IDENTITY(1,1) PRIMARY KEY,
        book_id             VARCHAR(50)     NOT NULL UNIQUE,
        isbn                VARCHAR(50)     NOT NULL,
        title               VARCHAR(255)    NOT NULL,
        author              VARCHAR(255)    NOT NULL,
        category            VARCHAR(100)    NOT NULL,
        location            VARCHAR(100),
        stock_quantity      INT             NOT NULL DEFAULT 0,
        safety_stock_level  INT             NOT NULL DEFAULT 10,
        reorder_quantity    INT             NOT NULL DEFAULT 20,
        unit_cost           NUMERIC(10, 2)  NOT NULL DEFAULT 0.00,
        selling_price       NUMERIC(10, 2)  NOT NULL DEFAULT 0.00,
        supplier            VARCHAR(255),
        status              VARCHAR(50)     NOT NULL DEFAULT 'IN_STOCK',
        last_restocked_at   DATETIME2       DEFAULT GETDATE(),
        updated_at          DATETIME2       DEFAULT GETDATE()
    );
END;

-- 2. Stock Adjustment Logs Table (Audit Trail)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'stock_adjustment_logs')
BEGIN
    CREATE TABLE stock_adjustment_logs (
        id                   BIGINT          IDENTITY(1,1) PRIMARY KEY,
        inventory_item_id    BIGINT          NOT NULL,
        book_title           VARCHAR(255)    NOT NULL,
        adjustment_type      VARCHAR(50)     NOT NULL,
        quantity_changed     INT             NOT NULL,
        previous_quantity    INT             NOT NULL,
        new_quantity         INT             NOT NULL,
        reason               NVARCHAR(MAX),
        adjusted_by          VARCHAR(100)    NOT NULL,
        timestamp            DATETIME2       DEFAULT GETDATE()
    );
END;

-- Seed Initial Inventory Items
IF NOT EXISTS (SELECT 1 FROM inventory_items WHERE book_id = 'b1')
    INSERT INTO inventory_items (book_id, isbn, title, author, category, location, stock_quantity, safety_stock_level, reorder_quantity, unit_cost, selling_price, supplier, status)
    VALUES ('b1', '978-955-0201-12-1', 'Madol Doova', 'Martin Wickramasinghe', 'Classic Fiction', 'Aisle 3 - Shelf A1', 45, 10, 30, 850.00, 1250.00, 'Sarasavi Publishers Ltd', 'IN_STOCK');

IF NOT EXISTS (SELECT 1 FROM inventory_items WHERE book_id = 'b2')
    INSERT INTO inventory_items (book_id, isbn, title, author, category, location, stock_quantity, safety_stock_level, reorder_quantity, unit_cost, selling_price, supplier, status)
    VALUES ('b2', '978-955-0201-15-2', 'Gamperaliya', 'Martin Wickramasinghe', 'Classic Fiction', 'Aisle 3 - Shelf A2', 30, 10, 25, 950.00, 1450.00, 'Sarasavi Publishers Ltd', 'IN_STOCK');

IF NOT EXISTS (SELECT 1 FROM inventory_items WHERE book_id = 'b3')
    INSERT INTO inventory_items (book_id, isbn, title, author, category, location, stock_quantity, safety_stock_level, reorder_quantity, unit_cost, selling_price, supplier, status)
    VALUES ('b3', '978-955-0201-88-0', 'The Village in the Jungle', 'Leonard Woolf', 'Historical', 'Aisle 4 - Shelf B1', 25, 10, 20, 1200.00, 1850.00, 'Vijitha Yapa Publications', 'IN_STOCK');

IF NOT EXISTS (SELECT 1 FROM inventory_items WHERE book_id = 'b4')
    INSERT INTO inventory_items (book_id, isbn, title, author, category, location, stock_quantity, safety_stock_level, reorder_quantity, unit_cost, selling_price, supplier, status)
    VALUES ('b4', '978-067-9746-69-0', 'Running in the Family', 'Michael Ondaatje', 'Memoir', 'Aisle 4 - Shelf B3', 8, 10, 25, 1450.00, 2100.00, 'M.D. Gunasena & Co', 'LOW_STOCK');

IF NOT EXISTS (SELECT 1 FROM inventory_items WHERE book_id = 'b5')
    INSERT INTO inventory_items (book_id, isbn, title, author, category, location, stock_quantity, safety_stock_level, reorder_quantity, unit_cost, selling_price, supplier, status)
    VALUES ('b5', '978-013-2350-88-4', 'Clean Code', 'Robert C. Martin', 'Technology', 'Tech Hub - Shelf T1', 15, 8, 15, 3200.00, 4500.00, 'Pearson Global Distribution', 'IN_STOCK');

IF NOT EXISTS (SELECT 1 FROM inventory_items WHERE book_id = 'b6')
    INSERT INTO inventory_items (book_id, isbn, title, author, category, location, stock_quantity, safety_stock_level, reorder_quantity, unit_cost, selling_price, supplier, status)
    VALUES ('b6', '978-144-9373-32-0', 'Designing Data-Intensive Applications', 'Martin Kleppmann', 'Technology', 'Tech Hub - Shelf T2', 4, 10, 20, 4100.00, 5800.00, 'O''Reilly Media / Sarasavi Import', 'LOW_STOCK');

-- Seed Initial Adjustment Logs
INSERT INTO stock_adjustment_logs (inventory_item_id, book_title, adjustment_type, quantity_changed, previous_quantity, new_quantity, reason, adjusted_by)
VALUES
(1, 'Madol Doova', 'RESTOCK', 45, 0, 45, 'New stock arrival from Sarasavi Press warehouse', 'IT25101062'),
(2, 'Gamperaliya', 'RESTOCK', 30, 0, 30, 'Bulk reorder arrival', 'IT25101062'),
(4, 'Running in the Family', 'SALE_DEDUCTION', 12, 20, 8, 'Branch store dispatch and customer orders deduction', 'IT25101062');

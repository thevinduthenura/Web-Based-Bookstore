-- ==============================================================================
-- Flyway Database Migration: V7
-- Module 6: Orders & Logistics Management
-- Owner: Diyes C.L. (IT25100263) - Role: ORDER_ADMIN
-- ==============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'orders')
BEGIN
    CREATE TABLE orders (
        id              VARCHAR(50)     PRIMARY KEY,
        customer_name   VARCHAR(255)    NOT NULL,
        items_summary   VARCHAR(500)    NOT NULL,
        total_amount    NUMERIC(10, 2)  NOT NULL,
        status          VARCHAR(50)     NOT NULL DEFAULT 'PENDING',
        courier         VARCHAR(100),
        tracking_no     VARCHAR(100),
        destination     VARCHAR(255),
        created_at      DATETIME2       DEFAULT GETDATE()
    );
END;

-- Seed initial orders matching the Orders & Logistics Dashboard
IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ORD-90211')
    INSERT INTO orders (id, customer_name, items_summary, total_amount, status, courier, tracking_no, destination, created_at)
    VALUES ('ORD-90211', 'Anura Senanayake', 'Madol Doova (x2), Gamperaliya (x1)', 3850.00, 'OUT_FOR_DELIVERY', 'Domex Express', 'DX-982101', 'Kandy Road, Kiribathgoda', DATEADD(hour, -2, GETDATE()));

IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ORD-90212')
    INSERT INTO orders (id, customer_name, items_summary, total_amount, status, courier, tracking_no, destination, created_at)
    VALUES ('ORD-90212', 'Malsha Rathnayake', 'The Village in the Jungle (x1)', 1850.00, 'PACKING', 'SL Post (Registered)', 'SLP-44019', 'Galle Road, Matara', DATEADD(hour, -1, GETDATE()));

IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ORD-90213')
    INSERT INTO orders (id, customer_name, items_summary, total_amount, status, courier, tracking_no, destination, created_at)
    VALUES ('ORD-90213', 'Dinesh Jayakody', 'Designing Data-Intensive Applications (x1)', 5800.00, 'DELIVERED', 'Pronto Courier', 'PR-102948', 'Havelock Road, Colombo 05', DATEADD(day, -1, GETDATE()));

IF NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ORD-90214')
    INSERT INTO orders (id, customer_name, items_summary, total_amount, status, courier, tracking_no, destination, created_at)
    VALUES ('ORD-90214', 'Nipuni Wickramaratne', 'Running in the Family (x1)', 2100.00, 'PENDING', 'SL Post', 'Pending', 'Peradeniya, Kandy', GETDATE());

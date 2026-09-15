-- =============================================================================
-- Migration V5: Create Payments Table and Seed Transactions
-- Module: M2 – Payment Management
-- Member: Anaf M.K.A.S. (IT25102345)
-- =============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'payments')
BEGIN
    CREATE TABLE payments (
        id                    BIGINT          IDENTITY(1,1) PRIMARY KEY,
        order_id              BIGINT          NOT NULL,
        customer_id           BIGINT          NOT NULL,
        amount                NUMERIC(12, 2)  NOT NULL,
        currency              VARCHAR(5)      NOT NULL DEFAULT 'LKR',
        payment_method        VARCHAR(50)     NOT NULL,
        status                VARCHAR(50)     NOT NULL DEFAULT 'PENDING',
        transaction_reference VARCHAR(100)    UNIQUE,
        gateway_message       VARCHAR(255),
        invoice_number        VARCHAR(50),
        created_at            DATETIME2       NOT NULL DEFAULT GETDATE(),
        updated_at            DATETIME2       NOT NULL DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_payments_order_id' AND object_id = OBJECT_ID('payments'))
    CREATE INDEX idx_payments_order_id ON payments (order_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_payments_customer_id' AND object_id = OBJECT_ID('payments'))
    CREATE INDEX idx_payments_customer_id ON payments (customer_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_payments_status' AND object_id = OBJECT_ID('payments'))
    CREATE INDEX idx_payments_status ON payments (status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_payments_created_at' AND object_id = OBJECT_ID('payments'))
    CREATE INDEX idx_payments_created_at ON payments (created_at);

-- Seed initial transactions for demo and verification
IF NOT EXISTS (SELECT 1 FROM payments WHERE transaction_reference = 'TXN-80921-VISA')
    INSERT INTO payments (order_id, customer_id, amount, currency, payment_method, status, transaction_reference, gateway_message, invoice_number, created_at, updated_at)
    VALUES (1001, 1, 4200.00, 'LKR', 'CARD', 'PAID', 'TXN-80921-VISA', 'Payment processed successfully via Visa gateway', 'INV-2026-00101', DATEADD(HOUR, -2, GETDATE()), DATEADD(HOUR, -2, GETDATE()));

IF NOT EXISTS (SELECT 1 FROM payments WHERE transaction_reference = 'TXN-80920-PAYHERE')
    INSERT INTO payments (order_id, customer_id, amount, currency, payment_method, status, transaction_reference, gateway_message, invoice_number, created_at, updated_at)
    VALUES (1002, 2, 8900.00, 'LKR', 'PAYHERE', 'PAID', 'TXN-80920-PAYHERE', 'Approved through PayHere gateway', 'INV-2026-00102', DATEADD(HOUR, -4, GETDATE()), DATEADD(HOUR, -4, GETDATE()));

IF NOT EXISTS (SELECT 1 FROM payments WHERE transaction_reference = 'TXN-80919-COD')
    INSERT INTO payments (order_id, customer_id, amount, currency, payment_method, status, transaction_reference, gateway_message, invoice_number, created_at, updated_at)
    VALUES (1003, 3, 2450.00, 'LKR', 'CASH_ON_DELIVERY', 'PENDING', 'TXN-80919-COD', 'Cash on delivery order placed', 'INV-2026-00103', DATEADD(HOUR, -5, GETDATE()), DATEADD(HOUR, -5, GETDATE()));

IF NOT EXISTS (SELECT 1 FROM payments WHERE transaction_reference = 'TXN-80918-STRIPE')
    INSERT INTO payments (order_id, customer_id, amount, currency, payment_method, status, transaction_reference, gateway_message, invoice_number, created_at, updated_at)
    VALUES (1004, 1, 1850.00, 'LKR', 'STRIPE', 'REFUNDED', 'TXN-80918-STRIPE', 'Customer requested return and refund processed', 'INV-2026-00104', DATEADD(DAY, -1, GETDATE()), DATEADD(HOUR, -12, GETDATE()));

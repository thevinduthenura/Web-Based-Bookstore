-- =============================================================================
-- Migration V5: Create Payments Table and Seed Transactions
-- Module: M2 – Payment Management
-- Member: Anaf M.K.A.S. (IT25102345)
-- =============================================================================

CREATE TABLE IF NOT EXISTS payments (
    id                    BIGSERIAL PRIMARY KEY,
    order_id              BIGINT NOT NULL,
    customer_id           BIGINT NOT NULL,
    amount                NUMERIC(12, 2) NOT NULL,
    currency              VARCHAR(5) NOT NULL DEFAULT 'LKR',
    payment_method        VARCHAR(50) NOT NULL,
    status                VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    transaction_reference VARCHAR(100) UNIQUE,
    gateway_message       VARCHAR(255),
    invoice_number        VARCHAR(50),
    created_at            TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments (customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at);

-- Seed initial transactions for demo and verification
INSERT INTO payments (order_id, customer_id, amount, currency, payment_method, status, transaction_reference, gateway_message, invoice_number, created_at, updated_at)
VALUES
    (1001, 1, 4200.00, 'LKR', 'CARD', 'PAID', 'TXN-80921-VISA', 'Payment processed successfully via Visa gateway', 'INV-2026-00101', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    (1002, 2, 8900.00, 'LKR', 'PAYHERE', 'PAID', 'TXN-80920-PAYHERE', 'Approved through PayHere gateway', 'INV-2026-00102', CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
    (1003, 3, 2450.00, 'LKR', 'CASH_ON_DELIVERY', 'PENDING', 'TXN-80919-COD', 'Cash on delivery order placed', 'INV-2026-00103', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
    (1004, 1, 1850.00, 'LKR', 'STRIPE', 'REFUNDED', 'TXN-80918-STRIPE', 'Customer requested return and refund processed', 'INV-2026-00104', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '12 hours')
ON CONFLICT (transaction_reference) DO NOTHING;

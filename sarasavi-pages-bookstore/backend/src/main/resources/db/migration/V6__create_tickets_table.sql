-- =============================================================================
-- Migration V6: Create Tickets Table and Seed Initial Support Tickets
-- Module: M3 – Customer Service & Tickets
-- Member: ffZeen A.C. (IT25103342)
-- =============================================================================

CREATE TABLE IF NOT EXISTS tickets (
    id                 BIGSERIAL PRIMARY KEY,
    customer_id        BIGINT NOT NULL,
    customer_name      VARCHAR(255) NOT NULL,
    contact_number     VARCHAR(255),
    subject            VARCHAR(255) NOT NULL,
    description        VARCHAR(2000) NOT NULL,
    status             VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    resolution_details VARCHAR(2000),
    resolved_by        VARCHAR(255),
    created_at         TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP WITHOUT TIME ZONE,
    resolved_at        TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets (customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets (created_at);

-- Seed initial support tickets for demo and SLA verification
INSERT INTO tickets (customer_id, customer_name, contact_number, subject, description, status, resolution_details, resolved_by, created_at, updated_at, resolved_at)
VALUES
    (1, 'Chamath Karunaratne', '+94 77 123 4567', 'Order delivery delayed past estimated date', 'Order #1001 was scheduled for delivery yesterday, but the tracking status still shows in-transit.', 'IN_PROGRESS', 'Contacted logistics courier partner (Pronto). Package scheduled for priority dispatch tomorrow morning.', 'zeen.admin', CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour', NULL),
    (2, 'Sanduni Dissanayake', '+94 71 987 6543', 'Request book exchange for damaged hardcover', 'Received The Lord of the Rings collector edition with a creased corner and damaged dust jacket.', 'OPEN', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '5 hours', NULL),
    (3, 'Kasun Wijesinghe', '+94 76 555 0192', 'Payment deducted but order confirmation pending', 'Card was charged LKR 3,450 for cart checkout, but no invoice SMS was received.', 'RESOLVED', 'Verified transaction reference TXN-80915 on payment gateway. Order #1006 manually confirmed and confirmation email sent.', 'zeen.admin', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '6 hours');

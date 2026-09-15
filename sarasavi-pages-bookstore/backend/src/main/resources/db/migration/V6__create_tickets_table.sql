-- =============================================================================
-- Migration V6: Create Tickets Table and Seed Initial Support Tickets
-- Module: M3 – Customer Service & Tickets
-- Member: Zeen A.C. (IT25103342)
-- =============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tickets')
BEGIN
    CREATE TABLE tickets (
        id                  BIGINT          IDENTITY(1,1) PRIMARY KEY,
        customer_id         BIGINT          NOT NULL,
        customer_name       VARCHAR(255)    NOT NULL,
        contact_number      VARCHAR(255),
        subject             VARCHAR(255)    NOT NULL,
        description         VARCHAR(2000)   NOT NULL,
        status              VARCHAR(20)     NOT NULL DEFAULT 'OPEN',
        resolution_details  VARCHAR(2000),
        resolved_by         VARCHAR(255),
        created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
        updated_at          DATETIME2,
        resolved_at         DATETIME2
    );
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tickets_customer_id' AND object_id = OBJECT_ID('tickets'))
    CREATE INDEX idx_tickets_customer_id ON tickets (customer_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tickets_status' AND object_id = OBJECT_ID('tickets'))
    CREATE INDEX idx_tickets_status ON tickets (status);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tickets_created_at' AND object_id = OBJECT_ID('tickets'))
    CREATE INDEX idx_tickets_created_at ON tickets (created_at);

-- Seed initial support tickets for demo and SLA verification
INSERT INTO tickets (customer_id, customer_name, contact_number, subject, description, status, resolution_details, resolved_by, created_at, updated_at, resolved_at)
VALUES
    (1, 'Chamath Karunaratne', '+94 77 123 4567',
     'Order delivery delayed past estimated date',
     'Order #1001 was scheduled for delivery yesterday, but the tracking status still shows in-transit.',
     'IN_PROGRESS',
     'Contacted logistics courier partner (Pronto). Package scheduled for priority dispatch tomorrow morning.',
     'zeen.admin',
     DATEADD(HOUR, -3, GETDATE()),
     DATEADD(HOUR, -1, GETDATE()),
     NULL),

    (2, 'Sanduni Dissanayake', '+94 71 987 6543',
     'Request book exchange for damaged hardcover',
     'Received The Lord of the Rings collector edition with a creased corner and damaged dust jacket.',
     'OPEN',
     NULL, NULL,
     DATEADD(HOUR, -5, GETDATE()),
     DATEADD(HOUR, -5, GETDATE()),
     NULL),

    (3, 'Kasun Wijesinghe', '+94 76 555 0192',
     'Payment deducted but order confirmation pending',
     'Card was charged LKR 3,450 for cart checkout, but no invoice SMS was received.',
     'RESOLVED',
     'Verified transaction reference TXN-80915 on payment gateway. Order #1006 manually confirmed and confirmation email sent.',
     'zeen.admin',
     DATEADD(DAY, -1, GETDATE()),
     DATEADD(HOUR, -6, GETDATE()),
     DATEADD(HOUR, -6, GETDATE()));

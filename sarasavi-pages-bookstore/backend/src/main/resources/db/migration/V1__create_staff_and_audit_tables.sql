-- ============================================================
-- V1__create_staff_and_audit_tables.sql
-- Sarasavi Pages – SE2030 B9G2 – Module M1
-- Owner: Gunathilaka H.D.T.T. (IT25101540)
-- ============================================================

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    id              BIGSERIAL       PRIMARY KEY,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    full_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(100)    NOT NULL UNIQUE,
    it_number       VARCHAR(20)     NOT NULL UNIQUE,
    role            VARCHAR(30)     NOT NULL,
    active          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP,
    last_login_at   TIMESTAMP
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id               BIGSERIAL       PRIMARY KEY,
    performed_by     VARCHAR(50)     NOT NULL,
    action           VARCHAR(30)     NOT NULL,
    target_username  VARCHAR(50),
    description      VARCHAR(500)    NOT NULL,
    timestamp        TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by ON audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON audit_log(target_username);

-- ============================================================
-- SEED: Pre-built staff accounts
-- Username pattern: {LastName}{FirstInitial}{Last4DigitsOfIT}
-- Password: BCrypt hash of last 4 digits of IT number
--
-- BCrypt hashes (cost=10) pre-generated:
--   1540  → $2a$10$wGKI1TKQB/.r.NlS9gSTluJrGRfHPYioFHsqbhNXP6eoXq.9oPcpC
--   2345  → $2a$10$Dxt0oRMqp3Sl3l6h3ARXAOHyF2hzWXSrpFJAK1XGwxT4YzJXPFhHe
--   3342  → $2a$10$cRMUm3q.KljHbh7qb3q39O9e0OtMXWy1f4lV7mOfHWG2p.hE8o5B2
--   1062  → $2a$10$3.zW6KSEKXKhwf7N5G3ADO0d7BUH2D0RXqpS4HT5IuV0Eg3oKcVMq
--   3013  → $2a$10$dXnhJWlJxBjbW1kBlWvH4OnETFarVAV8zM2W88OJFJJkLLhZsGe.W
--   0263  → $2a$10$XB3xVe7pzNdoMz28yAz3kO8ZhXE2rGSxF.Js5CGRhsSmYbdcV.lG2
-- ============================================================

INSERT INTO staff (username, password, full_name, email, it_number, role, active, created_at)
VALUES
    -- 1. Super Admin – Gunathilaka (full access)
    ('GunathilakaT1540',
     '$2a$10$wGKI1TKQB/.r.NlS9gSTluJrGRfHPYioFHsqbhNXP6eoXq.9oPcpC',
     'Gunathilaka H.D.T.T.',
     'gunathilaka@sarasavipages.lk',
     'IT25101540',
     'SUPER_ADMIN',
     TRUE,
     NOW()),

    -- 2. Payment Admin – Anaf (payment module only)
    ('AnafS2345',
     '$2a$10$Dxt0oRMqp3Sl3l6h3ARXAOHyF2hzWXSrpFJAK1XGwxT4YzJXPFhHe',
     'Anaf M.K.A.S.',
     'anaf@sarasavipages.lk',
     'IT25102345',
     'PAYMENT_ADMIN',
     TRUE,
     NOW()),

    -- 3. Customer Service Admin – Zeen (customer service module only)
    ('ZeenC3342',
     '$2a$10$cRMUm3q.KljHbh7qb3q39O9e0OtMXWy1f4lV7mOfHWG2p.hE8o5B2',
     'Zeen A.C.',
     'zeen@sarasavipages.lk',
     'IT25103342',
     'CUSTOMER_SERVICE_ADMIN',
     TRUE,
     NOW()),

    -- 4. Inventory Admin – Dissanayake (inventory & catalog module only)
    ('DissanayakeD1062',
     '$2a$10$3.zW6KSEKXKhwf7N5G3ADO0d7BUH2D0RXqpS4HT5IuV0Eg3oKcVMq',
     'Dissanayake S.A.S.D.',
     'dissanayake@sarasavipages.lk',
     'IT25101062',
     'INVENTORY_ADMIN',
     TRUE,
     NOW()),

    -- 5. Account Admin – Gayathmi (user accounts module only)
    ('GayathmiR3013',
     '$2a$10$dXnhJWlJxBjbW1kBlWvH4OnETFarVAV8zM2W88OJFJJkLLhZsGe.W',
     'Gayathmi P.G.R.',
     'gayathmi@sarasavipages.lk',
     'IT25103013',
     'ACCOUNT_ADMIN',
     TRUE,
     NOW()),

    -- 6. Order Admin – Diyes (orders & cart module only)
    ('DiyesL0263',
     '$2a$10$XB3xVe7pzNdoMz28yAz3kO8ZhXE2rGSxF.Js5CGRhsSmYbdcV.lG2',
     'Diyes C.L.',
     'diyes@sarasavipages.lk',
     'IT25100263',
     'ORDER_ADMIN',
     TRUE,
     NOW())

ON CONFLICT (username) DO NOTHING;

-- Initial audit log entry for seeding
INSERT INTO audit_log (performed_by, action, target_username, description, timestamp)
VALUES
    ('SYSTEM', 'STAFF_CREATED', 'GunathilakaT1540', 'System: Super Admin account seeded', NOW()),
    ('SYSTEM', 'STAFF_CREATED', 'AnafS2345',        'System: Payment Admin account seeded', NOW()),
    ('SYSTEM', 'STAFF_CREATED', 'ZeenC3342',        'System: Customer Service Admin account seeded', NOW()),
    ('SYSTEM', 'STAFF_CREATED', 'DissanayakeD1062', 'System: Inventory Admin account seeded', NOW()),
    ('SYSTEM', 'STAFF_CREATED', 'GayathmiR3013',    'System: Account Admin account seeded', NOW()),
    ('SYSTEM', 'STAFF_CREATED', 'DiyesL0263',       'System: Order Admin account seeded', NOW());

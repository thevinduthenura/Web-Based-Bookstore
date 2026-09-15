-- ==============================================================================
-- Flyway Database Migration: V4
-- Module 5: User Accounts & Profiles Management
-- Owner: Gayathmi P.G.R. (IT25103013) - Role: ACCOUNT_ADMIN
-- ==============================================================================

-- 1. Customer Profiles Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'customer_profiles')
BEGIN
    CREATE TABLE customer_profiles (
        id              BIGINT          IDENTITY(1,1) PRIMARY KEY,
        customer_id     VARCHAR(50)     NOT NULL UNIQUE,
        email           VARCHAR(255)    NOT NULL UNIQUE,
        first_name      VARCHAR(100)    NOT NULL,
        last_name       VARCHAR(100)    NOT NULL,
        phone           VARCHAR(30),
        address_line1   VARCHAR(255),
        city            VARCHAR(100),
        postal_code     VARCHAR(20),
        country         VARCHAR(100)    DEFAULT 'Sri Lanka',
        status          VARCHAR(50)     NOT NULL DEFAULT 'ACTIVE',
        loyalty_tier    VARCHAR(50)     NOT NULL DEFAULT 'BRONZE',
        loyalty_points  INT             DEFAULT 0,
        kyc_verified    BIT             DEFAULT 0,
        created_at      DATETIME2       DEFAULT GETDATE(),
        updated_at      DATETIME2       DEFAULT GETDATE()
    );
END;

-- Seed Initial Customer Profiles
IF NOT EXISTS (SELECT 1 FROM customer_profiles WHERE customer_id = 'CUST-1001')
    INSERT INTO customer_profiles (customer_id, email, first_name, last_name, phone, address_line1, city, postal_code, country, status, loyalty_tier, loyalty_points, kyc_verified)
    VALUES ('CUST-1001', 'kamal.perera@gmail.com', 'Kamal', 'Perera', '+94771234567', '45/2 Galle Road', 'Colombo 03', '00300', 'Sri Lanka', 'ACTIVE', 'GOLD', 350, 1);

IF NOT EXISTS (SELECT 1 FROM customer_profiles WHERE customer_id = 'CUST-1002')
    INSERT INTO customer_profiles (customer_id, email, first_name, last_name, phone, address_line1, city, postal_code, country, status, loyalty_tier, loyalty_points, kyc_verified)
    VALUES ('CUST-1002', 'nimal.fernando@yahoo.com', 'Nimal', 'Fernando', '+94719876543', '12 Temple Road', 'Kandy', '20000', 'Sri Lanka', 'ACTIVE', 'SILVER', 180, 1);

IF NOT EXISTS (SELECT 1 FROM customer_profiles WHERE customer_id = 'CUST-1003')
    INSERT INTO customer_profiles (customer_id, email, first_name, last_name, phone, address_line1, city, postal_code, country, status, loyalty_tier, loyalty_points, kyc_verified)
    VALUES ('CUST-1003', 'sithara.de.silva@outlook.com', 'Sithara', 'De Silva', '+94765432109', '88 Beach Road', 'Matara', '81000', 'Sri Lanka', 'ACTIVE', 'BRONZE', 60, 0);

IF NOT EXISTS (SELECT 1 FROM customer_profiles WHERE customer_id = 'CUST-1004')
    INSERT INTO customer_profiles (customer_id, email, first_name, last_name, phone, address_line1, city, postal_code, country, status, loyalty_tier, loyalty_points, kyc_verified)
    VALUES ('CUST-1004', 'chaminda.jay@gmail.com', 'Chaminda', 'Jayawardena', '+94701122334', '104 Main Street', 'Negombo', '11500', 'Sri Lanka', 'PENDING_VERIFICATION', 'BRONZE', 50, 0);

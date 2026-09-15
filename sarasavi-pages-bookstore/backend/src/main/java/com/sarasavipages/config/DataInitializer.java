package com.sarasavipages.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Seeds initial demo data on application startup if database tables are empty.
 * Populates data for all 6 members' modules:
 *   - M1: Admin & Staff (GunathilakaT1540 / 1540, etc.)
 *   - M2: Payment (AnafS2345 / 2345 + payments)
 *   - M3: Customer Service (ZeenC3342 / 3342 + tickets)
 *   - M4: Inventory & Catalog (DissanayakeD1062 / 1062 + stock)
 *   - M5: User Accounts (GayathmiR3013 / 3013 + customer profiles)
 *   - M6: Orders & Cart (DiyesL0263 / 0263 + books & promos)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedStaffAndAudit();
        seedBooksAndPromotions();
        seedInventory();
        seedCustomerProfiles();
        seedPayments();
        seedTickets();
    }

    private void seedStaffAndAudit() {
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM staff", Integer.class);
            if (count != null && count > 0) {
                return;
            }

            log.info("Seeding initial staff accounts for all 6 members...");
            LocalDateTime now = LocalDateTime.now();

            String[][] staffData = {
                {"GunathilakaT1540", "1540", "Gunathilaka H.D.T.T.", "gunathilaka@sarasavipages.lk", "IT25101540", "SUPER_ADMIN"},
                {"AnafS2345",        "2345", "Anaf M.K.A.S.",         "anaf@sarasavipages.lk",        "IT25102345", "PAYMENT_ADMIN"},
                {"ZeenC3342",        "3342", "Zeen A.C.",             "zeen@sarasavipages.lk",        "IT25103342", "CUSTOMER_SERVICE_ADMIN"},
                {"DissanayakeD1062", "1062", "Dissanayake S.A.S.D.", "dissanayake@sarasavipages.lk", "IT25101062", "INVENTORY_ADMIN"},
                {"GayathmiR3013",    "3013", "Gayathmi P.G.R.",       "gayathmi@sarasavipages.lk",    "IT25103013", "ACCOUNT_ADMIN"},
                {"DiyesL0263",       "0263", "Diyes C.L.",            "diyes@sarasavipages.lk",       "IT25100263", "ORDER_ADMIN"}
            };

            for (String[] s : staffData) {
                String encodedPw = passwordEncoder.encode(s[1]);
                jdbcTemplate.update(
                    "INSERT INTO staff (username, password, full_name, email, it_number, role, active, created_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, 1, ?)",
                    s[0], encodedPw, s[2], s[3], s[4], s[5], now
                );

                jdbcTemplate.update(
                    "INSERT INTO audit_log (performed_by, action, target_username, description, timestamp) " +
                    "VALUES ('SYSTEM', 'STAFF_CREATED', ?, ?, ?)",
                    s[0], "System: Seeded account for " + s[2], now
                );
            }
            log.info("Staff seeding completed successfully.");
        } catch (Exception e) {
            log.warn("Could not seed staff: {}", e.getMessage());
        }
    }

    private void seedBooksAndPromotions() {
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM books", Integer.class);
            if (count != null && count > 0) {
                return;
            }

            log.info("Seeding books and promotions...");
            jdbcTemplate.update(
                "INSERT INTO books (id, title, author, category, price, cover_image, stock_quantity, isbn, description, rating) " +
                "VALUES (1, 'Madol Doova', 'Martin Wickramasinghe', 'Fiction', 850.00, '/images/madol_doova.jpg', 45, '978-955-012-001-1', 'Classic Sri Lankan novel of boyhood adventures.', 4.8)"
            );
            jdbcTemplate.update(
                "INSERT INTO books (id, title, author, category, price, cover_image, stock_quantity, isbn, description, rating) " +
                "VALUES (2, 'Gamperaliya', 'Martin Wickramasinghe', 'Literature', 1200.00, '/images/gamperaliya.jpg', 30, '978-955-012-002-8', 'Masterpiece depicting the breakdown of traditional feudal life.', 4.9)"
            );
            jdbcTemplate.update(
                "INSERT INTO books (id, title, author, category, price, cover_image, stock_quantity, isbn, description, rating) " +
                "VALUES (3, 'Village in the Jungle', 'Leonard Woolf', 'Fiction', 950.00, '/images/village_in_jungle.jpg', 25, '978-955-012-003-5', 'A poignant depiction of life in a remote Sri Lankan jungle village.', 4.7)"
            );
            jdbcTemplate.update(
                "INSERT INTO books (id, title, author, category, price, cover_image, stock_quantity, isbn, description, rating) " +
                "VALUES (4, 'Clean Code', 'Robert C. Martin', 'Technology', 4500.00, '/images/clean_code.jpg', 15, '978-013-235-088-4', 'A Handbook of Agile Software Craftsmanship.', 4.8)"
            );
            jdbcTemplate.update(
                "INSERT INTO books (id, title, author, category, price, cover_image, stock_quantity, isbn, description, rating) " +
                "VALUES (5, 'Introduction to Algorithms', 'Thomas H. Cormen', 'Academic', 7800.00, '/images/intro_algorithms.jpg', 8, '978-026-203-384-8', 'Comprehensive textbook covering modern algorithms.', 4.9)"
            );

            LocalDateTime futureDate = LocalDateTime.now().plusMonths(6);
            jdbcTemplate.update("INSERT INTO promotions (id, code, discount_percentage, max_discount, min_spend, valid_until, active) VALUES (1, 'WELCOME10', 10, 500.00, 1000.00, ?, 1)", futureDate);
            jdbcTemplate.update("INSERT INTO promotions (id, code, discount_percentage, max_discount, min_spend, valid_until, active) VALUES (2, 'SARASAVI20', 20, 1500.00, 3000.00, ?, 1)", futureDate);
            jdbcTemplate.update("INSERT INTO promotions (id, code, discount_percentage, max_discount, min_spend, valid_until, active) VALUES (3, 'STUDENT15', 15, 750.00, 1500.00, ?, 1)", futureDate);
        } catch (Exception e) {
            log.warn("Could not seed books/promotions: {}", e.getMessage());
        }
    }

    private void seedInventory() {
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM inventory_items", Integer.class);
            if (count != null && count > 0) {
                return;
            }

            log.info("Seeding inventory items...");
            jdbcTemplate.update("INSERT INTO inventory_items (book_id, isbn, title, author, category, location, stock_quantity, safety_stock_level, reorder_quantity, unit_cost, selling_price, supplier, status) VALUES (1, '978-955-012-001-1', 'Madol Doova', 'Martin Wickramasinghe', 'Fiction', 'Aisle 1 - Shelf A', 45, 10, 20, 550.00, 850.00, 'Sarasavi Publishers', 'IN_STOCK')");
            jdbcTemplate.update("INSERT INTO inventory_items (book_id, isbn, title, author, category, location, stock_quantity, safety_stock_level, reorder_quantity, unit_cost, selling_price, supplier, status) VALUES (2, '978-955-012-002-8', 'Gamperaliya', 'Martin Wickramasinghe', 'Literature', 'Aisle 1 - Shelf B', 30, 10, 25, 800.00, 1200.00, 'Sarasavi Publishers', 'IN_STOCK')");
            jdbcTemplate.update("INSERT INTO inventory_items (book_id, isbn, title, author, category, location, stock_quantity, safety_stock_level, reorder_quantity, unit_cost, selling_price, supplier, status) VALUES (3, '978-955-012-003-5', 'Village in the Jungle', 'Leonard Woolf', 'Fiction', 'Aisle 2 - Shelf A', 25, 8, 15, 600.00, 950.00, 'Lake House Bookshop', 'IN_STOCK')");
            jdbcTemplate.update("INSERT INTO inventory_items (book_id, isbn, title, author, category, location, stock_quantity, safety_stock_level, reorder_quantity, unit_cost, selling_price, supplier, status) VALUES (4, '978-013-235-088-4', 'Clean Code', 'Robert C. Martin', 'Technology', 'Aisle 3 - Shelf C', 15, 5, 10, 3200.00, 4500.00, 'Pearson Education', 'IN_STOCK')");
            jdbcTemplate.update("INSERT INTO inventory_items (book_id, isbn, title, author, category, location, stock_quantity, safety_stock_level, reorder_quantity, unit_cost, selling_price, supplier, status) VALUES (5, '978-026-203-384-8', 'Introduction to Algorithms', 'Thomas H. Cormen', 'Academic', 'Aisle 3 - Shelf D', 8, 5, 10, 5500.00, 7800.00, 'MIT Press', 'LOW_STOCK')");
        } catch (Exception e) {
            log.warn("Could not seed inventory: {}", e.getMessage());
        }
    }

    private void seedCustomerProfiles() {
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM customer_profiles", Integer.class);
            if (count != null && count > 0) {
                return;
            }

            log.info("Seeding customer accounts...");
            jdbcTemplate.update("INSERT INTO customer_profiles (customer_id, email, first_name, last_name, phone, address_line1, city, postal_code, country, status, loyalty_tier, loyalty_points, kyc_verified) VALUES ('CUST-001', 'kamal.perera@gmail.com', 'Kamal', 'Perera', '+94771234567', '12 Temple Road', 'Colombo', '00300', 'Sri Lanka', 'ACTIVE', 'GOLD', 340, 1)");
            jdbcTemplate.update("INSERT INTO customer_profiles (customer_id, email, first_name, last_name, phone, address_line1, city, postal_code, country, status, loyalty_tier, loyalty_points, kyc_verified) VALUES ('CUST-002', 'nimal.silva@yahoo.com', 'Nimal', 'Silva', '+94712345678', '45 Galle Road', 'Kalutara', '12000', 'Sri Lanka', 'ACTIVE', 'SILVER', 180, 1)");
            jdbcTemplate.update("INSERT INTO customer_profiles (customer_id, email, first_name, last_name, phone, address_line1, city, postal_code, country, status, loyalty_tier, loyalty_points, kyc_verified) VALUES ('CUST-003', 'sunil.fernando@outlook.com', 'Sunil', 'Fernando', '+94763456789', '78 Kandy Road', 'Kadawatha', '11850', 'Sri Lanka', 'ACTIVE', 'PLATINUM', 750, 1)");
            jdbcTemplate.update("INSERT INTO customer_profiles (customer_id, email, first_name, last_name, phone, address_line1, city, postal_code, country, status, loyalty_tier, loyalty_points, kyc_verified) VALUES ('CUST-004', 'anoma.jayasinghe@gmail.com', 'Anoma', 'Jayasinghe', '+94784567890', '23 Peradeniya Road', 'Kandy', '20000', 'Sri Lanka', 'ACTIVE', 'BRONZE', 60, 0)");
        } catch (Exception e) {
            log.warn("Could not seed customer profiles: {}", e.getMessage());
        }
    }

    private void seedPayments() {
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM payments", Integer.class);
            if (count != null && count > 0) {
                return;
            }

            log.info("Seeding payments...");
            LocalDateTime now = LocalDateTime.now();
            jdbcTemplate.update("INSERT INTO payments (order_id, customer_id, amount, currency, payment_method, status, transaction_reference, gateway_message, invoice_number, created_at, updated_at) VALUES (1001, 1, 2050.00, 'LKR', 'CREDIT_CARD', 'COMPLETED', 'TXN-88239102-M2', 'Approved', 'INV-2026-0001', ?, ?)", now, now);
            jdbcTemplate.update("INSERT INTO payments (order_id, customer_id, amount, currency, payment_method, status, transaction_reference, gateway_message, invoice_number, created_at, updated_at) VALUES (1002, 2, 4500.00, 'LKR', 'ONLINE_BANKING', 'COMPLETED', 'TXN-99182301-M2', 'Approved', 'INV-2026-0002', ?, ?)", now, now);
            jdbcTemplate.update("INSERT INTO payments (order_id, customer_id, amount, currency, payment_method, status, transaction_reference, gateway_message, invoice_number, created_at, updated_at) VALUES (1003, 3, 850.00, 'LKR', 'CASH_ON_DELIVERY', 'PENDING', 'TXN-77382910-M2', 'Pending delivery confirmation', 'INV-2026-0003', ?, ?)", now, now);
        } catch (Exception e) {
            log.warn("Could not seed payments: {}", e.getMessage());
        }
    }

    private void seedTickets() {
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tickets", Integer.class);
            if (count != null && count > 0) {
                return;
            }

            log.info("Seeding customer service tickets...");
            LocalDateTime now = LocalDateTime.now();
            jdbcTemplate.update("INSERT INTO tickets (customer_id, customer_name, contact_number, subject, description, status, resolution_details, resolved_by, created_at, updated_at, resolved_at) VALUES (1, 'Kamal Perera', '+94771234567', 'Late Delivery of Order ORD-1001', 'Order placed 3 days ago not arrived yet.', 'OPEN', NULL, NULL, ?, ?, NULL)", now, now);
            jdbcTemplate.update("INSERT INTO tickets (customer_id, customer_name, contact_number, subject, description, status, resolution_details, resolved_by, created_at, updated_at, resolved_at) VALUES (2, 'Nimal Silva', '+94712345678', 'Damaged Book Cover', 'Cover was torn upon delivery.', 'IN_PROGRESS', NULL, NULL, ?, ?, NULL)", now, now);
            jdbcTemplate.update("INSERT INTO tickets (customer_id, customer_name, contact_number, subject, description, status, resolution_details, resolved_by, created_at, updated_at, resolved_at) VALUES (3, 'Sunil Fernando', '+94763456789', 'Refund Request for ORD-0988', 'Duplicate order refund requested.', 'RESOLVED', 'Refund processed via Payment Gateway.', 'ZeenC3342', ?, ?, ?)", now, now, now);
        } catch (Exception e) {
            log.warn("Could not seed tickets: {}", e.getMessage());
        }
    }
}

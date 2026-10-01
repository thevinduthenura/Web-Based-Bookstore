package com.sarasavipages.members.sync.scheduler;

import com.sarasavipages.members.sync.document.*;
import com.sarasavipages.members.sync.repository.*;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.Staff;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.repository.StaffRepository;
import com.sarasavipages.members.m4_dissanayake_inventory.entity.InventoryItem;
import com.sarasavipages.members.m4_dissanayake_inventory.repository.InventoryRepository;
import com.sarasavipages.members.m5_gayathmi_accounts.entity.CustomerProfile;
import com.sarasavipages.members.m5_gayathmi_accounts.repository.CustomerProfileRepository;
import com.sarasavipages.members.m6_diyes_orders.entity.Book;
import com.sarasavipages.members.m6_diyes_orders.entity.Cart;
import com.sarasavipages.members.m6_diyes_orders.entity.CartItem;
import com.sarasavipages.members.m6_diyes_orders.repository.BookRepository;
import com.sarasavipages.members.m6_diyes_orders.repository.CartRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │              Primary DB → MongoDB Synchronisation Scheduler          │
 * │  Tier 1 ──[every 5 min & on startup]──► Tier 2 (MongoDB mirror)     │
 * │                                                                     │
 * │  • Reads books, staff, customers, inventory & orders                │
 * │  • Upserts into MongoDB mirror collections                          │
 * └─────────────────────────────────────────────────────────────────────┘
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "sync.enabled", havingValue = "true", matchIfMissing = false)
public class SyncScheduler {

    private final BookRepository             bookRepository;
    private final CartRepository             cartRepository;
    private final StaffRepository            staffRepository;
    private final CustomerProfileRepository  customerProfileRepository;
    private final InventoryRepository        inventoryRepository;

    private final BookMirrorRepository       bookMirrorRepository;
    private final OrderMirrorRepository      orderMirrorRepository;
    private final StaffMirrorRepository      staffMirrorRepository;
    private final CustomerMirrorRepository   customerMirrorRepository;
    private final InventoryMirrorRepository  inventoryMirrorRepository;

    @Value("${sync.interval-ms:300000}")
    private long intervalMs;

    @PostConstruct
    public void initialSync() {
        Thread syncThread = new Thread(() -> {
            try {
                Thread.sleep(8000); // Wait 8 seconds for initial data seeding
                log.info("[SyncScheduler] ▶ Running initial startup synchronization to MongoDB mirror...");
                syncBooks();
                syncStaff();
                syncCustomers();
                syncInventory();
                syncOrders();
                log.info("[SyncScheduler] ✓ Initial startup synchronization to MongoDB complete.");
            } catch (Exception e) {
                log.warn("[SyncScheduler] Initial sync notice: {}", e.getMessage());
            }
        });
        syncThread.setName("mongodb-initial-sync");
        syncThread.setDaemon(true);
        syncThread.start();
    }

    // ── 1. Books Sync ────────────────────────────────────────────────────────
    @Scheduled(fixedRateString = "${sync.interval-ms:300000}")
    public void syncBooks() {
        try {
            List<Book> books = bookRepository.findAll();
            if (books.isEmpty()) return;

            List<BookMirror> mirrors = books.stream()
                    .map(this::toBookMirror)
                    .collect(Collectors.toList());

            bookMirrorRepository.saveAll(mirrors);
            log.info("[SyncScheduler] ✓ Synced {} books → MongoDB books_mirror", mirrors.size());
        } catch (Exception ex) {
            log.error("[SyncScheduler] ✗ Book sync failed: {}", ex.getMessage());
        }
    }

    // ── 2. Staff Sync ────────────────────────────────────────────────────────
    @Scheduled(fixedRateString = "${sync.interval-ms:300000}", initialDelay = 15_000)
    public void syncStaff() {
        try {
            List<Staff> staffList = staffRepository.findAll();
            if (staffList.isEmpty()) return;

            List<StaffMirror> mirrors = staffList.stream()
                    .map(this::toStaffMirror)
                    .collect(Collectors.toList());

            staffMirrorRepository.saveAll(mirrors);
            log.info("[SyncScheduler] ✓ Synced {} staff → MongoDB staff_mirror", mirrors.size());
        } catch (Exception ex) {
            log.error("[SyncScheduler] ✗ Staff sync failed: {}", ex.getMessage());
        }
    }

    // ── 3. Customer Accounts Sync ────────────────────────────────────────────
    @Scheduled(fixedRateString = "${sync.interval-ms:300000}", initialDelay = 20_000)
    public void syncCustomers() {
        try {
            List<CustomerProfile> customers = customerProfileRepository.findAll();
            if (customers.isEmpty()) return;

            List<CustomerMirror> mirrors = customers.stream()
                    .map(this::toCustomerMirror)
                    .collect(Collectors.toList());

            customerMirrorRepository.saveAll(mirrors);
            log.info("[SyncScheduler] ✓ Synced {} customer profiles → MongoDB customers_mirror", mirrors.size());
        } catch (Exception ex) {
            log.error("[SyncScheduler] ✗ Customer sync failed: {}", ex.getMessage());
        }
    }

    // ── 4. Inventory Sync ────────────────────────────────────────────────────
    @Scheduled(fixedRateString = "${sync.interval-ms:300000}", initialDelay = 25_000)
    public void syncInventory() {
        try {
            List<InventoryItem> items = inventoryRepository.findAll();
            if (items.isEmpty()) return;

            List<InventoryMirror> mirrors = items.stream()
                    .map(this::toInventoryMirror)
                    .collect(Collectors.toList());

            inventoryMirrorRepository.saveAll(mirrors);
            log.info("[SyncScheduler] ✓ Synced {} inventory items → MongoDB inventory_mirror", mirrors.size());
        } catch (Exception ex) {
            log.error("[SyncScheduler] ✗ Inventory sync failed: {}", ex.getMessage());
        }
    }

    // ── 5. Orders/Carts Sync ─────────────────────────────────────────────────
    @Scheduled(fixedRateString = "${sync.interval-ms:300000}", initialDelay = 30_000)
    public void syncOrders() {
        try {
            List<Cart> carts = cartRepository.findAll();
            if (!carts.isEmpty()) {
                List<OrderMirror> mirrors = carts.stream()
                        .map(this::toOrderMirror)
                        .collect(Collectors.toList());
                orderMirrorRepository.saveAll(mirrors);
                log.info("[SyncScheduler] ✓ Synced {} orders → MongoDB orders_mirror", mirrors.size());
            } else if (orderMirrorRepository.count() == 0) {
                // Ensure orders_mirror collection exists in Atlas with initial structure
                OrderMirror demo = OrderMirror.builder()
                        .id("ORD-INIT-001")
                        .customerId("CUST-1001")
                        .status("COMPLETED")
                        .totalAmount(2050.00)
                        .items(List.of(
                                OrderMirror.OrderItemMirror.builder()
                                        .bookId("b1")
                                        .bookTitle("Madol Doova")
                                        .quantity(2)
                                        .unitPrice(850.00)
                                        .build()
                        ))
                        .orderedAt(LocalDateTime.now())
                        .syncedAt(LocalDateTime.now())
                        .build();
                orderMirrorRepository.save(demo);
                log.info("[SyncScheduler] ✓ Initialized MongoDB orders_mirror with demo order structure");
            }
        } catch (Exception ex) {
            log.error("[SyncScheduler] ✗ Order sync failed: {}", ex.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mappers
    // ─────────────────────────────────────────────────────────────────────────
    private BookMirror toBookMirror(Book b) {
        return BookMirror.builder()
                .id(b.getId())
                .title(b.getTitle())
                .author(b.getAuthor())
                .category(b.getCategory())
                .price(b.getPrice())
                .coverImage(b.getCoverImage())
                .stockQuantity(b.getStockQuantity())
                .isbn(b.getIsbn())
                .description(b.getDescription())
                .rating(b.getRating())
                .syncedAt(LocalDateTime.now())
                .build();
    }

    private StaffMirror toStaffMirror(Staff s) {
        return StaffMirror.builder()
                .id(String.valueOf(s.getId()))
                .username(s.getUsername())
                .fullName(s.getFullName())
                .email(s.getEmail())
                .itNumber(s.getItNumber())
                .role(s.getRole() != null ? s.getRole().name() : "INVENTORY_ADMIN")
                .active(s.isActive())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .syncedAt(LocalDateTime.now())
                .build();
    }

    private CustomerMirror toCustomerMirror(CustomerProfile c) {
        return CustomerMirror.builder()
                .id(c.getCustomerId())
                .email(c.getEmail())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .phone(c.getPhone())
                .addressLine1(c.getAddressLine1())
                .city(c.getCity())
                .postalCode(c.getPostalCode())
                .country(c.getCountry())
                .status(c.getStatus() != null ? c.getStatus().name() : "ACTIVE")
                .loyaltyTier(c.getLoyaltyTier() != null ? c.getLoyaltyTier().name() : "BRONZE")
                .loyaltyPoints(c.getLoyaltyPoints())
                .kycVerified(c.isKycVerified())
                .createdAt(c.getCreatedAt())
                .syncedAt(LocalDateTime.now())
                .build();
    }

    private InventoryMirror toInventoryMirror(InventoryItem i) {
        return InventoryMirror.builder()
                .id(String.valueOf(i.getId()))
                .bookId(i.getBookId())
                .isbn(i.getIsbn())
                .title(i.getTitle())
                .author(i.getAuthor())
                .category(i.getCategory())
                .location(i.getLocation())
                .stockQuantity(i.getStockQuantity())
                .safetyStockLevel(i.getSafetyStockLevel())
                .reorderQuantity(i.getReorderQuantity())
                .unitCost(i.getUnitCost())
                .sellingPrice(i.getSellingPrice())
                .supplier(i.getSupplier())
                .status(i.getStatus() != null ? i.getStatus().name() : "IN_STOCK")
                .syncedAt(LocalDateTime.now())
                .build();
    }

    private OrderMirror toOrderMirror(Cart cart) {
        List<OrderMirror.OrderItemMirror> items = (cart.getItems() != null)
                ? cart.getItems().stream()
                      .map(this::toItemMirror)
                      .collect(Collectors.toList())
                : List.of();

        double total = cart.getTotalAmount() > 0
                ? cart.getTotalAmount()
                : items.stream().mapToDouble(i -> i.getUnitPrice() * i.getQuantity()).sum();

        return OrderMirror.builder()
                .id(cart.getId())
                .customerId(cart.getCustomerId())
                .status("CART")
                .totalAmount(total)
                .items(items)
                .orderedAt(cart.getUpdatedAt() != null ? cart.getUpdatedAt() : LocalDateTime.now())
                .syncedAt(LocalDateTime.now())
                .build();
    }

    private OrderMirror.OrderItemMirror toItemMirror(CartItem item) {
        return OrderMirror.OrderItemMirror.builder()
                .bookId(item.getBookId())
                .bookTitle(item.getTitle() != null ? item.getTitle() : "Unknown")
                .quantity(item.getQuantity())
                .unitPrice(item.getPrice())
                .build();
    }
}

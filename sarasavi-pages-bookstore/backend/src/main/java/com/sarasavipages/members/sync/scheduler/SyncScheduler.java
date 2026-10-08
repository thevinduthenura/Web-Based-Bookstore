package com.sarasavipages.members.sync.scheduler;

import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.Staff;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.StaffRole;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.repository.StaffRepository;
import com.sarasavipages.members.m2_anaf_payment.entity.Payment;
import com.sarasavipages.members.m2_anaf_payment.entity.PaymentMethod;
import com.sarasavipages.members.m2_anaf_payment.entity.PaymentStatus;
import com.sarasavipages.members.m2_anaf_payment.repository.PaymentRepository;
import com.sarasavipages.members.m4_dissanayake_inventory.entity.InventoryItem;
import com.sarasavipages.members.m4_dissanayake_inventory.entity.StockStatus;
import com.sarasavipages.members.m4_dissanayake_inventory.repository.InventoryRepository;
import com.sarasavipages.members.m5_gayathmi_accounts.entity.AccountStatus;
import com.sarasavipages.members.m5_gayathmi_accounts.entity.CustomerProfile;
import com.sarasavipages.members.m5_gayathmi_accounts.entity.LoyaltyTier;
import com.sarasavipages.members.m5_gayathmi_accounts.repository.CustomerProfileRepository;
import com.sarasavipages.members.m6_diyes_orders.entity.Book;
import com.sarasavipages.members.m6_diyes_orders.entity.Cart;
import com.sarasavipages.members.m6_diyes_orders.entity.CartItem;
import com.sarasavipages.members.m6_diyes_orders.entity.Order;
import com.sarasavipages.members.m6_diyes_orders.repository.BookRepository;
import com.sarasavipages.members.m6_diyes_orders.repository.CartRepository;
import com.sarasavipages.members.m6_diyes_orders.repository.OrderRepository;
import com.sarasavipages.members.sync.document.*;
import com.sarasavipages.members.sync.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │         Dual-Tier Bi-Directional Synchronisation Scheduler          │
 * │  Tier 1 (MSSQL / Primary DB) ◄═════════► Tier 2 (MongoDB Mirror)   │
 * │                                                                     │
 * │  • Pulls data added/modified on Vercel/Cloud into MSSQL             │
 * │  • Pushes local MSSQL updates to MongoDB Atlas mirror               │
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
    private final PaymentRepository          paymentRepository;
    private final OrderRepository            orderRepository;

    private final BookMirrorRepository       bookMirrorRepository;
    private final OrderMirrorRepository      orderMirrorRepository;
    private final StaffMirrorRepository      staffMirrorRepository;
    private final CustomerMirrorRepository   customerMirrorRepository;
    private final InventoryMirrorRepository  inventoryMirrorRepository;
    private final PaymentMirrorRepository    paymentMirrorRepository;

    @Lazy
    private final PasswordEncoder            passwordEncoder;

    @Value("${sync.interval-ms:300000}")
    private long intervalMs;

    @PostConstruct
    public void initialSync() {
        Thread syncThread = new Thread(() -> {
            try {
                // Wait 4 seconds for DB tables & baseline migrations
                Thread.sleep(4000);
                log.info("[SyncScheduler] ▶ Running initial inbound sync (MongoDB Atlas → MSSQL)...");
                pullAllFromMongo();
                log.info("[SyncScheduler] ✓ Inbound sync complete. MSSQL updated with cloud records.");

                log.info("[SyncScheduler] ▶ Running initial outbound sync (MSSQL → MongoDB Atlas)...");
                pushAllToMongo();
                log.info("[SyncScheduler] ✓ Outbound sync complete. MongoDB mirror updated.");
            } catch (Exception e) {
                log.warn("[SyncScheduler] Initial sync notice: {}", e.getMessage());
            }
        });
        syncThread.setName("mongodb-bidirectional-sync");
        syncThread.setDaemon(true);
        syncThread.start();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // [PULL] MongoDB Atlas → Primary Database (MSSQL)
    // ─────────────────────────────────────────────────────────────────────────

    @Scheduled(fixedRateString = "${sync.inbound-interval-ms:120000}", initialDelay = 15_000)
    public void scheduledInboundSync() {
        log.debug("[SyncScheduler] ↻ Running periodic inbound sync (MongoDB → MSSQL)...");
        pullAllFromMongo();
    }

    public Map<String, Object> pullAllFromMongo() {
        Map<String, Object> summary = new LinkedHashMap<>();
        try {
            int books = pullBooksFromMongo();
            int staff = pullStaffFromMongo();
            int customers = pullCustomersFromMongo();
            int inventory = pullInventoryFromMongo();
            int payments = pullPaymentsFromMongo();
            int orders = pullOrdersFromMongo();

            summary.put("status", "SUCCESS");
            summary.put("booksUpdated", books);
            summary.put("staffUpdated", staff);
            summary.put("customersUpdated", customers);
            summary.put("inventoryUpdated", inventory);
            summary.put("paymentsUpdated", payments);
            summary.put("ordersUpdated", orders);
            log.info("[SyncScheduler] ✓ Pulled from MongoDB to MSSQL: books={}, staff={}, customers={}, inventory={}, payments={}, orders={}",
                    books, staff, customers, inventory, payments, orders);
        } catch (Exception e) {
            log.error("[SyncScheduler] ✗ Pull from MongoDB failed: {}", e.getMessage());
            summary.put("status", "FAILED");
            summary.put("error", e.getMessage());
        }
        return summary;
    }

    public int pullBooksFromMongo() {
        try {
            List<BookMirror> mirrors = bookMirrorRepository.findAll();
            int count = 0;
            for (BookMirror bm : mirrors) {
                if (bm.getTitle() == null) continue;
                String id = (bm.getId() != null && !bm.getId().isBlank()) ? bm.getId() : UUID.randomUUID().toString();
                
                Optional<Book> existing = bookRepository.findById(id);
                if (existing.isEmpty() && bm.getIsbn() != null) {
                    existing = bookRepository.findByIsbn(bm.getIsbn());
                }
                if (existing.isEmpty()) {
                    existing = bookRepository.findByTitleIgnoreCase(bm.getTitle());
                }

                Book b = existing.orElseGet(() -> {
                    Book newB = new Book();
                    newB.setId(id);
                    return newB;
                });

                b.setTitle(bm.getTitle());
                b.setAuthor(bm.getAuthor() != null ? bm.getAuthor() : "Unknown");
                b.setCategory(bm.getCategory() != null ? bm.getCategory() : "General");
                b.setPrice(bm.getPrice() > 0 ? bm.getPrice() : 1000.0);
                b.setCoverImage(bm.getCoverImage());
                b.setStockQuantity(bm.getStockQuantity());
                b.setIsbn(bm.getIsbn());
                b.setDescription(bm.getDescription());
                b.setRating(bm.getRating());
                bookRepository.save(b);
                count++;
            }
            return count;
        } catch (Exception e) {
            log.error("[SyncScheduler] Book pull failed: {}", e.getMessage());
            return 0;
        }
    }

    public int pullStaffFromMongo() {
        try {
            List<StaffMirror> mirrors = staffMirrorRepository.findAll();
            int count = 0;
            for (StaffMirror sm : mirrors) {
                if (sm.getUsername() == null) continue;
                Optional<Staff> existing = staffRepository.findByUsername(sm.getUsername());
                if (existing.isEmpty() && sm.getEmail() != null) {
                    existing = staffRepository.findByEmail(sm.getEmail());
                }

                Staff s;
                if (existing.isPresent()) {
                    s = existing.get();
                } else {
                    s = Staff.builder()
                            .username(sm.getUsername())
                            .password(passwordEncoder.encode("sarasavi123"))
                            .build();
                }

                s.setFullName(sm.getFullName() != null ? sm.getFullName() : sm.getUsername());
                s.setEmail(sm.getEmail() != null ? sm.getEmail() : sm.getUsername() + "@sarasavipages.lk");
                s.setEmployeeId(sm.getEmployeeId() != null ? sm.getEmployeeId() : "EMP-" + (1010 + count));
                
                try {
                    if (sm.getRole() != null) {
                        s.setRole(StaffRole.valueOf(sm.getRole()));
                    } else if (s.getRole() == null) {
                        s.setRole(StaffRole.INVENTORY_ADMIN);
                    }
                } catch (Exception ignored) {
                    if (s.getRole() == null) s.setRole(StaffRole.INVENTORY_ADMIN);
                }

                s.setActive(sm.isActive());
                staffRepository.save(s);
                count++;
            }
            return count;
        } catch (Exception e) {
            log.error("[SyncScheduler] Staff pull failed: {}", e.getMessage());
            return 0;
        }
    }

    public int pullCustomersFromMongo() {
        try {
            List<CustomerMirror> mirrors = customerMirrorRepository.findAll();
            int count = 0;
            for (CustomerMirror cm : mirrors) {
                if (cm.getEmail() == null && cm.getId() == null) continue;

                Optional<CustomerProfile> existing = Optional.empty();
                if (cm.getEmail() != null) {
                    existing = customerProfileRepository.findByEmailIgnoreCase(cm.getEmail());
                }
                if (existing.isEmpty() && cm.getId() != null) {
                    existing = customerProfileRepository.findByCustomerId(cm.getId());
                }

                CustomerProfile cp;
                if (existing.isPresent()) {
                    cp = existing.get();
                } else {
                    cp = CustomerProfile.builder()
                            .customerId(cm.getId() != null ? cm.getId() : "CUST-" + UUID.randomUUID().toString().substring(0, 8))
                            .email(cm.getEmail() != null ? cm.getEmail() : "customer_" + UUID.randomUUID().toString().substring(0, 6) + "@sarasavi.lk")
                            .build();
                }

                if (cm.getFirstName() != null) cp.setFirstName(cm.getFirstName());
                else if (cp.getFirstName() == null) cp.setFirstName("Valued");

                if (cm.getLastName() != null) cp.setLastName(cm.getLastName());
                else if (cp.getLastName() == null) cp.setLastName("Customer");

                if (cm.getPhone() != null) cp.setPhone(cm.getPhone());
                if (cm.getAddressLine1() != null) cp.setAddressLine1(cm.getAddressLine1());
                if (cm.getCity() != null) cp.setCity(cm.getCity());
                if (cm.getPostalCode() != null) cp.setPostalCode(cm.getPostalCode());
                if (cm.getCountry() != null) cp.setCountry(cm.getCountry());

                if (cm.getStatus() != null) {
                    try { cp.setStatus(AccountStatus.valueOf(cm.getStatus())); } catch (Exception ignored) {}
                }
                if (cm.getLoyaltyTier() != null) {
                    try { cp.setLoyaltyTier(LoyaltyTier.valueOf(cm.getLoyaltyTier())); } catch (Exception ignored) {}
                }
                cp.setLoyaltyPoints(cm.getLoyaltyPoints());
                cp.setKycVerified(cm.isKycVerified());

                customerProfileRepository.save(cp);
                count++;
            }
            return count;
        } catch (Exception e) {
            log.error("[SyncScheduler] Customer pull failed: {}", e.getMessage());
            return 0;
        }
    }

    public int pullInventoryFromMongo() {
        try {
            List<InventoryMirror> mirrors = inventoryMirrorRepository.findAll();
            int count = 0;
            for (InventoryMirror im : mirrors) {
                if (im.getBookId() == null) continue;
                Optional<InventoryItem> existing = inventoryRepository.findByBookId(im.getBookId());
                if (existing.isEmpty() && im.getIsbn() != null) {
                    existing = inventoryRepository.findByIsbn(im.getIsbn());
                }

                InventoryItem item = existing.orElseGet(() -> InventoryItem.builder()
                        .bookId(im.getBookId())
                        .build());

                item.setIsbn(im.getIsbn() != null ? im.getIsbn() : "N/A");
                item.setTitle(im.getTitle() != null ? im.getTitle() : "Untitled");
                item.setAuthor(im.getAuthor() != null ? im.getAuthor() : "Unknown");
                item.setCategory(im.getCategory() != null ? im.getCategory() : "General");
                item.setLocation(im.getLocation() != null ? im.getLocation() : "Warehouse Colombo");
                item.setStockQuantity(im.getStockQuantity());
                item.setSafetyStockLevel(im.getSafetyStockLevel() > 0 ? im.getSafetyStockLevel() : 5);
                item.setReorderQuantity(im.getReorderQuantity() > 0 ? im.getReorderQuantity() : 20);
                item.setUnitCost(im.getUnitCost());
                item.setSellingPrice(im.getSellingPrice());
                item.setSupplier(im.getSupplier() != null ? im.getSupplier() : "Sarasavi Publishers");

                if (im.getStatus() != null) {
                    try { item.setStatus(StockStatus.valueOf(im.getStatus())); } catch (Exception ignored) {}
                }
                inventoryRepository.save(item);
                count++;
            }
            return count;
        } catch (Exception e) {
            log.error("[SyncScheduler] Inventory pull failed: {}", e.getMessage());
            return 0;
        }
    }

    public int pullPaymentsFromMongo() {
        try {
            List<PaymentMirror> mirrors = paymentMirrorRepository.findAll();
            int count = 0;
            for (PaymentMirror pm : mirrors) {
                if (pm.getTransactionReference() == null) continue;
                Optional<Payment> existing = paymentRepository.findByTransactionReference(pm.getTransactionReference());

                Payment p = existing.orElseGet(() -> {
                    Payment newP = new Payment();
                    newP.setTransactionReference(pm.getTransactionReference());
                    return newP;
                });

                p.setOrderId(pm.getOrderId() != null ? pm.getOrderId() : 1000L);
                p.setCustomerId(pm.getCustomerId() != null ? pm.getCustomerId() : 1L);
                p.setAmount(pm.getAmount() != null ? pm.getAmount() : BigDecimal.valueOf(1500.0));
                p.setCurrency(pm.getCurrency() != null ? pm.getCurrency() : "LKR");

                try {
                    if (pm.getPaymentMethod() != null) {
                        p.setPaymentMethod(PaymentMethod.valueOf(pm.getPaymentMethod()));
                    }
                } catch (Exception ignored) {}

                try {
                    if (pm.getStatus() != null) {
                        p.setStatus(PaymentStatus.valueOf(pm.getStatus()));
                    }
                } catch (Exception ignored) {}

                p.setGatewayMessage(pm.getGatewayMessage());
                p.setInvoiceNumber(pm.getInvoiceNumber());
                paymentRepository.save(p);
                count++;
            }
            return count;
        } catch (Exception e) {
            log.error("[SyncScheduler] Payment pull failed: {}", e.getMessage());
            return 0;
        }
    }

    public int pullOrdersFromMongo() {
        try {
            List<OrderMirror> mirrors = orderMirrorRepository.findAll();
            int count = 0;
            for (OrderMirror om : mirrors) {
                if (om.getId() == null) continue;

                // Sync into MSSQL orders table
                Optional<Order> existingOrder = orderRepository.findById(om.getId());
                Order o = existingOrder.orElseGet(() -> {
                    Order newO = new Order();
                    newO.setId(om.getId());
                    return newO;
                });
                o.setCustomerName(om.getCustomerName() != null ? om.getCustomerName() : "Customer");
                o.setItemsSummary(om.getItemsSummary() != null ? om.getItemsSummary() : "Assorted Books");
                o.setTotalAmount(BigDecimal.valueOf(om.getTotalAmount() > 0 ? om.getTotalAmount() : 1500.0));
                o.setStatus(om.getStatus() != null ? om.getStatus() : "PENDING");
                o.setCourier(om.getCourier() != null ? om.getCourier() : "Domex Express");
                o.setTrackingNo(om.getTrackingNo() != null ? om.getTrackingNo() : "Pending");
                o.setDestination(om.getDestination() != null ? om.getDestination() : "Colombo");
                o.setCreatedAt(om.getOrderedAt() != null ? om.getOrderedAt() : LocalDateTime.now());
                orderRepository.save(o);
                count++;
            }
            return count;
        } catch (Exception e) {
            log.error("[SyncScheduler] Order pull failed: {}", e.getMessage());
            return 0;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // [PUSH] Primary Database (MSSQL) → MongoDB Atlas
    // ─────────────────────────────────────────────────────────────────────────

    public Map<String, Object> pushAllToMongo() {
        syncBooks();
        syncStaff();
        syncCustomers();
        syncInventory();
        syncPayments();
        syncOrders();
        return Map.of("status", "SUCCESS");
    }

    @Scheduled(fixedRateString = "${sync.interval-ms:300000}", initialDelay = 60_000)
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

    @Scheduled(fixedRateString = "${sync.interval-ms:300000}", initialDelay = 75_000)
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

    @Scheduled(fixedRateString = "${sync.interval-ms:300000}", initialDelay = 90_000)
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

    @Scheduled(fixedRateString = "${sync.interval-ms:300000}", initialDelay = 105_000)
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

    @Scheduled(fixedRateString = "${sync.interval-ms:300000}", initialDelay = 120_000)
    public void syncPayments() {
        try {
            List<Payment> payments = paymentRepository.findAll();
            if (payments.isEmpty()) return;

            List<PaymentMirror> mirrors = payments.stream()
                    .map(this::toPaymentMirror)
                    .collect(Collectors.toList());

            paymentMirrorRepository.saveAll(mirrors);
            log.info("[SyncScheduler] ✓ Synced {} payments → MongoDB payments_mirror", mirrors.size());
        } catch (Exception ex) {
            log.error("[SyncScheduler] ✗ Payment sync failed: {}", ex.getMessage());
        }
    }

    @Scheduled(fixedRateString = "${sync.interval-ms:300000}", initialDelay = 135_000)
    public void syncOrders() {
        try {
            List<Order> orders = orderRepository.findAll();
            if (!orders.isEmpty()) {
                List<OrderMirror> mirrors = orders.stream()
                        .map(this::toOrderMirror)
                        .collect(Collectors.toList());
                orderMirrorRepository.saveAll(mirrors);
                log.info("[SyncScheduler] ✓ Synced {} orders → MongoDB orders_mirror", mirrors.size());
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
                .employeeId(s.getEmployeeId())
                .itNumber(s.getEmployeeId())
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

    private PaymentMirror toPaymentMirror(Payment p) {
        return PaymentMirror.builder()
                .id(String.valueOf(p.getId()))
                .orderId(p.getOrderId())
                .customerId(p.getCustomerId())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .paymentMethod(p.getPaymentMethod() != null ? p.getPaymentMethod().name() : "CARD")
                .status(p.getStatus() != null ? p.getStatus().name() : "PAID")
                .transactionReference(p.getTransactionReference())
                .gatewayMessage(p.getGatewayMessage())
                .invoiceNumber(p.getInvoiceNumber())
                .createdAt(p.getCreatedAt())
                .syncedAt(LocalDateTime.now())
                .build();
    }

    private OrderMirror toOrderMirror(Order o) {
        return OrderMirror.builder()
                .id(o.getId())
                .customerId(o.getCustomerName())
                .customerName(o.getCustomerName())
                .status(o.getStatus())
                .totalAmount(o.getTotalAmount() != null ? o.getTotalAmount().doubleValue() : 0.0)
                .paymentMethod("COD / Online")
                .itemsSummary(o.getItemsSummary())
                .courier(o.getCourier())
                .trackingNo(o.getTrackingNo())
                .destination(o.getDestination())
                .orderedAt(o.getCreatedAt())
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

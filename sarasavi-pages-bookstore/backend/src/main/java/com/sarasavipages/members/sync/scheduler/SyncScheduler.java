package com.sarasavipages.members.sync.scheduler;

import com.sarasavipages.members.sync.document.BookMirror;
import com.sarasavipages.members.sync.document.OrderMirror;
import com.sarasavipages.members.sync.repository.BookMirrorRepository;
import com.sarasavipages.members.sync.repository.OrderMirrorRepository;
import com.sarasavipages.members.m6_diyes_orders.entity.Book;
import com.sarasavipages.members.m6_diyes_orders.entity.Cart;
import com.sarasavipages.members.m6_diyes_orders.entity.CartItem;
import com.sarasavipages.members.m6_diyes_orders.repository.BookRepository;
import com.sarasavipages.members.m6_diyes_orders.repository.CartRepository;
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
 * │              MSSQL → MongoDB Synchronisation Scheduler              │
 * │  Tier 1 (MSSQL) ──[every 5 min]──► Tier 2 (MongoDB mirror)         │
 * │                                                                     │
 * │  • Reads all books + carts from JPA repositories                   │
 * │  • Upserts into MongoDB books_mirror / orders_mirror               │
 * │  • One-way only — MongoDB is NEVER the source of truth             │
 * │  • Disabled automatically in H2 / test profiles via condition       │
 * └─────────────────────────────────────────────────────────────────────┘
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "sync.enabled", havingValue = "true", matchIfMissing = false)
public class SyncScheduler {

    private final BookRepository        bookRepository;
    private final CartRepository        cartRepository;
    private final BookMirrorRepository  bookMirrorRepository;
    private final OrderMirrorRepository orderMirrorRepository;

    @Value("${sync.interval-ms:300000}")
    private long intervalMs;

    // ─────────────────────────────────────────────────────────────────────────
    // Books Sync  (every 5 minutes — driven by fixedRateString so it reads
    //              the property at runtime; fallback = 300 000 ms)
    // ─────────────────────────────────────────────────────────────────────────
    @Scheduled(fixedRateString = "${sync.interval-ms:300000}")
    public void syncBooks() {
        try {
            List<Book> books = bookRepository.findAll();
            if (books.isEmpty()) {
                log.debug("[SyncScheduler] No books found in MSSQL — skipping book sync.");
                return;
            }

            List<BookMirror> mirrors = books.stream()
                    .map(this::toBookMirror)
                    .collect(Collectors.toList());

            bookMirrorRepository.saveAll(mirrors);
            log.info("[SyncScheduler] ✓ Synced {} books → MongoDB books_mirror", mirrors.size());

        } catch (Exception ex) {
            log.error("[SyncScheduler] ✗ Book sync failed: {}", ex.getMessage(), ex);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Orders/Carts Sync  (same interval, staggered by 30 s initial delay)
    // ─────────────────────────────────────────────────────────────────────────
    @Scheduled(fixedRateString = "${sync.interval-ms:300000}", initialDelay = 30_000)
    public void syncOrders() {
        try {
            List<Cart> carts = cartRepository.findAll();
            if (carts.isEmpty()) {
                log.debug("[SyncScheduler] No orders found in MSSQL — skipping order sync.");
                return;
            }

            List<OrderMirror> mirrors = carts.stream()
                    .map(this::toOrderMirror)
                    .collect(Collectors.toList());

            orderMirrorRepository.saveAll(mirrors);
            log.info("[SyncScheduler] ✓ Synced {} orders → MongoDB orders_mirror", mirrors.size());

        } catch (Exception ex) {
            log.error("[SyncScheduler] ✗ Order sync failed: {}", ex.getMessage(), ex);
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
                .status("CART")       // Cart = pending order
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

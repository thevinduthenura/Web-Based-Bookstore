package com.sarasavipages.members.sync.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * MongoDB mirror document for the MSSQL orders/cart structure.
 * Tier 2: Read-fallback / analytics replica.
 * Written ONLY by SyncScheduler — never by API controllers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders_mirror")
public class OrderMirror {

    @Id
    private String id;

    @Indexed
    private String customerId;

    private String customerName;
    private String status;
    private double totalAmount;
    private String paymentMethod;

    /** Embedded line items — avoids a separate collection join */
    private List<OrderItemMirror> items;

    private LocalDateTime orderedAt;
    private LocalDateTime syncedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemMirror {
        private String bookId;
        private String bookTitle;
        private int quantity;
        private double unitPrice;
    }
}

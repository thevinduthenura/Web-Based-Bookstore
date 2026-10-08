package com.sarasavipages.members.m6_diyes_orders.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Module 6: Orders & Logistics Management
 * Relational entity for customer book orders, packing status, and courier dispatches.
 * Managed by Order Administrator (Diyes C.L. - IT25100263).
 */
@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "items_summary", nullable = false, length = 500)
    private String itemsSummary;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "courier", length = 100)
    private String courier;

    @Column(name = "tracking_no", length = 100)
    private String trackingNo;

    @Column(name = "destination", length = 255)
    private String destination;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null || this.status.isBlank()) {
            this.status = "PENDING";
        }
    }
}

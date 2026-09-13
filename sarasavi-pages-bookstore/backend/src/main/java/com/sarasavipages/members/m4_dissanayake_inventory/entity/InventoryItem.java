package com.sarasavipages.members.m4_dissanayake_inventory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bookId;

    @Column(nullable = false)
    private String isbn;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private String category;

    private String location; // e.g. Warehouse Colombo-3, Shelf B4

    @Column(nullable = false)
    private int stockQuantity;

    @Column(nullable = false)
    private int safetyStockLevel; // Threshold for low stock alert

    @Column(nullable = false)
    private int reorderQuantity;

    @Column(nullable = false)
    private double unitCost;

    @Column(nullable = false)
    private double sellingPrice;

    private String supplier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StockStatus status;

    private LocalDateTime lastRestockedAt;
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void updateStatus() {
        this.updatedAt = LocalDateTime.now();
        if (stockQuantity <= 0) {
            this.status = StockStatus.OUT_OF_STOCK;
        } else if (stockQuantity <= safetyStockLevel) {
            this.status = StockStatus.LOW_STOCK;
        } else {
            this.status = StockStatus.IN_STOCK;
        }
    }
}

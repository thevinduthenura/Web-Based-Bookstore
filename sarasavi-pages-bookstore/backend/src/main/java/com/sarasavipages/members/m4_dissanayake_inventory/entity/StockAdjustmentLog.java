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
@Table(name = "stock_adjustment_logs")
public class StockAdjustmentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long inventoryItemId;

    @Column(nullable = false)
    private String bookTitle;

    @Column(nullable = false)
    private String adjustmentType; // RESTOCK, DAMAGE, RETURN, MANUAL_AUDIT, SALE_DEDUCTION

    @Column(nullable = false)
    private int quantityChanged;

    @Column(nullable = false)
    private int previousQuantity;

    @Column(nullable = false)
    private int newQuantity;

    private String reason;

    @Column(nullable = false)
    private String adjustedBy;

    private LocalDateTime timestamp;

    @PrePersist
    public void setTimestamp() {
        this.timestamp = LocalDateTime.now();
    }
}

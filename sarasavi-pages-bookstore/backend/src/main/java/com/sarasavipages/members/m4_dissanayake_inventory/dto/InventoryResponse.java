package com.sarasavipages.members.m4_dissanayake_inventory.dto;

import com.sarasavipages.members.m4_dissanayake_inventory.entity.InventoryItem;
import com.sarasavipages.members.m4_dissanayake_inventory.entity.StockStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {
    private Long id;
    private String bookId;
    private String isbn;
    private String title;
    private String author;
    private String category;
    private String location;
    private int stockQuantity;
    private int safetyStockLevel;
    private int reorderQuantity;
    private double unitCost;
    private double sellingPrice;
    private String supplier;
    private StockStatus status;
    private LocalDateTime lastRestockedAt;
    private LocalDateTime updatedAt;

    public static InventoryResponse fromEntity(InventoryItem item) {
        return InventoryResponse.builder()
                .id(item.getId())
                .bookId(item.getBookId())
                .isbn(item.getIsbn())
                .title(item.getTitle())
                .author(item.getAuthor())
                .category(item.getCategory())
                .location(item.getLocation())
                .stockQuantity(item.getStockQuantity())
                .safetyStockLevel(item.getSafetyStockLevel())
                .reorderQuantity(item.getReorderQuantity())
                .unitCost(item.getUnitCost())
                .sellingPrice(item.getSellingPrice())
                .supplier(item.getSupplier())
                .status(item.getStatus())
                .lastRestockedAt(item.getLastRestockedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}

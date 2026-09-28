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

    public static InventoryResponse fromMirror(com.sarasavipages.members.sync.document.InventoryMirror mirror) {
        StockStatus st;
        try {
            st = StockStatus.valueOf(mirror.getStatus());
        } catch (Exception e) {
            st = mirror.getStockQuantity() <= mirror.getSafetyStockLevel() ? StockStatus.LOW_STOCK : StockStatus.IN_STOCK;
        }

        Long parsedId = 1L;
        try {
            parsedId = Long.parseLong(mirror.getId());
        } catch (Exception e) {
            parsedId = (long) Math.abs(mirror.getBookId().hashCode());
        }

        return InventoryResponse.builder()
                .id(parsedId)
                .bookId(mirror.getBookId())
                .isbn(mirror.getIsbn())
                .title(mirror.getTitle())
                .author(mirror.getAuthor())
                .category(mirror.getCategory())
                .location(mirror.getLocation())
                .stockQuantity(mirror.getStockQuantity())
                .safetyStockLevel(mirror.getSafetyStockLevel())
                .reorderQuantity(mirror.getReorderQuantity())
                .unitCost(mirror.getUnitCost())
                .sellingPrice(mirror.getSellingPrice())
                .supplier(mirror.getSupplier())
                .status(st)
                .build();
    }
}

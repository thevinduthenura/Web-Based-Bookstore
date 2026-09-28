package com.sarasavipages.members.sync.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB mirror document for the MSSQL 'inventory_items' table.
 * Tier 2: Read-fallback replica.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "inventory_mirror")
public class InventoryMirror {

    @Id
    private String id; // Matches inventory item id or bookId

    private String bookId;

    @Indexed
    private String isbn;

    @Indexed
    private String title;

    private String author;

    @Indexed
    private String category;

    private String location;
    private int stockQuantity;
    private int safetyStockLevel;
    private int reorderQuantity;
    private double unitCost;
    private double sellingPrice;
    private String supplier;
    private String status;

    private LocalDateTime syncedAt;
}

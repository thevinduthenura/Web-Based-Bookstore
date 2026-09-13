package com.sarasavipages.members.m4_dissanayake_inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InventoryItemRequest {

    @NotBlank(message = "Book ID is required")
    private String bookId;

    @NotBlank(message = "ISBN is required")
    private String isbn;

    @NotBlank(message = "Book title is required")
    private String title;

    @NotBlank(message = "Author is required")
    private String author;

    @NotBlank(message = "Category is required")
    private String category;

    private String location;

    @Min(value = 0, message = "Stock quantity cannot be negative")
    private int stockQuantity;

    @Min(value = 1, message = "Safety stock level must be at least 1")
    private int safetyStockLevel = 10;

    @Min(value = 1, message = "Reorder quantity must be at least 1")
    private int reorderQuantity = 20;

    @Min(value = 0, message = "Unit cost cannot be negative")
    private double unitCost;

    @Min(value = 0, message = "Selling price cannot be negative")
    private double sellingPrice;

    private String supplier;
}

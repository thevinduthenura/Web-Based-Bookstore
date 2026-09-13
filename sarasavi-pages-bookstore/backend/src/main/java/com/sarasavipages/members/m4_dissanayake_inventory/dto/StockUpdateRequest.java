package com.sarasavipages.members.m4_dissanayake_inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StockUpdateRequest {

    @Min(value = 1, message = "Quantity changed must be at least 1")
    private int quantity;

    @NotBlank(message = "Adjustment type is required (RESTOCK, DAMAGE, RETURN, MANUAL_CORRECTION)")
    private String adjustmentType;

    private String reason;
}

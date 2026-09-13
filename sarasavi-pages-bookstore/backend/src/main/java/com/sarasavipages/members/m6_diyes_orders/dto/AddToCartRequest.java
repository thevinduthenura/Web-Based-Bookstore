package com.sarasavipages.members.m6_diyes_orders.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddToCartRequest {
    @NotBlank(message = "Book ID is required")
    private String bookId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity = 1;
}

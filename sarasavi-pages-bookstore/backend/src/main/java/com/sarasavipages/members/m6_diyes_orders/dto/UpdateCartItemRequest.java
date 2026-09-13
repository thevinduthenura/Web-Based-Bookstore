package com.sarasavipages.members.m6_diyes_orders.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateCartItemRequest {
    @Min(value = 0, message = "Quantity cannot be negative")
    private int quantity;
}

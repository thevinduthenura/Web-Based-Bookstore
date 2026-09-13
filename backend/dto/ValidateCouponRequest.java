package com.bookstore.ordercart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateCouponRequest {
    private String code;
    private double cartTotal;
}

package com.sarasavipages.members.m6_diyes_orders.dto;

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

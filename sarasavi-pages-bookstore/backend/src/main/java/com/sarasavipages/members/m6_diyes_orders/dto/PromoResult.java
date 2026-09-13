package com.sarasavipages.members.m6_diyes_orders.dto;

import com.sarasavipages.members.m6_diyes_orders.entity.Promotion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromoResult {
    private Promotion promotion;
    private double discountAmount;
    private double finalTotal;
}

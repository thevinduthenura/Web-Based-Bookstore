package com.bookstore.ordercart.dto;

import com.bookstore.ordercart.model.Promotion;
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

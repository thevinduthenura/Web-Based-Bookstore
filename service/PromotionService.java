package com.bookstore.ordercart.service;

import com.bookstore.ordercart.model.Promotion;

public interface PromotionService {
    Promotion validateCode(String code, double cartTotal);
    double calculateDiscount(Promotion promo, double cartTotal);
}

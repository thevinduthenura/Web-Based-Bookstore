package com.sarasavipages.members.m6_diyes_orders.service;

import com.sarasavipages.members.m6_diyes_orders.entity.Promotion;

public interface PromotionService {

    Promotion validateCode(String code, double cartTotal);

    double calculateDiscount(Promotion promo, double cartTotal);
}

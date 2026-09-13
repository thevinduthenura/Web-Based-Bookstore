package com.bookstore.ordercart.service;

import com.bookstore.ordercart.model.Promotion;
import com.bookstore.ordercart.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;

    @Override
    public Promotion validateCode(String code, double cartTotal) {
        Promotion promo = promotionRepository.findByCodeIgnoreCaseAndActiveTrue(code)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or inactive coupon code: " + code));

        // check expiry
        if (promo.getValidUntil() != null && promo.getValidUntil().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Coupon code has expired.");
        }

        // check minimum spend
        if (cartTotal < promo.getMinSpend()) {
            throw new IllegalArgumentException(
                    "Minimum spend of LKR " + String.format("%.2f", promo.getMinSpend()) + " required for this code."
            );
        }

        return promo;
    }

    @Override
    public double calculateDiscount(Promotion promo, double cartTotal) {
        double rate = promo.getDiscountPercentage() > 0 ? promo.getDiscountPercentage() : promo.getDiscountPercent();
        double discount = cartTotal * (rate / 100.0);
        // cap at maxDiscount if set
        if (promo.getMaxDiscount() > 0) {
            discount = Math.min(discount, promo.getMaxDiscount());
        }
        return Math.round(discount * 100.0) / 100.0;
    }
}

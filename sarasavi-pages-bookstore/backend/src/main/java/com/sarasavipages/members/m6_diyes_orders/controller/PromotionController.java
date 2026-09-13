package com.sarasavipages.members.m6_diyes_orders.controller;

import com.sarasavipages.common.ApiResponse;
import com.sarasavipages.members.m6_diyes_orders.dto.PromoResult;
import com.sarasavipages.members.m6_diyes_orders.dto.ValidateCouponRequest;
import com.sarasavipages.members.m6_diyes_orders.entity.Promotion;
import com.sarasavipages.members.m6_diyes_orders.service.PromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
@Tag(name = "Module 6 – Promotions & Coupons", description = "Coupon validation managed by Diyes C.L. (IT25100263)")
public class PromotionController {

    private final PromotionService promotionService;

    @Operation(summary = "Validate promo code and calculate discount")
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<PromoResult>> validateCoupon(@RequestBody ValidateCouponRequest req) {
        try {
            Promotion promo = promotionService.validateCode(req.getCode(), req.getCartTotal());
            double discount = promotionService.calculateDiscount(promo, req.getCartTotal());
            double finalTotal = req.getCartTotal() - discount;
            PromoResult result = new PromoResult(promo, discount, finalTotal);
            return ResponseEntity.ok(ApiResponse.success("Coupon applied! You saved LKR " + String.format("%.2f", discount), result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

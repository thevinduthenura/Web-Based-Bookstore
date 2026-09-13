package com.bookstore.ordercart.controller;

import com.bookstore.ordercart.dto.ApiResponse;
import com.bookstore.ordercart.dto.PromoResult;
import com.bookstore.ordercart.dto.ValidateCouponRequest;
import com.bookstore.ordercart.model.Promotion;
import com.bookstore.ordercart.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PromotionController {

    private final PromotionService promotionService;

    // POST /api/promotions/validate
    // body: { "code": "PAGE10", "cartTotal": 5800.00 }
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

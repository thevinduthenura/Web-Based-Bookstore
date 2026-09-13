package com.sarasavipages.members.m6_diyes_orders.controller;

import com.sarasavipages.common.ApiResponse;
import com.sarasavipages.members.m6_diyes_orders.dto.AddToCartRequest;
import com.sarasavipages.members.m6_diyes_orders.dto.UpdateCartItemRequest;
import com.sarasavipages.members.m6_diyes_orders.entity.Cart;
import com.sarasavipages.members.m6_diyes_orders.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@Tag(name = "Module 6 – Shopping Cart", description = "Cart operations managed by Diyes C.L. (IT25100263)")
public class CartController {

    private final CartService cartService;

    @Operation(summary = "Get customer's active cart")
    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<Cart>> getCart(@PathVariable String customerId) {
        Cart cart = cartService.getCartByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    @Operation(summary = "Add item to customer cart")
    @PostMapping("/{customerId}/items")
    public ResponseEntity<ApiResponse<Cart>> addToCart(
            @PathVariable String customerId,
            @Valid @RequestBody AddToCartRequest request) {
        try {
            Cart cart = cartService.addToCart(customerId, request);
            return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Update cart item quantity")
    @PutMapping("/{customerId}/items/{bookId}")
    public ResponseEntity<ApiResponse<Cart>> updateCartItemQuantity(
            @PathVariable String customerId,
            @PathVariable String bookId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        try {
            Cart cart = cartService.updateCartItemQuantity(customerId, bookId, request);
            return ResponseEntity.ok(ApiResponse.success("Cart item quantity updated", cart));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Remove an item from cart")
    @DeleteMapping("/{customerId}/items/{bookId}")
    public ResponseEntity<ApiResponse<Cart>> removeItemFromCart(
            @PathVariable String customerId,
            @PathVariable String bookId) {
        try {
            Cart cart = cartService.removeItemFromCart(customerId, bookId);
            return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Clear customer cart")
    @DeleteMapping("/{customerId}")
    public ResponseEntity<ApiResponse<Void>> clearCart(@PathVariable String customerId) {
        cartService.clearCart(customerId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }
}

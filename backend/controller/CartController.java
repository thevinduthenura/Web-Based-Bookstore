package com.bookstore.ordercart.controller;

import com.bookstore.ordercart.dto.AddToCartRequest;
import com.bookstore.ordercart.dto.ApiResponse;
import com.bookstore.ordercart.dto.UpdateCartItemRequest;
import com.bookstore.ordercart.model.Cart;
import com.bookstore.ordercart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    // GET /api/cart/{customerId} — returns the customer's current cart
    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<Cart>> getCart(@PathVariable String customerId) {
        Cart cart = cartService.getCartByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    // POST /api/cart/{customerId}/items — adds a book to the cart
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

    // PUT /api/cart/{customerId}/items/{bookId} — update quantity of a specific item
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

    // DELETE /api/cart/{customerId}/items/{bookId} — removes a single book from cart
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

    // DELETE /api/cart/{customerId} — wipes the entire cart (used after checkout)
    @DeleteMapping("/{customerId}")
    public ResponseEntity<ApiResponse<Void>> clearCart(@PathVariable String customerId) {
        cartService.clearCart(customerId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }
}

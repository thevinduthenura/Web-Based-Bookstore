package com.bookstore.ordercart.service;

import com.bookstore.ordercart.dto.AddToCartRequest;
import com.bookstore.ordercart.dto.UpdateCartItemRequest;
import com.bookstore.ordercart.model.Cart;

public interface CartService {
    Cart getCartByCustomerId(String customerId);
    Cart addToCart(String customerId, AddToCartRequest request);
    Cart updateCartItemQuantity(String customerId, String bookId, UpdateCartItemRequest request);
    Cart removeItemFromCart(String customerId, String bookId);
    void clearCart(String customerId);
}

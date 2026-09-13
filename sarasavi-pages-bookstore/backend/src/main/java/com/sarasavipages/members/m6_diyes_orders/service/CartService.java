package com.sarasavipages.members.m6_diyes_orders.service;

import com.sarasavipages.members.m6_diyes_orders.dto.AddToCartRequest;
import com.sarasavipages.members.m6_diyes_orders.dto.UpdateCartItemRequest;
import com.sarasavipages.members.m6_diyes_orders.entity.Cart;

public interface CartService {

    Cart getCartByCustomerId(String customerId);

    Cart addToCart(String customerId, AddToCartRequest request);

    Cart updateCartItemQuantity(String customerId, String bookId, UpdateCartItemRequest request);

    Cart removeItemFromCart(String customerId, String bookId);

    void clearCart(String customerId);
}

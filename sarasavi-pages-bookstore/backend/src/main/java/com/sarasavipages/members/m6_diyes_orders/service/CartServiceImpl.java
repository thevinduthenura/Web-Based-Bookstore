package com.sarasavipages.members.m6_diyes_orders.service;

import com.sarasavipages.members.m6_diyes_orders.dto.AddToCartRequest;
import com.sarasavipages.members.m6_diyes_orders.dto.UpdateCartItemRequest;
import com.sarasavipages.members.m6_diyes_orders.entity.Book;
import com.sarasavipages.members.m6_diyes_orders.entity.Cart;
import com.sarasavipages.members.m6_diyes_orders.entity.CartItem;
import com.sarasavipages.members.m6_diyes_orders.repository.BookRepository;
import com.sarasavipages.members.m6_diyes_orders.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final BookRepository bookRepository;

    @Override
    @Transactional
    public Cart getCartByCustomerId(String customerId) {
        return cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> createEmptyCart(customerId));
    }

    @Override
    @Transactional
    public Cart addToCart(String customerId, AddToCartRequest request) {
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + request.getBookId()));

        if (book.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock available for book: " + book.getTitle() +
                    " (Available: " + book.getStockQuantity() + ")");
        }

        Cart cart = getCartByCustomerId(customerId);
        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getBookId().equals(request.getBookId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (book.getStockQuantity() < newQuantity) {
                throw new IllegalArgumentException("Cannot add more items than available stock (Stock: " +
                        book.getStockQuantity() + ", Current in cart: " + existingItem.getQuantity() + ")");
            }
            existingItem.setQuantity(newQuantity);
            existingItem.setSubtotal(existingItem.getPrice() * newQuantity);
        } else {
            CartItem newItem = new CartItem(
                    book.getId(),
                    book.getTitle(),
                    book.getAuthor(),
                    book.getPrice(),
                    book.getCoverImage(),
                    request.getQuantity(),
                    book.getPrice() * request.getQuantity()
            );
            cart.getItems().add(newItem);
        }

        recalculateCartTotals(cart);
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public Cart updateCartItemQuantity(String customerId, String bookId, UpdateCartItemRequest request) {
        Cart cart = getCartByCustomerId(customerId);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + bookId));

        if (request.getQuantity() == 0) {
            return removeItemFromCart(customerId, bookId);
        }

        if (book.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock. Only " + book.getStockQuantity() + " copies available.");
        }

        CartItem itemToUpdate = cart.getItems().stream()
                .filter(item -> item.getBookId().equals(bookId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Item not found in cart"));

        itemToUpdate.setQuantity(request.getQuantity());
        itemToUpdate.setSubtotal(itemToUpdate.getPrice() * request.getQuantity());

        recalculateCartTotals(cart);
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public Cart removeItemFromCart(String customerId, String bookId) {
        Cart cart = getCartByCustomerId(customerId);
        cart.getItems().removeIf(item -> item.getBookId().equals(bookId));
        recalculateCartTotals(cart);
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void clearCart(String customerId) {
        Cart cart = getCartByCustomerId(customerId);
        cart.getItems().clear();
        cart.setTotalAmount(0.0);
        cart.setTotalItems(0);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }

    private Cart createEmptyCart(String customerId) {
        Cart cart = new Cart();
        cart.setId(UUID.randomUUID().toString());
        cart.setCustomerId(customerId);
        cart.setItems(new ArrayList<>());
        cart.setTotalAmount(0.0);
        cart.setTotalItems(0);
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    private void recalculateCartTotals(Cart cart) {
        double total = cart.getItems().stream().mapToDouble(CartItem::getSubtotal).sum();
        int count = cart.getItems().stream().mapToInt(CartItem::getQuantity).sum();
        cart.setTotalAmount(total);
        cart.setTotalItems(count);
        cart.setUpdatedAt(LocalDateTime.now());
    }
}

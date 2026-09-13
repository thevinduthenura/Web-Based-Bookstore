package com.bookstore.ordercart.service;

import com.bookstore.ordercart.dto.AddToCartRequest;
import com.bookstore.ordercart.dto.UpdateCartItemRequest;
import com.bookstore.ordercart.model.Book;
import com.bookstore.ordercart.model.Cart;
import com.bookstore.ordercart.model.CartItem;
import com.bookstore.ordercart.repository.BookRepository;
import com.bookstore.ordercart.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final BookRepository bookRepository;

    @Override
    public Cart getCartByCustomerId(String customerId) {
        // if no cart exists yet, create a fresh empty one
        return cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> createEmptyCart(customerId));
    }

    @Override
    public Cart addToCart(String customerId, AddToCartRequest request) {
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + request.getBookId()));

        // make sure we have enough stock before adding
        if (book.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock available for book: " + book.getTitle() +
                    " (Available: " + book.getStockQuantity() + ")");
        }

        Cart cart = getCartByCustomerId(customerId);
        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getBookId().equals(request.getBookId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            // book is already in cart — just bump the quantity
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (book.getStockQuantity() < newQuantity) {
                throw new IllegalArgumentException("Cannot add more items than available stock (Stock: " +
                        book.getStockQuantity() + ", Current in cart: " + existingItem.getQuantity() + ")");
            }
            existingItem.setQuantity(newQuantity);
            existingItem.setSubtotal(existingItem.getPrice() * newQuantity);
        } else {
            // new item — build a CartItem from the book details
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
    public Cart updateCartItemQuantity(String customerId, String bookId, UpdateCartItemRequest request) {
        Cart cart = getCartByCustomerId(customerId);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + bookId));

        // treat quantity 0 as a remove request
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
    public Cart removeItemFromCart(String customerId, String bookId) {
        Cart cart = getCartByCustomerId(customerId);
        cart.getItems().removeIf(item -> item.getBookId().equals(bookId));
        recalculateCartTotals(cart);
        return cartRepository.save(cart);
    }

    @Override
    public void clearCart(String customerId) {
        Cart cart = getCartByCustomerId(customerId);
        cart.setItems(new ArrayList<>());
        cart.setTotalAmount(0.0);
        cart.setTotalItems(0);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }

    // creates and saves a blank cart for a customer who doesn't have one yet
    private Cart createEmptyCart(String customerId) {
        Cart cart = new Cart();
        cart.setCustomerId(customerId);
        cart.setItems(new ArrayList<>());
        cart.setTotalAmount(0.0);
        cart.setTotalItems(0);
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    // recalculates total price and item count after any cart change
    private void recalculateCartTotals(Cart cart) {
        double total = cart.getItems().stream().mapToDouble(CartItem::getSubtotal).sum();
        int count = cart.getItems().stream().mapToInt(CartItem::getQuantity).sum();
        cart.setTotalAmount(total);
        cart.setTotalItems(count);
        cart.setUpdatedAt(LocalDateTime.now());
    }
}

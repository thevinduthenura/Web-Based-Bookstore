package com.bookstore.ordercart.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// a single book line item stored inside the cart
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    private String bookId;
    private String title;
    private String author;
    private double price;
    private String coverImage;
    private int quantity;
    private double subtotal;
}

package com.sarasavipages.members.m6_diyes_orders.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String bookId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private double price;

    @Column(length = 500)
    private String coverImage;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private double subtotal;

    public CartItem(String bookId, String title, String author, double price, String coverImage, int quantity, double subtotal) {
        this.bookId = bookId;
        this.title = title;
        this.author = author;
        this.price = price;
        this.coverImage = coverImage;
        this.quantity = quantity;
        this.subtotal = subtotal;
    }
}

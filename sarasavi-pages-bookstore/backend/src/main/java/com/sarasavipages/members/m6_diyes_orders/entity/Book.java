package com.sarasavipages.members.m6_diyes_orders.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "books")
public class Book {
    @Id
    private String id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String author;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    private double price;
    
    @Column(length = 500)
    private String coverImage;
    
    private int stockQuantity;
    private String isbn;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private double rating;
}

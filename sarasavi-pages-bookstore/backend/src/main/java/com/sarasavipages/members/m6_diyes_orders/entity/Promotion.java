package com.sarasavipages.members.m6_diyes_orders.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "promotions")
public class Promotion {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String code;

    @JsonProperty("discountPercentage")
    @JsonAlias({"discountPercent", "discountPercentage"})
    private double discountPercentage;

    private double maxDiscount;
    private double minSpend;
    private LocalDateTime validUntil;
    private boolean active;

    public double getDiscountPercent() {
        return discountPercentage;
    }

    public void setDiscountPercent(double discountPercent) {
        this.discountPercentage = discountPercent;
    }
}

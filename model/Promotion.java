package com.bookstore.ordercart.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "promotions")
public class Promotion {
    @Id
    private String id;
    private String code;

    @Field(name = "discountPercentage")
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

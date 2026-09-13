package com.bookstore.ordercart.repository;

import com.bookstore.ordercart.model.Promotion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromotionRepository extends MongoRepository<Promotion, String> {

    // find a valid promo code — only returns it if it's still marked active
    Optional<Promotion> findByCodeIgnoreCaseAndActiveTrue(String code);
}

package com.bookstore.ordercart.repository;

import com.bookstore.ordercart.model.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends MongoRepository<Cart, String> {

    // each customer has one active cart — find it by their ID
    Optional<Cart> findByCustomerId(String customerId);
}

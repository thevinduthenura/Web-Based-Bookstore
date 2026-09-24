package com.sarasavipages.members.sync.repository;

import com.sarasavipages.members.sync.document.OrderMirror;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * MongoDB repository for the orders_mirror collection.
 */
@Repository
public interface OrderMirrorRepository extends MongoRepository<OrderMirror, String> {

    List<OrderMirror> findByCustomerId(String customerId);

    List<OrderMirror> findByStatus(String status);
}

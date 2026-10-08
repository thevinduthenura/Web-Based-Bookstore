package com.sarasavipages.members.m6_diyes_orders.repository;

import com.sarasavipages.members.m6_diyes_orders.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByStatusIgnoreCase(String status);
}

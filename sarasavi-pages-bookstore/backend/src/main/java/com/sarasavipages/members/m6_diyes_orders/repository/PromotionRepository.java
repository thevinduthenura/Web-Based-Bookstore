package com.sarasavipages.members.m6_diyes_orders.repository;

import com.sarasavipages.members.m6_diyes_orders.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, String> {

    Optional<Promotion> findByCodeIgnoreCaseAndActiveTrue(String code);
}

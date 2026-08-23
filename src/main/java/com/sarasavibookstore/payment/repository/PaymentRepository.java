package com.sarasavibookstore.payment.repository;

import com.sarasavibookstore.payment.entity.Payment;
import com.sarasavibookstore.payment.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Read: view transaction(s)
    Optional<Payment> findByTransactionReference(String transactionReference);

    List<Payment> findByOrderId(Long orderId);

    Page<Payment> findByCustomerId(Long customerId, Pageable pageable);

    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);

    // Monthly financial report support (additional scope, Section 8.2)
    @Query("SELECT p FROM Payment p WHERE p.createdAt BETWEEN :start AND :end")
    List<Payment> findAllBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p " +
           "WHERE p.status = 'PAID' AND p.createdAt BETWEEN :start AND :end")
    BigDecimal sumPaidAmountBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = :status AND p.createdAt BETWEEN :start AND :end")
    long countByStatusBetween(@Param("status") PaymentStatus status,
                               @Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end);
}

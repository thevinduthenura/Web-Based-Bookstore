package com.sarasavipages.members.m2_anaf_payment.service;

import com.sarasavipages.members.m2_anaf_payment.dto.MonthlyReportResponse;
import com.sarasavipages.members.m2_anaf_payment.dto.PaymentCreateRequest;
import com.sarasavipages.members.m2_anaf_payment.dto.PaymentResponse;
import com.sarasavipages.members.m2_anaf_payment.dto.PaymentStatusUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PaymentService {

    // Create
    PaymentResponse recordPayment(PaymentCreateRequest request);

    // Read
    PaymentResponse getPaymentById(Long id);
    Page<PaymentResponse> getAllPayments(Pageable pageable);
    Page<PaymentResponse> getPaymentsByCustomer(Long customerId, Pageable pageable);
    List<PaymentResponse> getPaymentsByOrder(Long orderId);

    // Update
    PaymentResponse updateStatus(Long id, PaymentStatusUpdateRequest request);
    PaymentResponse refundPayment(Long id, String reason);

    // Delete (void/cancel)
    void voidPayment(Long id);

    // Additional scope
    byte[] generateInvoicePdf(Long id);
    MonthlyReportResponse getMonthlyReport(int year, int month);
}

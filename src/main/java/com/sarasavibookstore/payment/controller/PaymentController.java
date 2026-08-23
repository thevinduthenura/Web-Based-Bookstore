package com.sarasavibookstore.payment.controller;

import com.sarasavibookstore.payment.dto.MonthlyReportResponse;
import com.sarasavibookstore.payment.dto.PaymentCreateRequest;
import com.sarasavibookstore.payment.dto.PaymentResponse;
import com.sarasavibookstore.payment.dto.PaymentStatusUpdateRequest;
import com.sarasavibookstore.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // CREATE - record a new payment
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','FINANCE_COORDINATOR','STORE_MANAGER')")
    public ResponseEntity<PaymentResponse> recordPayment(@Valid @RequestBody PaymentCreateRequest request) {
        PaymentResponse response = paymentService.recordPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // READ - single transaction
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER','FINANCE_COORDINATOR','STORE_MANAGER')")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    // READ - all transactions, paginated (Performance NFR: avoid loading full table)
    @GetMapping
    @PreAuthorize("hasAnyRole('FINANCE_COORDINATOR','STORE_MANAGER')")
    public ResponseEntity<Page<PaymentResponse>> getAllPayments(Pageable pageable) {
        return ResponseEntity.ok(paymentService.getAllPayments(pageable));
    }

    // READ - transactions for one customer (payment history)
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('CUSTOMER','FINANCE_COORDINATOR','STORE_MANAGER')")
    public ResponseEntity<Page<PaymentResponse>> getPaymentsByCustomer(@PathVariable Long customerId, Pageable pageable) {
        return ResponseEntity.ok(paymentService.getPaymentsByCustomer(customerId, pageable));
    }

    // READ - transactions for one order
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER','FINANCE_COORDINATOR','STORE_MANAGER')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentsByOrder(orderId));
    }

    // UPDATE - change status (Pending/Paid/Failed/Refunded)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('FINANCE_COORDINATOR','STORE_MANAGER')")
    public ResponseEntity<PaymentResponse> updateStatus(@PathVariable Long id,
                                                          @Valid @RequestBody PaymentStatusUpdateRequest request) {
        return ResponseEntity.ok(paymentService.updateStatus(id, request));
    }

    // UPDATE - dedicated refund action
    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('FINANCE_COORDINATOR','STORE_MANAGER')")
    public ResponseEntity<PaymentResponse> refundPayment(@PathVariable Long id,
                                                           @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(paymentService.refundPayment(id, reason));
    }

    // DELETE - void/cancel a failed or pending transaction
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FINANCE_COORDINATOR','STORE_MANAGER')")
    public ResponseEntity<Void> voidPayment(@PathVariable Long id) {
        paymentService.voidPayment(id);
        return ResponseEntity.noContent().build();
    }

    // Additional scope - downloadable invoice
    @GetMapping(value = "/{id}/invoice", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    @PreAuthorize("hasAnyRole('CUSTOMER','FINANCE_COORDINATOR','STORE_MANAGER')")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        byte[] invoice = paymentService.generateInvoicePdf(id);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=invoice-" + id + ".txt")
                .body(invoice);
    }

    // Additional scope - monthly financial report
    @GetMapping("/reports/monthly")
    @PreAuthorize("hasAnyRole('FINANCE_COORDINATOR','STORE_MANAGER')")
    public ResponseEntity<MonthlyReportResponse> getMonthlyReport(@RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(paymentService.getMonthlyReport(year, month));
    }
}

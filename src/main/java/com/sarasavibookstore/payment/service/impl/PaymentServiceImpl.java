package com.sarasavibookstore.payment.service.impl;

import com.sarasavibookstore.payment.dto.MonthlyReportResponse;
import com.sarasavibookstore.payment.dto.PaymentCreateRequest;
import com.sarasavibookstore.payment.dto.PaymentResponse;
import com.sarasavibookstore.payment.dto.PaymentStatusUpdateRequest;
import com.sarasavibookstore.payment.entity.Payment;
import com.sarasavibookstore.payment.entity.PaymentStatus;
import com.sarasavibookstore.payment.exception.InvalidPaymentStatusTransitionException;
import com.sarasavibookstore.payment.exception.PaymentNotFoundException;
import com.sarasavibookstore.payment.mapper.PaymentMapper;
import com.sarasavibookstore.payment.repository.PaymentRepository;
import com.sarasavibookstore.payment.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger AUDIT_LOG = LoggerFactory.getLogger("PAYMENT_AUDIT");

    private final PaymentRepository paymentRepository;

    // Allowed status transitions -> enforces the CRUD/Update rule
    // (Pending -> Paid/Failed, Paid -> Refunded, Failed -> Pending retry, nothing leaves Refunded/Voided)
    private static final Map<PaymentStatus, Set<PaymentStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(PaymentStatus.class);
    static {
        ALLOWED_TRANSITIONS.put(PaymentStatus.PENDING, EnumSet.of(PaymentStatus.PAID, PaymentStatus.FAILED, PaymentStatus.VOIDED));
        ALLOWED_TRANSITIONS.put(PaymentStatus.PAID, EnumSet.of(PaymentStatus.REFUNDED));
        ALLOWED_TRANSITIONS.put(PaymentStatus.FAILED, EnumSet.of(PaymentStatus.PENDING, PaymentStatus.VOIDED));
        ALLOWED_TRANSITIONS.put(PaymentStatus.REFUNDED, EnumSet.noneOf(PaymentStatus.class));
        ALLOWED_TRANSITIONS.put(PaymentStatus.VOIDED, EnumSet.noneOf(PaymentStatus.class));
    }

    public PaymentServiceImpl(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    @Transactional
    public PaymentResponse recordPayment(PaymentCreateRequest request) {
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setCustomerId(request.getCustomerId());
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionReference(generateTransactionReference());
        payment.setInvoiceNumber(generateInvoiceNumber());

        // Sandbox/test-mode gateway simulation only (no live credentials -
        // matches System Limitations, Section 10, of the proposal).
        boolean gatewayApproved = simulateGatewayCharge(payment.getAmount());
        if (gatewayApproved) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setGatewayMessage("Sandbox gateway approved transaction");
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setGatewayMessage("Sandbox gateway declined transaction");
        }

        Payment saved = paymentRepository.save(payment);
        audit("CREATE", saved, "Payment recorded via " + saved.getPaymentMethod());
        return PaymentMapper.toResponse(saved);
    }

    @Override
    public PaymentResponse getPaymentById(Long id) {
        return PaymentMapper.toResponse(findOrThrow(id));
    }

    @Override
    public Page<PaymentResponse> getAllPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable).map(PaymentMapper::toResponse);
    }

    @Override
    public Page<PaymentResponse> getPaymentsByCustomer(Long customerId, Pageable pageable) {
        return paymentRepository.findByCustomerId(customerId, pageable).map(PaymentMapper::toResponse);
    }

    @Override
    public List<PaymentResponse> getPaymentsByOrder(Long orderId) {
        return paymentRepository.findByOrderId(orderId).stream()
                .map(PaymentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentResponse updateStatus(Long id, PaymentStatusUpdateRequest request) {
        Payment payment = findOrThrow(id);
        transitionStatus(payment, request.getStatus());
        if (request.getGatewayMessage() != null) {
            payment.setGatewayMessage(request.getGatewayMessage());
        }
        Payment saved = paymentRepository.save(payment);
        audit("UPDATE_STATUS", saved, "Status changed to " + saved.getStatus());
        return PaymentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public PaymentResponse refundPayment(Long id, String reason) {
        Payment payment = findOrThrow(id);
        transitionStatus(payment, PaymentStatus.REFUNDED);
        payment.setGatewayMessage("Refunded: " + (reason == null ? "customer request" : reason));
        Payment saved = paymentRepository.save(payment);
        audit("REFUND", saved, payment.getGatewayMessage());
        return PaymentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void voidPayment(Long id) {
        Payment payment = findOrThrow(id);
        // Delete = void/cancel a failed (or still pending) transaction; kept as a
        // soft-delete row for the auditability non-functional requirement.
        if (payment.getStatus() != PaymentStatus.FAILED && payment.getStatus() != PaymentStatus.PENDING) {
            throw new InvalidPaymentStatusTransitionException(payment.getStatus(), PaymentStatus.VOIDED);
        }
        transitionStatus(payment, PaymentStatus.VOIDED);
        paymentRepository.save(payment);
        audit("VOID", payment, "Payment voided/cancelled");
    }

    @Override
    public byte[] generateInvoicePdf(Long id) {
        Payment payment = findOrThrow(id);
        // Lightweight text-based invoice. Swap this for a PDF library
        // (e.g. OpenPDF / iText) at merge time if a byte-for-byte PDF is required.
        String invoice = "SARASAVI BOOKSTORE - PAYMENT INVOICE\n"
                + "----------------------------------------\n"
                + "Invoice No : " + payment.getInvoiceNumber() + "\n"
                + "Order ID   : " + payment.getOrderId() + "\n"
                + "Customer   : " + payment.getCustomerId() + "\n"
                + "Amount     : " + payment.getCurrency() + " " + payment.getAmount() + "\n"
                + "Method     : " + payment.getPaymentMethod() + "\n"
                + "Status     : " + payment.getStatus() + "\n"
                + "Reference  : " + payment.getTransactionReference() + "\n"
                + "Date       : " + payment.getCreatedAt() + "\n";
        return invoice.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public MonthlyReportResponse getMonthlyReport(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);

        MonthlyReportResponse report = new MonthlyReportResponse();
        report.setYear(year);
        report.setMonth(month);
        report.setTotalPaidAmount(paymentRepository.sumPaidAmountBetween(start, end));
        report.setPaidCount(paymentRepository.countByStatusBetween(PaymentStatus.PAID, start, end));
        report.setFailedCount(paymentRepository.countByStatusBetween(PaymentStatus.FAILED, start, end));
        report.setRefundedCount(paymentRepository.countByStatusBetween(PaymentStatus.REFUNDED, start, end));
        report.setPendingCount(paymentRepository.countByStatusBetween(PaymentStatus.PENDING, start, end));
        return report;
    }

    // ----- helpers -----

    private Payment findOrThrow(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException(id));
    }

    private void transitionStatus(Payment payment, PaymentStatus newStatus) {
        PaymentStatus current = payment.getStatus();
        if (current == newStatus) return;
        Set<PaymentStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, EnumSet.noneOf(PaymentStatus.class));
        if (!allowed.contains(newStatus)) {
            throw new InvalidPaymentStatusTransitionException(current, newStatus);
        }
        payment.setStatus(newStatus);
    }

    /** Sandbox-only gateway simulation (test mode - see System Limitations). */
    private boolean simulateGatewayCharge(BigDecimal amount) {
        // Deterministic-enough stub: anything under 1,000,000 "succeeds" in sandbox.
        return amount.compareTo(new BigDecimal("1000000")) < 0;
    }

    private String generateTransactionReference() {
        return "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis();
    }

    private void audit(String action, Payment payment, String detail) {
        // Financial/administrative auditability requirement (Section 6).
        // Replace with a call into the shared ActivityLog service once the
        // Admin & Staff Management module (Section 8.1) is merged in.
        AUDIT_LOG.info("[{}] paymentId={} status={} detail={}",
                action, payment.getId(), payment.getStatus(), detail);
    }
}

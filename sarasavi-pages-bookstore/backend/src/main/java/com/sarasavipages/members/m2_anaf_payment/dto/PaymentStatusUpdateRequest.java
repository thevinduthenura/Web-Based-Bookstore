package com.sarasavipages.members.m2_anaf_payment.dto;

import com.sarasavipages.members.m2_anaf_payment.entity.PaymentStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for PATCH /api/payments/{id}/status
 * (Update - change status: Pending/Paid/Failed/Refunded).
 */
public class PaymentStatusUpdateRequest {

    @NotNull(message = "status is required")
    private PaymentStatus status;

    private String gatewayMessage;

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public String getGatewayMessage() { return gatewayMessage; }
    public void setGatewayMessage(String gatewayMessage) { this.gatewayMessage = gatewayMessage; }
}

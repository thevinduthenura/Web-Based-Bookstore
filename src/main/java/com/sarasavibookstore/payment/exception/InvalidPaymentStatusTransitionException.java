package com.sarasavibookstore.payment.exception;

import com.sarasavibookstore.payment.entity.PaymentStatus;

public class InvalidPaymentStatusTransitionException extends RuntimeException {
    public InvalidPaymentStatusTransitionException(PaymentStatus from, PaymentStatus to) {
        super("Cannot change payment status from " + from + " to " + to);
    }
}

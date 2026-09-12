package com.sarasavipages.members.m2_anaf_payment.exception;

import com.sarasavipages.members.m2_anaf_payment.entity.PaymentStatus;

public class InvalidPaymentStatusTransitionException extends RuntimeException {
    public InvalidPaymentStatusTransitionException(PaymentStatus from, PaymentStatus to) {
        super("Cannot change payment status from " + from + " to " + to);
    }
}

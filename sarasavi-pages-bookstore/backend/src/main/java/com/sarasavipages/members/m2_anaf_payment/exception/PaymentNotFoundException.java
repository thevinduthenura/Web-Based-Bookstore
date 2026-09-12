package com.sarasavipages.members.m2_anaf_payment.exception;

public class PaymentNotFoundException extends RuntimeException {
    public PaymentNotFoundException(Long id) {
        super("Payment not found with id: " + id);
    }
}

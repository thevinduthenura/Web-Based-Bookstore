package com.sarasavibookstore.payment.entity;

/**
 * Lifecycle states for a Payment transaction.
 * Matches the CRUD scope defined in the proposal (Section 8.2):
 *   Create -> PENDING (or PAID if gateway confirms instantly)
 *   Update -> PENDING/PAID/FAILED/REFUNDED
 *   Delete -> VOIDED (soft-delete, kept for the financial audit trail)
 */
public enum PaymentStatus {
    PENDING,
    PAID,
    FAILED,
    REFUNDED,
    VOIDED
}

package com.sarasavipages.members.m1_gunathilaka_adminstaff.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * AuditLog entity – records every staff management action for traceability.
 * Module: M1 – Admin & Staff Management
 * Owner: Gunathilaka H.D.T.T. (IT25101540)
 *
 * Every CREATE / UPDATE / DEACTIVATE / LOGIN action on staff accounts
 * is written here as part of UC-ASM-01 audit trail requirement.
 */
@Entity
@Table(name = "audit_log", schema = "public")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Who performed the action (performer's username) */
    @Column(nullable = false, length = 50)
    private String performedBy;

    /** Action type: STAFF_CREATED, STAFF_UPDATED, STAFF_DEACTIVATED, STAFF_ACTIVATED, STAFF_LOGIN */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AuditAction action;

    /** Username of the target staff member affected */
    @Column(length = 50)
    private String targetUsername;

    /** Human-readable description of the change */
    @Column(nullable = false, length = 500)
    private String description;

    /** Timestamp of the action */
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}

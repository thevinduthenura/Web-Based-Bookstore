package com.sarasavipages.members.m1_gunathilaka_adminstaff.entity;

/**
 * Role enum for Sarasavi Pages staff members.
 * Module: M1 – Admin & Staff Management
 * Owner: Gunathilaka H.D.T.T. (IT25101540)
 *
 * Role hierarchy:
 *  SUPER_ADMIN          → Full access to ALL modules + staff management
 *  PAYMENT_ADMIN        → Access to Payment module only (M2 – Anaf)
 *  CUSTOMER_SERVICE_ADMIN → Access to Customer Service module only (M3 – Zeen)
 *  INVENTORY_ADMIN      → Access to Inventory & Catalog module only (M4 – Dissanayake)
 *  ACCOUNT_ADMIN        → Access to User Account module only (M5 – Gayathmi)
 *  ORDER_ADMIN          → Access to Order & Cart module only (M6 – Diyes)
 */
public enum StaffRole {
    SUPER_ADMIN,
    PAYMENT_ADMIN,
    CUSTOMER_SERVICE_ADMIN,
    INVENTORY_ADMIN,
    ACCOUNT_ADMIN,
    ORDER_ADMIN
}

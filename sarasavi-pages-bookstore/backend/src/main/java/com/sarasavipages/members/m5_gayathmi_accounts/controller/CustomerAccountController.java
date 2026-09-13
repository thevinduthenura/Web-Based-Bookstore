package com.sarasavipages.members.m5_gayathmi_accounts.controller;

import com.sarasavipages.common.ApiResponse;
import com.sarasavipages.members.m5_gayathmi_accounts.dto.CustomerProfileResponse;
import com.sarasavipages.members.m5_gayathmi_accounts.dto.CustomerRegistrationRequest;
import com.sarasavipages.members.m5_gayathmi_accounts.dto.ProfileUpdateRequest;
import com.sarasavipages.members.m5_gayathmi_accounts.entity.AccountStatus;
import com.sarasavipages.members.m5_gayathmi_accounts.service.CustomerAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Customer Account & Profile Management REST Controller - UC-UAP-01
 * Role Required: SUPER_ADMIN or ACCOUNT_ADMIN
 * Owner: Gayathmi P.G.R. (IT25103013)
 */
@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
@Tag(name = "Module 5 – User Accounts", description = "Customer registrations, profile maintenance, and KYC administration")
public class CustomerAccountController {

    private final CustomerAccountService accountService;

    @Operation(summary = "Register new customer account (UC-UAP-01)")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> registerCustomer(
            @Valid @RequestBody CustomerRegistrationRequest request) {
        try {
            CustomerProfileResponse res = accountService.registerCustomer(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Account registered successfully. Welcome to Sarasavi Pages!", res));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Get customer profile by Customer ID")
    @GetMapping("/{customerId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNT_ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> getProfile(@PathVariable String customerId) {
        try {
            CustomerProfileResponse res = accountService.getProfileByCustomerId(customerId);
            return ResponseEntity.ok(ApiResponse.success("Customer profile found", res));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Update customer profile details")
    @PutMapping("/{customerId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNT_ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> updateProfile(
            @PathVariable String customerId,
            @RequestBody ProfileUpdateRequest request) {
        try {
            CustomerProfileResponse res = accountService.updateProfile(customerId, request);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", res));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Update account status (ACTIVE, SUSPENDED, PENDING_VERIFICATION)")
    @PatchMapping("/{customerId}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNT_ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> updateStatus(
            @PathVariable String customerId,
            @RequestParam AccountStatus status) {
        try {
            CustomerProfileResponse res = accountService.updateAccountStatus(customerId, status);
            return ResponseEntity.ok(ApiResponse.success("Account status updated to " + status, res));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Verify customer KYC status")
    @PatchMapping("/{customerId}/kyc")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNT_ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> verifyKyc(
            @PathVariable String customerId,
            @RequestParam boolean verified) {
        try {
            CustomerProfileResponse res = accountService.verifyKyc(customerId, verified);
            return ResponseEntity.ok(ApiResponse.success("KYC status updated to " + (verified ? "Verified" : "Unverified"), res));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "List all customer accounts with filtering")
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNT_ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<CustomerProfileResponse>>> getAllCustomers(
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(required = false) String query) {
        List<CustomerProfileResponse> list = accountService.getAllCustomers(status, query);
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved successfully", list));
    }
}

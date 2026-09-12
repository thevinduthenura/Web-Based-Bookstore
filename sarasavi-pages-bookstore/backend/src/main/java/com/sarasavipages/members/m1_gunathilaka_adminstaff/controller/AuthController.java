package com.sarasavipages.members.m1_gunathilaka_adminstaff.controller;

import com.sarasavipages.common.ApiResponse;
import com.sarasavipages.config.JwtUtil;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.dto.LoginRequest;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.dto.LoginResponse;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.Staff;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.StaffRole;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.service.StaffService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Auth controller – login endpoint for all staff roles.
 * Module: M1 – Admin & Staff Management
 * Owner: Gunathilaka H.D.T.T. (IT25101540)
 *
 * POST /api/auth/login  → returns JWT + role info + dashboard redirect path
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Login and authentication endpoints")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final StaffService staffService;

    @PostMapping("/login")
    @Operation(summary = "Login for all staff roles", description =
            "Authenticate with username + password. Returns JWT token and dashboard path.")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(), request.getPassword()));

        Staff staff = (Staff) auth.getPrincipal();
        String token = jwtUtil.generateToken(staff);

        // Record the login in audit log
        staffService.recordLogin(staff.getUsername());

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpirationMs())
                .staffId(staff.getId())
                .username(staff.getUsername())
                .fullName(staff.getFullName())
                .role(staff.getRole())
                .dashboardPath(getDashboardPath(staff.getRole()))
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    /**
     * Maps each role to its dashboard path in the Next.js frontend.
     * SUPER_ADMIN → /admin/dashboard
     * Others      → /admin/{module}/dashboard
     */
    private String getDashboardPath(StaffRole role) {
        return switch (role) {
            case SUPER_ADMIN -> "/admin/dashboard";
            case PAYMENT_ADMIN -> "/admin/payment/dashboard";
            case CUSTOMER_SERVICE_ADMIN -> "/admin/customer-service/dashboard";
            case INVENTORY_ADMIN -> "/admin/inventory/dashboard";
            case ACCOUNT_ADMIN -> "/admin/accounts/dashboard";
            case ORDER_ADMIN -> "/admin/orders/dashboard";
        };
    }
}

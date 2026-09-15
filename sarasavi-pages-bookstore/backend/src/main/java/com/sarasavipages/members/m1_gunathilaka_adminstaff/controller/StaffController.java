package com.sarasavipages.members.m1_gunathilaka_adminstaff.controller;

import com.sarasavipages.common.ApiResponse;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.dto.StaffRequest;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.dto.StaffResponse;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.AuditLog;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.service.AuditLogService;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.service.StaffService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Staff management REST controller – UC-ASM-01.
 * All endpoints require ROLE_SUPER_ADMIN.
 *
 * Module: M1 – Admin & Staff Management
 * Owner: Gunathilaka H.D.T.T. (IT25101540)
 *
 * Base path: /api/admin
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "Admin – Staff Management", description = "UC-ASM-01: Create, update, deactivate staff. SUPER_ADMIN only.")
@SecurityRequirement(name = "bearerAuth")
public class StaffController {

    private final StaffService staffService;
    private final AuditLogService auditLogService;

    // ── Staff CRUD ────────────────────────────────────────────────────────────

    @GetMapping("/staff")
    @Operation(summary = "List all staff members")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> getAllStaff() {
        return ResponseEntity.ok(ApiResponse.ok(staffService.getAllStaff()));
    }

    @GetMapping("/staff/{id}")
    @Operation(summary = "Get a single staff member by ID")
    public ResponseEntity<ApiResponse<StaffResponse>> getStaff(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(staffService.getStaffById(id)));
    }

    @PostMapping("/staff")
    @Operation(summary = "Create a new staff member",
               description = "Username auto-generated from name + IT number. Default password = last 4 digits of IT number.")
    public ResponseEntity<ApiResponse<StaffResponse>> createStaff(
            @Valid @RequestBody StaffRequest request,
            Authentication auth) {
        StaffResponse created = staffService.createStaff(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Staff member created successfully", created));
    }

    @PutMapping("/staff/{id}")
    @Operation(summary = "Update staff member (role, email, name)")
    public ResponseEntity<ApiResponse<StaffResponse>> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody StaffRequest request,
            Authentication auth) {
        StaffResponse updated = staffService.updateStaff(id, request, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Staff member updated successfully", updated));
    }

    @DeleteMapping("/staff/{id}")
    @Operation(summary = "Deactivate a staff member (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deactivateStaff(
            @PathVariable Long id,
            Authentication auth) {
        staffService.deactivateStaff(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Staff member deactivated", null));
    }

    @PatchMapping("/staff/{id}/activate")
    @Operation(summary = "Re-activate a deactivated staff member")
    public ResponseEntity<ApiResponse<Void>> activateStaff(
            @PathVariable Long id,
            Authentication auth) {
        staffService.activateStaff(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Staff member activated", null));
    }

    @DeleteMapping("/staff/{id}/permanent")
    @Operation(summary = "Permanently delete a staff account")
    public ResponseEntity<ApiResponse<Void>> deleteStaff(
            @PathVariable Long id,
            Authentication auth) {
        staffService.deleteStaff(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Staff member permanently deleted", null));
    }

    // ── Audit Logs ────────────────────────────────────────────────────────────

    @GetMapping("/audit-logs")
    @Operation(summary = "Get paginated audit trail (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLog> logs = auditLogService.getAll(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @GetMapping("/audit-logs/staff/{username}")
    @Operation(summary = "Get audit logs for a specific staff member")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogsByStaff(
            @PathVariable String username) {
        return ResponseEntity.ok(ApiResponse.ok(auditLogService.getByTarget(username)));
    }

    // ── Dashboard Stats ───────────────────────────────────────────────────────

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get admin dashboard stats (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<Object>> getDashboardStats() {
        List<StaffResponse> allStaff = staffService.getAllStaff();
        long active = allStaff.stream().filter(StaffResponse::isActive).count();
        long inactive = allStaff.stream().filter(s -> !s.isActive()).count();

        var stats = new java.util.HashMap<String, Object>();
        stats.put("totalStaff", allStaff.size());
        stats.put("activeStaff", active);
        stats.put("inactiveStaff", inactive);

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}

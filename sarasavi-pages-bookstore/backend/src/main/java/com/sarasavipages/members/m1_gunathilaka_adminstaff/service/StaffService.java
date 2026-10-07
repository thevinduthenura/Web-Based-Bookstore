package com.sarasavipages.members.m1_gunathilaka_adminstaff.service;

import com.sarasavipages.members.m1_gunathilaka_adminstaff.dto.StaffRequest;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.dto.StaffResponse;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.AuditAction;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.Staff;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.StaffRole;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.repository.StaffRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for staff management – UC-ASM-01.
 * Module: M1 – Admin & Staff Management
 * Owner: Gunathilaka H.D.T.T. (IT25101540)
 *
 * Username generation rule: {LastName}{FirstInitial}{Last4DigitsOfIT}
 * Password default rule:     last 4 digits of IT number (BCrypt hashed)
 */
@Service
@Transactional
public class StaffService implements UserDetailsService {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final java.util.Optional<com.sarasavipages.members.sync.repository.StaffMirrorRepository> staffMirrorRepository;

    public StaffService(StaffRepository staffRepository, 
                        @Lazy PasswordEncoder passwordEncoder, 
                        AuditLogService auditLogService,
                        java.util.Optional<com.sarasavipages.members.sync.repository.StaffMirrorRepository> staffMirrorRepository) {
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
        this.staffMirrorRepository = staffMirrorRepository;
    }

    // ── UserDetailsService (used by Spring Security) ─────────────────────────

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username == null || username.isBlank()) {
            throw new UsernameNotFoundException("Username or email cannot be empty");
        }
        String clean = username.trim();

        if ("admin".equalsIgnoreCase(clean) || "superadmin".equalsIgnoreCase(clean) || "administrator".equalsIgnoreCase(clean)) {
            var adminOpt = staffRepository.findByUsernameIgnoreCase("admin");
            if (adminOpt.isPresent()) return adminOpt.get();
            return staffRepository.findByUsernameIgnoreCase("GunathilakaT1540")
                    .orElseThrow(() -> new UsernameNotFoundException("Staff member not found with username: " + clean));
        }

        // 1. Try username
        var userOpt = staffRepository.findByUsernameIgnoreCase(clean);
        if (userOpt.isPresent()) return userOpt.get();

        // 2. Try email (e.g. admin@sarasavipages.lk, gunathilaka@sarasavipages.lk)
        var emailOpt = staffRepository.findByEmailIgnoreCase(clean);
        if (emailOpt.isPresent()) return emailOpt.get();

        // 3. Try Employee ID (e.g. EMP-1000, EMP-1001)
        var empOpt = staffRepository.findByEmployeeIdIgnoreCase(clean);
        if (empOpt.isPresent()) return empOpt.get();

        // 4. Try legacy IT number if applicable
        var itOpt = staffRepository.findByItNumber(clean);
        if (itOpt.isPresent()) return itOpt.get();

        throw new UsernameNotFoundException("Staff member not found with identifier: " + clean);
    }

    // ── Staff CRUD ────────────────────────────────────────────────────────────

    /**
     * Create a new staff member.
     * IT number is optional (auto-generated if omitted).
     * Username can be specified or auto-generated.
     * Enforces username, password, email and name validation rules.
     */
    public StaffResponse createStaff(StaffRequest request, String performedBy) {
        // Validation: Full Name
        if (request.getFullName() == null || request.getFullName().trim().length() < 3) {
            throw new IllegalArgumentException("Full name must be at least 3 characters long");
        }

        // Validation: Email
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            throw new IllegalArgumentException("Valid email address is required");
        }
        if (staffRepository.existsByEmail(request.getEmail().trim())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }

        // Employee ID / Staff ID (auto-generated as EMP-XXXX if omitted)
        String empId = request.getEmployeeId() != null && !request.getEmployeeId().isBlank()
                ? request.getEmployeeId().trim().toUpperCase()
                : (request.getItNumber() != null && !request.getItNumber().isBlank()
                    ? request.getItNumber().trim().toUpperCase()
                    : null);

        if (empId == null) {
            int counter = 1001;
            while (staffRepository.existsByEmployeeId("EMP-" + counter)) {
                counter++;
            }
            empId = "EMP-" + counter;
        }

        while (staffRepository.existsByEmployeeId(empId)) {
            empId = "EMP-" + (int)(1000 + Math.random() * 9000);
        }

        // Username: user-provided or auto-generated
        String username = request.getUsername() != null && !request.getUsername().isBlank()
                ? request.getUsername().trim()
                : generateUsername(request.getFullName(), empId);

        if (!username.matches("^[a-zA-Z0-9_]{3,30}$")) {
            throw new IllegalArgumentException("Username must be between 3 and 30 characters (letters, numbers, underscores only)");
        }

        if (staffRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists: " + username);
        }

        // Password: user-provided or default to last 4 digits / default strong password
        String passSuffix = empId.replaceAll("[^0-9]", "");
        if (passSuffix.length() > 4) {
            passSuffix = passSuffix.substring(passSuffix.length() - 4);
        } else if (passSuffix.isEmpty()) {
            passSuffix = "1234";
        }
        String rawPassword = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword()
                : "Admin@" + passSuffix;

        if (request.getPassword() != null && !request.getPassword().isBlank() && request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        Staff staff = Staff.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim())
                .employeeId(empId)
                .role(request.getRole())
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        Staff saved = staffRepository.save(staff);

        // Instant dual-save into MongoDB mirror
        staffMirrorRepository.ifPresent(repo -> {
            try {
                repo.save(toStaffMirror(saved));
            } catch (Exception ignored) {}
        });

        auditLogService.log(performedBy, AuditAction.STAFF_CREATED, username,
                "Created staff: " + saved.getFullName() + " (" + saved.getUsername()
                        + ") with role " + saved.getRole());

        return StaffResponse.from(saved);
    }

    /** Get all staff members (with MongoDB mirror fallback) */
    @Transactional(readOnly = true)
    public List<StaffResponse> getAllStaff() {
        try {
            List<Staff> staffList = staffRepository.findAllByOrderByCreatedAtDesc();
            if (!staffList.isEmpty()) {
                return staffList.stream()
                        .map(StaffResponse::from)
                        .collect(Collectors.toList());
            }
        } catch (Exception ex) {}

        // Fallback to MongoDB mirror
        if (staffMirrorRepository.isPresent()) {
            var mirrors = staffMirrorRepository.get().findAll();
            if (!mirrors.isEmpty()) {
                return mirrors.stream()
                        .map(StaffResponse::fromMirror)
                        .collect(Collectors.toList());
            }
        }

        return List.of();
    }

    /** Get a single staff member by ID */
    @Transactional(readOnly = true)
    public StaffResponse getStaffById(Long id) {
        Staff staff = findStaffOrThrow(id);
        return StaffResponse.from(staff);
    }

    /**
     * Update staff details: Full Name, Username, Role, Email, and Password.
     */
    public StaffResponse updateStaff(Long id, StaffRequest request, String performedBy) {
        Staff staff = findStaffOrThrow(id);

        StringBuilder changeDesc = new StringBuilder("Updated " + staff.getUsername() + ": ");

        // 1. Update Full Name
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            staff.setFullName(request.getFullName().trim());
        }

        // 2. Update Username
        if (request.getUsername() != null && !request.getUsername().isBlank()
                && !staff.getUsername().equalsIgnoreCase(request.getUsername().trim())) {
            String newUsername = request.getUsername().trim();
            if (!newUsername.matches("^[a-zA-Z0-9_]{3,30}$")) {
                throw new IllegalArgumentException("Username must be between 3 and 30 characters (letters, numbers, underscores only)");
            }
            if (staffRepository.existsByUsername(newUsername)) {
                throw new IllegalArgumentException("Username already in use: " + newUsername);
            }
            changeDesc.append("username changed from ").append(staff.getUsername()).append(" to ").append(newUsername).append("; ");
            staff.setUsername(newUsername);
        }

        // 3. Update Email
        if (request.getEmail() != null && !staff.getEmail().equalsIgnoreCase(request.getEmail().trim())) {
            String newEmail = request.getEmail().trim();
            if (staffRepository.existsByEmail(newEmail)) {
                throw new IllegalArgumentException("Email already in use: " + newEmail);
            }
            changeDesc.append("email changed; ");
            staff.setEmail(newEmail);
        }

        // 4. Update Role
        if (request.getRole() != null && staff.getRole() != request.getRole()) {
            changeDesc.append("role changed from ").append(staff.getRole())
                    .append(" to ").append(request.getRole()).append("; ");
            staff.setRole(request.getRole());

            auditLogService.log(performedBy, AuditAction.STAFF_ROLE_CHANGED, staff.getUsername(),
                    "Role changed to " + request.getRole());
        }

        // 5. Update Password
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (request.getPassword().length() < 6) {
                throw new IllegalArgumentException("Password must be at least 6 characters long");
            }
            staff.setPassword(passwordEncoder.encode(request.getPassword()));
            changeDesc.append("password reset; ");

            auditLogService.log(performedBy, AuditAction.STAFF_PASSWORD_RESET, staff.getUsername(),
                    "Password was reset by " + performedBy);
        }

        staff.setUpdatedAt(LocalDateTime.now());
        Staff saved = staffRepository.save(staff);

        staffMirrorRepository.ifPresent(repo -> {
            try {
                repo.save(toStaffMirror(saved));
            } catch (Exception ignored) {}
        });

        auditLogService.log(performedBy, AuditAction.STAFF_UPDATED, staff.getUsername(),
                changeDesc.toString());

        return StaffResponse.from(saved);
    }

    /** Deactivate a staff member (soft delete — cannot log in) */
    public void deactivateStaff(Long id, String performedBy) {
        Staff staff = findStaffOrThrow(id);

        if (staff.getRole() == StaffRole.SUPER_ADMIN && staff.getUsername().equalsIgnoreCase("GunathilakaT1540")) {
            throw new IllegalArgumentException("Cannot deactivate the primary Super Admin account");
        }

        staff.setActive(false);
        staffRepository.save(staff);

        staffMirrorRepository.ifPresent(repo -> {
            try {
                repo.save(toStaffMirror(staff));
            } catch (Exception ignored) {}
        });

        auditLogService.log(performedBy, AuditAction.STAFF_DEACTIVATED, staff.getUsername(),
                "Deactivated staff: " + staff.getFullName() + " (" + staff.getUsername() + ")");
    }

    /** Re-activate a deactivated staff member */
    public void activateStaff(Long id, String performedBy) {
        Staff staff = findStaffOrThrow(id);
        staff.setActive(true);
        staffRepository.save(staff);

        staffMirrorRepository.ifPresent(repo -> {
            try {
                repo.save(toStaffMirror(staff));
            } catch (Exception ignored) {}
        });

        auditLogService.log(performedBy, AuditAction.STAFF_ACTIVATED, staff.getUsername(),
                "Activated staff: " + staff.getFullName() + " (" + staff.getUsername() + ")");
    }

    /** Permanently delete a staff member account */
    public void deleteStaff(Long id, String performedBy) {
        Staff staff = findStaffOrThrow(id);

        if (staff.getRole() == StaffRole.SUPER_ADMIN && staff.getUsername().equalsIgnoreCase("GunathilakaT1540")) {
            throw new IllegalArgumentException("Cannot delete the primary Super Admin account");
        }

        staffRepository.delete(staff);

        staffMirrorRepository.ifPresent(repo -> {
            try {
                repo.deleteById(String.valueOf(staff.getId()));
            } catch (Exception ignored) {}
        });

        auditLogService.log(performedBy, AuditAction.STAFF_DELETED, staff.getUsername(),
                "Permanently deleted staff account: " + staff.getFullName() + " (" + staff.getUsername() + ")");
    }

    public static com.sarasavipages.members.sync.document.StaffMirror toStaffMirror(Staff staff) {
        return com.sarasavipages.members.sync.document.StaffMirror.builder()
                .id(String.valueOf(staff.getId()))
                .username(staff.getUsername())
                .fullName(staff.getFullName())
                .email(staff.getEmail())
                .employeeId(staff.getEmployeeId())
                .itNumber(staff.getEmployeeId())
                .role(staff.getRole() != null ? staff.getRole().name() : "INVENTORY_ADMIN")
                .active(staff.isActive())
                .createdAt(staff.getCreatedAt())
                .updatedAt(staff.getUpdatedAt())
                .syncedAt(LocalDateTime.now())
                .build();
    }

    /** Record login timestamp in audit log */
    public void recordLogin(String username) {
        staffRepository.findByUsername(username).ifPresent(staff -> {
            staff.setLastLoginAt(LocalDateTime.now());
            staffRepository.save(staff);
        });

        auditLogService.log(username, AuditAction.STAFF_LOGIN, username,
                username + " logged in successfully");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Staff findStaffOrThrow(Long id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with id: " + id));
    }

    /**
     * Generates username as {LastName}{FirstInitial}{Code}.
     * Example: "Gunathilaka H.D.T.T." + "EMP-1001" → "GunathilakaT1001"
     */
    public static String generateUsername(String fullName, String employeeId) {
        String[] nameParts = fullName.trim().split("\\s+");
        String lastName = nameParts[0];
        // Get first letter of second name part (the initial after last name)
        String firstInitial = nameParts.length > 1
                ? String.valueOf(nameParts[1].charAt(0)).toUpperCase()
                : "";
        String cleanId = employeeId != null ? employeeId.replaceAll("[^0-9a-zA-Z]", "") : "1001";
        String suffix = cleanId.length() >= 4 ? cleanId.substring(cleanId.length() - 4) : cleanId;
        return lastName + firstInitial + suffix;
    }
}

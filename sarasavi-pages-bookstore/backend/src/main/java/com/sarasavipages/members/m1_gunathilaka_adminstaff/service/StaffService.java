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

    public StaffService(StaffRepository staffRepository, @Lazy PasswordEncoder passwordEncoder, AuditLogService auditLogService) {
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    // ── UserDetailsService (used by Spring Security) ─────────────────────────

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return staffRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Staff member not found with username: " + username));
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

        // IT Number (optional: auto-generated if omitted)
        String itNumber = request.getItNumber() != null && !request.getItNumber().isBlank()
                ? request.getItNumber().trim()
                : "IT25" + (int)(100000 + Math.random() * 900000);

        while (staffRepository.existsByItNumber(itNumber)) {
            itNumber = "IT25" + (int)(100000 + Math.random() * 900000);
        }

        // Username: user-provided or auto-generated
        String username = request.getUsername() != null && !request.getUsername().isBlank()
                ? request.getUsername().trim()
                : generateUsername(request.getFullName(), itNumber);

        if (!username.matches("^[a-zA-Z0-9_]{3,30}$")) {
            throw new IllegalArgumentException("Username must be between 3 and 30 characters (letters, numbers, underscores only)");
        }

        if (staffRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists: " + username);
        }

        // Password: user-provided or default to last 4 digits / default strong password
        String rawPassword = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword()
                : "Admin@" + itNumber.substring(itNumber.length() - 4);

        if (request.getPassword() != null && !request.getPassword().isBlank() && request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        Staff staff = Staff.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim())
                .itNumber(itNumber)
                .role(request.getRole())
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        Staff saved = staffRepository.save(staff);

        auditLogService.log(performedBy, AuditAction.STAFF_CREATED, username,
                "Created staff: " + saved.getFullName() + " (" + saved.getUsername()
                        + ") with role " + saved.getRole());

        return StaffResponse.from(saved);
    }

    /** Get all staff members */
    @Transactional(readOnly = true)
    public List<StaffResponse> getAllStaff() {
        return staffRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(StaffResponse::from)
                .collect(Collectors.toList());
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

        auditLogService.log(performedBy, AuditAction.STAFF_DEACTIVATED, staff.getUsername(),
                "Deactivated staff: " + staff.getFullName() + " (" + staff.getUsername() + ")");
    }

    /** Re-activate a deactivated staff member */
    public void activateStaff(Long id, String performedBy) {
        Staff staff = findStaffOrThrow(id);
        staff.setActive(true);
        staffRepository.save(staff);

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

        auditLogService.log(performedBy, AuditAction.STAFF_DELETED, staff.getUsername(),
                "Permanently deleted staff account: " + staff.getFullName() + " (" + staff.getUsername() + ")");
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
     * Generates username as {LastName}{FirstInitial}{Last4DigitsOfIT}.
     * Example: "Gunathilaka H.D.T.T." + "IT25101540" → "GunathilakaT1540"
     */
    public static String generateUsername(String fullName, String itNumber) {
        String[] nameParts = fullName.trim().split("\\s+");
        String lastName = nameParts[0];
        // Get first letter of second name part (the initial after last name)
        String firstInitial = nameParts.length > 1
                ? String.valueOf(nameParts[1].charAt(0)).toUpperCase()
                : "";
        String last4 = itNumber.substring(itNumber.length() - 4);
        return lastName + firstInitial + last4;
    }
}

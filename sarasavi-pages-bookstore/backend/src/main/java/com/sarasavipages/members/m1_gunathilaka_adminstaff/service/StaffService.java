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
     * Username is auto-generated from their name and IT number.
     * Default password = last 4 digits of IT number.
     */
    public StaffResponse createStaff(StaffRequest request, String performedBy) {
        // Validate uniqueness
        if (staffRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }
        if (staffRepository.existsByItNumber(request.getItNumber())) {
            throw new IllegalArgumentException("IT number already registered: " + request.getItNumber());
        }

        // Generate username: {LastName}{FirstInitialOfName}{Last4DigitsOfITNumber}
        String username = generateUsername(request.getFullName(), request.getItNumber());
        if (staffRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Generated username already exists: " + username);
        }

        // Default password = last 4 digits of IT number
        String rawPassword = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword()
                : request.getItNumber().substring(request.getItNumber().length() - 4);

        Staff staff = Staff.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .itNumber(request.getItNumber())
                .role(request.getRole())
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        Staff saved = staffRepository.save(staff);

        auditLogService.log(performedBy, AuditAction.STAFF_CREATED, username,
                "Created staff: " + saved.getFullName() + " (" + saved.getItNumber()
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
     * Update staff role and/or email.
     * Username and IT number cannot be changed after creation.
     */
    public StaffResponse updateStaff(Long id, StaffRequest request, String performedBy) {
        Staff staff = findStaffOrThrow(id);

        StringBuilder changeDesc = new StringBuilder("Updated " + staff.getUsername() + ": ");

        if (!staff.getEmail().equals(request.getEmail())) {
            if (staffRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already in use: " + request.getEmail());
            }
            changeDesc.append("email changed; ");
            staff.setEmail(request.getEmail());
        }

        if (staff.getRole() != request.getRole()) {
            changeDesc.append("role changed from ").append(staff.getRole())
                    .append(" to ").append(request.getRole()).append("; ");
            staff.setRole(request.getRole());

            auditLogService.log(performedBy, AuditAction.STAFF_ROLE_CHANGED, staff.getUsername(),
                    "Role changed to " + request.getRole());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            staff.setPassword(passwordEncoder.encode(request.getPassword()));
            changeDesc.append("password reset; ");

            auditLogService.log(performedBy, AuditAction.STAFF_PASSWORD_RESET, staff.getUsername(),
                    "Password was reset by " + performedBy);
        }

        staff.setFullName(request.getFullName());

        Staff saved = staffRepository.save(staff);

        auditLogService.log(performedBy, AuditAction.STAFF_UPDATED, staff.getUsername(),
                changeDesc.toString());

        return StaffResponse.from(saved);
    }

    /** Deactivate a staff member (soft delete — they cannot log in) */
    public void deactivateStaff(Long id, String performedBy) {
        Staff staff = findStaffOrThrow(id);

        if (staff.getRole() == StaffRole.SUPER_ADMIN) {
            throw new IllegalArgumentException("Cannot deactivate the Super Admin account");
        }

        staff.setActive(false);
        staffRepository.save(staff);

        auditLogService.log(performedBy, AuditAction.STAFF_DEACTIVATED, staff.getUsername(),
                "Deactivated staff: " + staff.getFullName() + " (" + staff.getItNumber() + ")");
    }

    /** Re-activate a deactivated staff member */
    public void activateStaff(Long id, String performedBy) {
        Staff staff = findStaffOrThrow(id);
        staff.setActive(true);
        staffRepository.save(staff);

        auditLogService.log(performedBy, AuditAction.STAFF_ACTIVATED, staff.getUsername(),
                "Activated staff: " + staff.getFullName());
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

package com.sarasavipages.members.m1_gunathilaka_adminstaff.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Staff entity – represents admin/staff accounts for the Sarasavi Pages backend.
 * Module: M1 – Admin & Staff Management
 * Owner: Gunathilaka H.D.T.T. (IT25101540)
 *
 * Pre-seeded accounts (see V1 migration):
 *   SUPER_ADMIN        → GunathilakaT1540 / 1540
 *   PAYMENT_ADMIN      → AnafS2345 / 2345
 *   CUSTOMER_SERVICE_ADMIN → ZeenC3342 / 3342
 *   INVENTORY_ADMIN    → DissanayakeD1062 / 1062
 *   ACCOUNT_ADMIN      → GayathmiR3013 / 3013
 *   ORDER_ADMIN        → DiyesL0263 / 0263
 */
@Entity
@Table(name = "staff")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Staff implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password; // BCrypt hashed

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, unique = true, length = 20)
    private String itNumber; // e.g. IT25101540

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StaffRole role;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime lastLoginAt;

    // ── Spring Security UserDetails ──────────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return active; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return active; }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

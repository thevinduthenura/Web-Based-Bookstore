package com.sarasavipages.members.m1_gunathilaka_adminstaff.dto;

import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.Staff;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.StaffRole;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO returned when fetching staff data. Never exposes the password.
 * Module: M1 – Admin & Staff Management
 * Owner: Gunathilaka H.D.T.T. (IT25101540)
 */
@Data
public class StaffResponse {

    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String itNumber;
    private String employeeId;
    private StaffRole role;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;

    /** Factory method — maps Staff entity to DTO */
    public static StaffResponse from(Staff staff) {
        StaffResponse dto = new StaffResponse();
        dto.setId(staff.getId());
        dto.setUsername(staff.getUsername());
        dto.setFullName(staff.getFullName());
        dto.setEmail(staff.getEmail());
        dto.setEmployeeId(staff.getEmployeeId());
        dto.setItNumber(staff.getEmployeeId());
        dto.setRole(staff.getRole());
        dto.setActive(staff.isActive());
        dto.setCreatedAt(staff.getCreatedAt());
        dto.setUpdatedAt(staff.getUpdatedAt());
        dto.setLastLoginAt(staff.getLastLoginAt());
        return dto;
    }

    public static StaffResponse fromMirror(com.sarasavipages.members.sync.document.StaffMirror mirror) {
        StaffResponse dto = new StaffResponse();
        try {
            dto.setId(Long.parseLong(mirror.getId()));
        } catch (Exception e) {
            dto.setId((long) Math.abs(mirror.getUsername().hashCode()));
        }
        dto.setUsername(mirror.getUsername());
        dto.setFullName(mirror.getFullName());
        dto.setEmail(mirror.getEmail());
        dto.setEmployeeId(mirror.getEmployeeId());
        dto.setItNumber(mirror.getEmployeeId());
        try {
            dto.setRole(StaffRole.valueOf(mirror.getRole()));
        } catch (Exception e) {
            dto.setRole(StaffRole.INVENTORY_ADMIN);
        }
        dto.setActive(mirror.isActive());
        dto.setCreatedAt(mirror.getCreatedAt());
        dto.setUpdatedAt(mirror.getUpdatedAt());
        return dto;
    }
}

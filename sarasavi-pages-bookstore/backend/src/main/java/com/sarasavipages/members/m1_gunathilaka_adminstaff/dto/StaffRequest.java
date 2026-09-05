package com.sarasavipages.members.m1_gunathilaka_adminstaff.dto;

import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.StaffRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * DTO for creating or updating a staff member.
 * Module: M1 – Admin & Staff Management
 * Owner: Gunathilaka H.D.T.T. (IT25101540)
 */
@Data
public class StaffRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "IT number is required")
    @Pattern(regexp = "IT\\d{8}", message = "IT number must be in format IT12345678")
    private String itNumber;

    @NotNull(message = "Role is required")
    private StaffRole role;

    /** Only used on create — if omitted on update, password is not changed */
    private String password;
}

package com.sarasavipages.members.m1_gunathilaka_adminstaff.dto;

import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.StaffRole;
import lombok.Builder;
import lombok.Data;

/**
 * Response returned after a successful login.
 * Module: M1 – Admin & Staff Management
 * Owner: Gunathilaka H.D.T.T. (IT25101540)
 */
@Data
@Builder
public class LoginResponse {

    private String token;
    private String tokenType;
    private Long expiresIn;     // milliseconds
    private Long staffId;
    private String username;
    private String fullName;
    private StaffRole role;
    /** Which dashboard path to redirect to after login */
    private String dashboardPath;
}

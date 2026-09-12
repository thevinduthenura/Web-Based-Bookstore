package com.sarasavipages.members.m1_gunathilaka_adminstaff.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Login request DTO.
 * Module: M1 – Admin & Staff Management
 * Owner: Gunathilaka H.D.T.T. (IT25101540)
 */
@Data
public class LoginRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}

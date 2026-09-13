package com.sarasavipages.members.m5_gayathmi_accounts.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String addressLine1;
    private String city;
    private String postalCode;
    private String country;
}

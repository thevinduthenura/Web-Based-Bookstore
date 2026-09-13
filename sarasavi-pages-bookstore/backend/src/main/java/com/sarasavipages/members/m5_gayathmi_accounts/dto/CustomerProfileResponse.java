package com.sarasavipages.members.m5_gayathmi_accounts.dto;

import com.sarasavipages.members.m5_gayathmi_accounts.entity.AccountStatus;
import com.sarasavipages.members.m5_gayathmi_accounts.entity.CustomerProfile;
import com.sarasavipages.members.m5_gayathmi_accounts.entity.LoyaltyTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfileResponse {
    private Long id;
    private String customerId;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String addressLine1;
    private String city;
    private String postalCode;
    private String country;
    private AccountStatus status;
    private LoyaltyTier loyaltyTier;
    private int loyaltyPoints;
    private boolean kycVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CustomerProfileResponse fromEntity(CustomerProfile profile) {
        return CustomerProfileResponse.builder()
                .id(profile.getId())
                .customerId(profile.getCustomerId())
                .email(profile.getEmail())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .phone(profile.getPhone())
                .addressLine1(profile.getAddressLine1())
                .city(profile.getCity())
                .postalCode(profile.getPostalCode())
                .country(profile.getCountry())
                .status(profile.getStatus())
                .loyaltyTier(profile.getLoyaltyTier())
                .loyaltyPoints(profile.getLoyaltyPoints())
                .kycVerified(profile.isKycVerified())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}

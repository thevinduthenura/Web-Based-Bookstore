package com.sarasavipages.members.m5_gayathmi_accounts.service;

import com.sarasavipages.members.m5_gayathmi_accounts.dto.CustomerProfileResponse;
import com.sarasavipages.members.m5_gayathmi_accounts.dto.CustomerRegistrationRequest;
import com.sarasavipages.members.m5_gayathmi_accounts.dto.ProfileUpdateRequest;
import com.sarasavipages.members.m5_gayathmi_accounts.entity.AccountStatus;
import com.sarasavipages.members.m5_gayathmi_accounts.entity.CustomerProfile;
import com.sarasavipages.members.m5_gayathmi_accounts.entity.LoyaltyTier;
import com.sarasavipages.members.m5_gayathmi_accounts.repository.CustomerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerAccountServiceImpl implements CustomerAccountService {

    private final CustomerProfileRepository profileRepository;

    @Override
    @Transactional
    public CustomerProfileResponse registerCustomer(CustomerRegistrationRequest req) {
        // UC-UAP-01: Duplicate email check
        if (profileRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new IllegalArgumentException("An account with email " + req.getEmail() + " already exists.");
        }

        String customerId = "CUST-" + (1000 + profileRepository.count() + 1);

        CustomerProfile profile = CustomerProfile.builder()
                .customerId(customerId)
                .email(req.getEmail().trim().toLowerCase())
                .firstName(req.getFirstName().trim())
                .lastName(req.getLastName().trim())
                .phone(req.getPhone())
                .addressLine1(req.getAddressLine1())
                .city(req.getCity())
                .postalCode(req.getPostalCode())
                .country(req.getCountry() != null ? req.getCountry() : "Sri Lanka")
                .status(AccountStatus.ACTIVE)
                .loyaltyTier(LoyaltyTier.BRONZE)
                .loyaltyPoints(50) // 50 welcome points
                .kycVerified(false)
                .build();

        CustomerProfile saved = profileRepository.save(profile);
        return CustomerProfileResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerProfileResponse getProfileByCustomerId(String customerId) {
        CustomerProfile profile = profileRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer profile not found for ID: " + customerId));
        return CustomerProfileResponse.fromEntity(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerProfileResponse getProfileByEmail(String email) {
        CustomerProfile profile = profileRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Customer profile not found for email: " + email));
        return CustomerProfileResponse.fromEntity(profile);
    }

    @Override
    @Transactional
    public CustomerProfileResponse updateProfile(String customerId, ProfileUpdateRequest req) {
        CustomerProfile profile = profileRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer profile not found for ID: " + customerId));

        if (req.getFirstName() != null) profile.setFirstName(req.getFirstName().trim());
        if (req.getLastName() != null) profile.setLastName(req.getLastName().trim());
        if (req.getPhone() != null) profile.setPhone(req.getPhone().trim());
        if (req.getAddressLine1() != null) profile.setAddressLine1(req.getAddressLine1().trim());
        if (req.getCity() != null) profile.setCity(req.getCity().trim());
        if (req.getPostalCode() != null) profile.setPostalCode(req.getPostalCode().trim());
        if (req.getCountry() != null) profile.setCountry(req.getCountry().trim());

        CustomerProfile updated = profileRepository.save(profile);
        return CustomerProfileResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public CustomerProfileResponse updateAccountStatus(String customerId, AccountStatus status) {
        CustomerProfile profile = profileRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer profile not found for ID: " + customerId));
        profile.setStatus(status);
        CustomerProfile updated = profileRepository.save(profile);
        return CustomerProfileResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public CustomerProfileResponse verifyKyc(String customerId, boolean verified) {
        CustomerProfile profile = profileRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer profile not found for ID: " + customerId));
        profile.setKycVerified(verified);
        CustomerProfile updated = profileRepository.save(profile);
        return CustomerProfileResponse.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerProfileResponse> getAllCustomers(AccountStatus status, String query) {
        List<CustomerProfile> list;
        if (query != null && !query.isBlank()) {
            list = profileRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    query.trim(), query.trim(), query.trim());
        } else if (status != null) {
            list = profileRepository.findByStatus(status);
        } else {
            list = profileRepository.findAll();
        }
        return list.stream().map(CustomerProfileResponse::fromEntity).collect(Collectors.toList());
    }
}

package com.sarasavipages.members.m5_gayathmi_accounts.service;

import com.sarasavipages.members.m5_gayathmi_accounts.dto.CustomerProfileResponse;
import com.sarasavipages.members.m5_gayathmi_accounts.dto.CustomerRegistrationRequest;
import com.sarasavipages.members.m5_gayathmi_accounts.dto.ProfileUpdateRequest;
import com.sarasavipages.members.m5_gayathmi_accounts.entity.AccountStatus;

import java.util.List;

public interface CustomerAccountService {

    CustomerProfileResponse registerCustomer(CustomerRegistrationRequest request);

    CustomerProfileResponse getProfileByCustomerId(String customerId);

    CustomerProfileResponse getProfileByEmail(String email);

    CustomerProfileResponse updateProfile(String customerId, ProfileUpdateRequest request);

    CustomerProfileResponse updateAccountStatus(String customerId, AccountStatus status);

    CustomerProfileResponse verifyKyc(String customerId, boolean verified);

    List<CustomerProfileResponse> getAllCustomers(AccountStatus status, String query);
}

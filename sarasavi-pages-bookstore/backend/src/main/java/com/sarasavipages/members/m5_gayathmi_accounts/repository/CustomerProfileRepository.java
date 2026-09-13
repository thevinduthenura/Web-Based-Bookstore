package com.sarasavipages.members.m5_gayathmi_accounts.repository;

import com.sarasavipages.members.m5_gayathmi_accounts.entity.AccountStatus;
import com.sarasavipages.members.m5_gayathmi_accounts.entity.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, Long> {

    Optional<CustomerProfile> findByCustomerId(String customerId);

    Optional<CustomerProfile> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByCustomerId(String customerId);

    List<CustomerProfile> findByStatus(AccountStatus status);

    List<CustomerProfile> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String firstName, String lastName, String email);
}

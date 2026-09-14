package com.sarasavipages.members.m1_gunathilaka_adminstaff.repository;

import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.Staff;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.StaffRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Staff entity.
 * Module: M1 – Admin & Staff Management
 * Owner: Gunathilaka H.D.T.T. (IT25101540)
 */
@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {

    Optional<Staff> findByUsername(String username);

    Optional<Staff> findByEmail(String email);

    Optional<Staff> findByItNumber(String itNumber);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByItNumber(String itNumber);

    List<Staff> findAllByOrderByCreatedAtDesc();

    List<Staff> findByRole(StaffRole role);

    List<Staff> findByActive(boolean active);
}

package com.sarasavipages.members.m1_gunathilaka_adminstaff.repository;

import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.AuditLog;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for AuditLog entity.
 * Module: M1 – Admin & Staff Management
 * Owner: Gunathilaka H.D.T.T. (IT25101540)
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);

    List<AuditLog> findByPerformedByOrderByTimestampDesc(String performedBy);

    List<AuditLog> findByTargetUsernameOrderByTimestampDesc(String targetUsername);

    List<AuditLog> findByAction(AuditAction action);

    List<AuditLog> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime from, LocalDateTime to);
}

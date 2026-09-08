package com.sarasavipages.members.m1_gunathilaka_adminstaff.service;

import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.AuditAction;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.entity.AuditLog;
import com.sarasavipages.members.m1_gunathilaka_adminstaff.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for recording and retrieving audit log entries.
 * Module: M1 – Admin & Staff Management
 * Owner: Gunathilaka H.D.T.T. (IT25101540)
 */
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Record an audit event.
     * @param performedBy  Username of the admin who did the action
     * @param action       The action type
     * @param targetUsername The staff member affected (null if not applicable)
     * @param description  Human-readable description
     */
    public void log(String performedBy, AuditAction action,
                    String targetUsername, String description) {
        AuditLog entry = AuditLog.builder()
                .performedBy(performedBy)
                .action(action)
                .targetUsername(targetUsername)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(entry);
    }

    public Page<AuditLog> getAll(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }

    public List<AuditLog> getByPerformer(String username) {
        return auditLogRepository.findByPerformedByOrderByTimestampDesc(username);
    }

    public List<AuditLog> getByTarget(String username) {
        return auditLogRepository.findByTargetUsernameOrderByTimestampDesc(username);
    }

    public List<AuditLog> getByDateRange(LocalDateTime from, LocalDateTime to) {
        return auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(from, to);
    }
}

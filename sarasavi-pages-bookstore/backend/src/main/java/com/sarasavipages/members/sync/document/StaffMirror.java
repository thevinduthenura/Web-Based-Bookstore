package com.sarasavipages.members.sync.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB mirror document for the MSSQL 'staff' table.
 * Tier 2: Read-fallback replica.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "staff_mirror")
public class StaffMirror {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    private String fullName;

    @Indexed
    private String email;

    private String employeeId;

    private String itNumber;

    public String getEmployeeId() {
        return employeeId != null ? employeeId : itNumber;
    }

    public String getItNumber() {
        return employeeId != null ? employeeId : itNumber;
    }

    @Indexed
    private String role;

    private boolean active;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime syncedAt;
}

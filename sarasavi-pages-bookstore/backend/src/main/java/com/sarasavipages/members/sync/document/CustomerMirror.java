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
 * MongoDB mirror document for the MSSQL 'customer_profiles' table.
 * Tier 2: Read-fallback replica.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "customers_mirror")
public class CustomerMirror {

    @Id
    private String id; // Matches customerId e.g. CUST-1001

    @Indexed
    private String email;

    private String firstName;
    private String lastName;
    private String phone;
    private String addressLine1;
    private String city;
    private String postalCode;
    private String country;

    @Indexed
    private String status;

    private String loyaltyTier;
    private int loyaltyPoints;
    private boolean kycVerified;

    private LocalDateTime createdAt;
    private LocalDateTime syncedAt;
}

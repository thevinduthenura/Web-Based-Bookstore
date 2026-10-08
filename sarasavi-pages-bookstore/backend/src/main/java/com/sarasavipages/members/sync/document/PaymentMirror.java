package com.sarasavipages.members.sync.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * MongoDB mirror document for the MSSQL 'payments' table.
 * Tier 2: Read-fallback / disaster recovery replica and bi-directional sync target.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments_mirror")
public class PaymentMirror {

    @Id
    private String id;

    private Long orderId;
    private Long customerId;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private String status;

    @Indexed(unique = true)
    private String transactionReference;

    private String gatewayMessage;
    private String invoiceNumber;
    private LocalDateTime createdAt;
    private LocalDateTime syncedAt;
}

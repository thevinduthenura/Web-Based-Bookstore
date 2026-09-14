package com.sarasavipages.members.m3_zeen.dto;

import com.sarasavipages.members.m3_zeen.entity.Ticket;
import com.sarasavipages.members.m3_zeen.entity.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketResponse {

    private Long id;
    private String customerName;
    private String contactNumber;
    private String subject;
    private String description;
    private TicketStatus status;
    private String resolutionDetails;
    private String resolvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    public static TicketResponse from(Ticket t) {
        return TicketResponse.builder()
                .id(t.getId())
                .customerName(t.getCustomerName())
                .contactNumber(t.getContactNumber())
                .subject(t.getSubject())
                .description(t.getDescription())
                .status(t.getStatus())
                .resolutionDetails(t.getResolutionDetails())
                .resolvedBy(t.getResolvedBy())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .resolvedAt(t.getResolvedAt())
                .build();
    }
}
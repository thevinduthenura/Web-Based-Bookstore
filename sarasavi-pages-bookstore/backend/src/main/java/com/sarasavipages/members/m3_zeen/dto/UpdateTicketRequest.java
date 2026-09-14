package com.sarasavipages.members.m3_zeen.dto;

import com.sarasavipages.members.m3_zeen.entity.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTicketRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    @NotBlank(message = "Resolution details are required")
    private String resolutionDetails;
}
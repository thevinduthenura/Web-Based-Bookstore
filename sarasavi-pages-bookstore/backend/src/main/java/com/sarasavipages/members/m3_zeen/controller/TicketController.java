package com.sarasavipages.members.m3_zeen.controller;

import com.sarasavipages.common.ApiResponse;
import com.sarasavipages.members.m3_zeen.dto.CreateTicketRequest;
import com.sarasavipages.members.m3_zeen.dto.TicketResponse;
import com.sarasavipages.members.m3_zeen.dto.UpdateTicketRequest;
import com.sarasavipages.members.m3_zeen.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    //customer-facing
    @PostMapping("/tickets")
    public ApiResponse<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            Authentication authentication) {

        Long customerId = 0L;          // TODO: pull real customer id from principal
        String customerName = authentication.getName();

        TicketResponse response = ticketService.createTicket(request, customerId, customerName);
        return ApiResponse.ok("Ticket created successfully", response);
    }

    //staff-only
    @GetMapping("/customer-service/tickets")
    public ApiResponse<List<TicketResponse>> getAllTickets() {
        return ApiResponse.ok(ticketService.getAllTickets());
    }

    @GetMapping("/customer-service/tickets/{id}")
    public ApiResponse<TicketResponse> getTicket(@PathVariable Long id) {
        return ApiResponse.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/customer-service/tickets/{id}")
    public ApiResponse<TicketResponse> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketRequest request,
            Authentication authentication) {

        String officerUsername = authentication.getName();
        TicketResponse response = ticketService.updateTicket(id, request, officerUsername);
        return ApiResponse.ok("Ticket updated successfully", response);
    }
}
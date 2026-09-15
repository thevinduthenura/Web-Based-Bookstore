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

/**
 * REST Controller for Customer Support Tickets & Helpdesk Operations
 * Module: M3 – Customer Service & Tickets
 * Owner: ffZeen A.C. (IT25103342)
 */
@RestController
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // Customer-facing ticket creation endpoint
    @PostMapping("/tickets")
    public ApiResponse<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            Authentication authentication) {

        Long customerId = 0L;
        String customerName = (authentication != null && authentication.getName() != null)
                ? authentication.getName()
                : "Customer (Online)";

        TicketResponse response = ticketService.createTicket(request, customerId, customerName);
        return ApiResponse.ok("Ticket created successfully", response);
    }

    // Staff-only: Get all tickets
    @GetMapping("/customer-service/tickets")
    public ApiResponse<List<TicketResponse>> getAllTickets() {
        return ApiResponse.ok(ticketService.getAllTickets());
    }

    // Staff-only: Get single ticket by ID
    @GetMapping("/customer-service/tickets/{id}")
    public ApiResponse<TicketResponse> getTicket(@PathVariable Long id) {
        return ApiResponse.ok(ticketService.getTicketById(id));
    }

    // Staff-only: Update status and add resolution details
    @PutMapping("/customer-service/tickets/{id}")
    public ApiResponse<TicketResponse> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketRequest request,
            Authentication authentication) {

        String officerUsername = (authentication != null && authentication.getName() != null)
                ? authentication.getName()
                : "zeen.admin";

        TicketResponse response = ticketService.updateTicket(id, request, officerUsername);
        return ApiResponse.ok("Ticket updated successfully", response);
    }

    // Staff-only: Delete ticket by ID
    @DeleteMapping("/customer-service/tickets/{id}")
    public ApiResponse<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ApiResponse.ok("Ticket deleted successfully", null);
    }
}
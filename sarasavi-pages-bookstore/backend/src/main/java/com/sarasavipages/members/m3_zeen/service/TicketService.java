package com.sarasavipages.members.m3_zeen.service;

import com.sarasavipages.members.m3_zeen.dto.CreateTicketRequest;
import com.sarasavipages.members.m3_zeen.dto.TicketResponse;
import com.sarasavipages.members.m3_zeen.dto.UpdateTicketRequest;
import com.sarasavipages.members.m3_zeen.entity.Ticket;
import com.sarasavipages.members.m3_zeen.entity.TicketStatus;
import com.sarasavipages.members.m3_zeen.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;

    //time period still not decided, so i set it to 30 days
    private static final long RETENTION_DAYS = 30;

    //Create Complaint Ticket
    public TicketResponse createTicket(CreateTicketRequest request, Long customerId, String customerName) {
        Ticket ticket = Ticket.builder()
                .customerId(customerId)
                .customerName(customerName)
                .subject(request.getSubject())
                .description(request.getDescription())
                .contactNumber(request.getContactNumber())
                .status(TicketStatus.OPEN)
                .build();

        Ticket saved = ticketRepository.save(ticket);

        //notify customer
        return TicketResponse.from(saved);
    }

    //Update Complaint Ticket
    public TicketResponse updateTicket(Long ticketId, UpdateTicketRequest request, String officerUsername) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

        ticket.setStatus(request.getStatus());
        ticket.setResolutionDetails(request.getResolutionDetails());
        ticket.setResolvedBy(officerUsername);

        if (request.getStatus() == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        } else {
            // status changed back to non-Resolved cancels any pending deletion
            ticket.setResolvedAt(null);
        }

        Ticket updated = ticketRepository.save(ticket);
        return TicketResponse.from(updated);
    }

    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(TicketResponse::from)
                .toList();
    }

    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));
        return TicketResponse.from(ticket);
    }

    // Delete Ticket
    public void purgeOldResolvedTickets() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(RETENTION_DAYS);
        List<Ticket> toDelete = ticketRepository
                .findByStatusAndResolvedAtBefore(TicketStatus.RESOLVED, cutoff);

        toDelete.forEach(t -> {
            ticketRepository.delete(t);
        });
    }
}
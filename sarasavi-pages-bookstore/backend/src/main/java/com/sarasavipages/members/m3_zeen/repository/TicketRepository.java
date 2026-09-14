package com.sarasavipages.members.m3_zeen.repository;

import com.sarasavipages.members.m3_zeen.entity.Ticket;
import com.sarasavipages.members.m3_zeen.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCustomerId(Long customerId);

    List<Ticket> findByStatus(TicketStatus status);

    // Used to find Resolved tickets
    // old enough to be purged
    List<Ticket> findByStatusAndResolvedAtBefore(TicketStatus status, LocalDateTime cutoff);
}
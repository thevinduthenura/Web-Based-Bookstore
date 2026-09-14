package com.sarasavipages.members.m3_zeen.scheduler;

import com.sarasavipages.members.m3_zeen.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TicketCleanupScheduler {

    private final TicketService ticketService;

    // Runs once a day at 2 AM
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupResolvedTickets() {
        ticketService.purgeOldResolvedTickets();
    }
}
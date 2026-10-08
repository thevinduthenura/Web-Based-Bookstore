package com.sarasavipages.members.sync.controller;

import com.sarasavipages.members.sync.repository.*;
import com.sarasavipages.members.sync.scheduler.BackupScheduler;
import com.sarasavipages.members.sync.scheduler.SyncScheduler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Admin-only REST endpoints for the data sync and backup layer.
 * Base path: /api/admin/data
 */
@RestController
@RequestMapping("/admin/data")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PAYMENT_ADMIN', 'INVENTORY_ADMIN', 'ACCOUNT_ADMIN')")
@Tag(name = "Admin – Data Management", description = "MongoDB mirror status, bidirectional sync and JSON backup management")
public class DataAdminController {

    private final BackupScheduler backupScheduler;
    private final Optional<SyncScheduler> syncScheduler;
    private final Optional<BookMirrorRepository> bookMirrorRepository;
    private final Optional<OrderMirrorRepository> orderMirrorRepository;
    private final Optional<StaffMirrorRepository> staffMirrorRepository;
    private final Optional<CustomerMirrorRepository> customerMirrorRepository;
    private final Optional<InventoryMirrorRepository> inventoryMirrorRepository;
    private final Optional<PaymentMirrorRepository> paymentMirrorRepository;

    @Operation(summary = "Trigger an immediate JSON backup of all MSSQL tables")
    @PostMapping("/backup/trigger")
    public ResponseEntity<Map<String, Object>> triggerBackup() {
        Map<String, Object> result = backupScheduler.triggerManualBackup();
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Pull all records added or updated in MongoDB Atlas (Vercel) into MSSQL primary database")
    @PostMapping("/sync/pull")
    public ResponseEntity<Map<String, Object>> pullFromMongo() {
        if (syncScheduler.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "status", "SKIPPED",
                "message", "SyncScheduler is not active (sync.enabled=false)"
            ));
        }
        Map<String, Object> result = syncScheduler.get().pullAllFromMongo();
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Push all primary MSSQL records to MongoDB Atlas mirror collections")
    @PostMapping("/sync/push")
    public ResponseEntity<Map<String, Object>> pushToMongo() {
        if (syncScheduler.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "status", "SKIPPED",
                "message", "SyncScheduler is not active (sync.enabled=false)"
            ));
        }
        Map<String, Object> result = syncScheduler.get().pushAllToMongo();
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Run full two-way sync: Pulls cloud data to MSSQL, then pushes MSSQL updates to MongoDB")
    @PostMapping("/sync/bidirectional")
    public ResponseEntity<Map<String, Object>> runBidirectionalSync() {
        if (syncScheduler.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "status", "SKIPPED",
                "message", "SyncScheduler is not active"
            ));
        }
        Map<String, Object> pullResult = syncScheduler.get().pullAllFromMongo();
        syncScheduler.get().pushAllToMongo();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "SUCCESS");
        res.put("message", "Bidirectional sync completed: MSSQL updated from MongoDB & MongoDB mirror refreshed.");
        res.put("pullDetails", pullResult);
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Get MongoDB mirror document counts for all 6 tiers")
    @GetMapping("/mirror/status")
    public ResponseEntity<Map<String, Object>> mirrorStatus() {
        if (bookMirrorRepository.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "status", "MongoDB mirror is not active (running in H2 or sync disabled)",
                "books_mirror", 0,
                "orders_mirror", 0,
                "staff_mirror", 0,
                "customers_mirror", 0,
                "inventory_mirror", 0,
                "payments_mirror", 0
            ));
        }

        Map<String, Object> counts = new LinkedHashMap<>();
        counts.put("status", "ACTIVE");
        counts.put("books_mirror", bookMirrorRepository.map(r -> r.count()).orElse(0L));
        counts.put("orders_mirror", orderMirrorRepository.map(r -> r.count()).orElse(0L));
        counts.put("staff_mirror", staffMirrorRepository.map(r -> r.count()).orElse(0L));
        counts.put("customers_mirror", customerMirrorRepository.map(r -> r.count()).orElse(0L));
        counts.put("inventory_mirror", inventoryMirrorRepository.map(r -> r.count()).orElse(0L));
        counts.put("payments_mirror", paymentMirrorRepository.map(r -> r.count()).orElse(0L));
        return ResponseEntity.ok(counts);
    }

    @Operation(summary = "Flush (wipe) all MongoDB mirror collections — forces a full re-sync on next scheduler run")
    @DeleteMapping("/mirror/flush")
    public ResponseEntity<Map<String, Object>> flushMirror() {
        if (bookMirrorRepository.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "status", "skipped",
                "message", "MongoDB mirror is not active in current profile."
            ));
        }

        long booksDeleted = bookMirrorRepository.map(r -> { long c = r.count(); r.deleteAll(); return c; }).orElse(0L);
        long ordersDeleted = orderMirrorRepository.map(r -> { long c = r.count(); r.deleteAll(); return c; }).orElse(0L);
        long staffDeleted = staffMirrorRepository.map(r -> { long c = r.count(); r.deleteAll(); return c; }).orElse(0L);
        long customersDeleted = customerMirrorRepository.map(r -> { long c = r.count(); r.deleteAll(); return c; }).orElse(0L);
        long inventoryDeleted = inventoryMirrorRepository.map(r -> { long c = r.count(); r.deleteAll(); return c; }).orElse(0L);
        long paymentsDeleted = paymentMirrorRepository.map(r -> { long c = r.count(); r.deleteAll(); return c; }).orElse(0L);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "flushed");
        res.put("booksDeleted", booksDeleted);
        res.put("ordersDeleted", ordersDeleted);
        res.put("staffDeleted", staffDeleted);
        res.put("customersDeleted", customersDeleted);
        res.put("inventoryDeleted", inventoryDeleted);
        res.put("paymentsDeleted", paymentsDeleted);
        res.put("message", "MongoDB mirrors cleared. Re-sync will run on next scheduled interval.");
        return ResponseEntity.ok(res);
    }
}

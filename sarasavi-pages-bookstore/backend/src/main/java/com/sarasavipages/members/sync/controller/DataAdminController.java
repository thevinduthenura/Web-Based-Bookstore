package com.sarasavipages.members.sync.controller;

import com.sarasavipages.members.sync.repository.*;
import com.sarasavipages.members.sync.scheduler.BackupScheduler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Admin-only REST endpoints for the data sync and backup layer.
 * Base path: /api/admin/data
 */
@RestController
@RequestMapping("/admin/data")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
@Tag(name = "Admin – Data Management", description = "MongoDB mirror status and JSON backup management")
public class DataAdminController {

    private final BackupScheduler backupScheduler;
    private final java.util.Optional<BookMirrorRepository> bookMirrorRepository;
    private final java.util.Optional<OrderMirrorRepository> orderMirrorRepository;
    private final java.util.Optional<StaffMirrorRepository> staffMirrorRepository;
    private final java.util.Optional<CustomerMirrorRepository> customerMirrorRepository;
    private final java.util.Optional<InventoryMirrorRepository> inventoryMirrorRepository;

    @Operation(summary = "Trigger an immediate JSON backup of all MSSQL tables")
    @PostMapping("/backup/trigger")
    public ResponseEntity<Map<String, Object>> triggerBackup() {
        Map<String, Object> result = backupScheduler.triggerManualBackup();
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get MongoDB mirror document counts for all 5 tiers")
    @GetMapping("/mirror/status")
    public ResponseEntity<Map<String, Object>> mirrorStatus() {
        if (bookMirrorRepository.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "status", "MongoDB mirror is not active (running in H2 or sync disabled)",
                "books_mirror", 0,
                "orders_mirror", 0,
                "staff_mirror", 0,
                "customers_mirror", 0,
                "inventory_mirror", 0
            ));
        }

        Map<String, Object> counts = new LinkedHashMap<>();
        counts.put("status", "ACTIVE");
        counts.put("books_mirror", bookMirrorRepository.map(r -> r.count()).orElse(0L));
        counts.put("orders_mirror", orderMirrorRepository.map(r -> r.count()).orElse(0L));
        counts.put("staff_mirror", staffMirrorRepository.map(r -> r.count()).orElse(0L));
        counts.put("customers_mirror", customerMirrorRepository.map(r -> r.count()).orElse(0L));
        counts.put("inventory_mirror", inventoryMirrorRepository.map(r -> r.count()).orElse(0L));
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

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "flushed");
        res.put("booksDeleted", booksDeleted);
        res.put("ordersDeleted", ordersDeleted);
        res.put("staffDeleted", staffDeleted);
        res.put("customersDeleted", customersDeleted);
        res.put("inventoryDeleted", inventoryDeleted);
        res.put("message", "MongoDB mirrors cleared. Re-sync will run on next scheduled interval.");
        return ResponseEntity.ok(res);
    }
}

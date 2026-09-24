package com.sarasavipages.members.sync.controller;

import com.sarasavipages.members.sync.repository.BookMirrorRepository;
import com.sarasavipages.members.sync.repository.OrderMirrorRepository;
import com.sarasavipages.members.sync.scheduler.BackupScheduler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin-only REST endpoints for the data sync and backup layer.
 *
 * Base path: /api/admin/data
 *
 * Endpoints:
 *   POST /backup/trigger           — run manual JSON backup right now
 *   GET  /mirror/books/count       — how many docs are in books_mirror
 *   GET  /mirror/orders/count      — how many docs are in orders_mirror
 *   DELETE /mirror/flush           — wipe all mirror collections (useful for full re-sync)
 */
@RestController
@RequestMapping("/admin/data")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin – Data Management", description = "MongoDB mirror status and JSON backup management")
public class DataAdminController {

    private final BackupScheduler backupScheduler;
    private final java.util.Optional<BookMirrorRepository> bookMirrorRepository;
    private final java.util.Optional<OrderMirrorRepository> orderMirrorRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // Backup endpoints
    // ─────────────────────────────────────────────────────────────────────────

    @Operation(summary = "Trigger an immediate JSON backup of all MSSQL tables")
    @PostMapping("/backup/trigger")
    public ResponseEntity<Map<String, Object>> triggerBackup() {
        Map<String, Object> result = backupScheduler.triggerManualBackup();
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mirror status endpoints
    // ─────────────────────────────────────────────────────────────────────────

    @Operation(summary = "Get MongoDB mirror document counts")
    @GetMapping("/mirror/status")
    public ResponseEntity<Map<String, Object>> mirrorStatus() {
        if (bookMirrorRepository.isEmpty() || orderMirrorRepository.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "status", "MongoDB mirror is not active (running in H2 or sync disabled)",
                "books_mirror", 0,
                "orders_mirror", 0
            ));
        }
        return ResponseEntity.ok(Map.of(
            "books_mirror",  bookMirrorRepository.get().count(),
            "orders_mirror", orderMirrorRepository.get().count()
        ));
    }

    @Operation(summary = "Flush (wipe) all MongoDB mirror collections — forces a full re-sync on next scheduler run")
    @DeleteMapping("/mirror/flush")
    public ResponseEntity<Map<String, String>> flushMirror() {
        if (bookMirrorRepository.isEmpty() || orderMirrorRepository.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "status", "skipped",
                "message", "MongoDB mirror is not active in current profile."
            ));
        }
        long booksDeleted  = bookMirrorRepository.get().count();
        long ordersDeleted = orderMirrorRepository.get().count();
        bookMirrorRepository.get().deleteAll();
        orderMirrorRepository.get().deleteAll();
        return ResponseEntity.ok(Map.of(
            "status",         "flushed",
            "booksDeleted",   String.valueOf(booksDeleted),
            "ordersDeleted",  String.valueOf(ordersDeleted),
            "message",        "MongoDB mirror cleared. Re-sync will run on next scheduled interval."
        ));
    }
}

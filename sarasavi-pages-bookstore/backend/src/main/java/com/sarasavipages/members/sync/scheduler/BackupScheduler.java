package com.sarasavipages.members.sync.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sarasavipages.members.m6_diyes_orders.entity.Book;
import com.sarasavipages.members.m6_diyes_orders.entity.Cart;
import com.sarasavipages.members.m6_diyes_orders.repository.BookRepository;
import com.sarasavipages.members.m6_diyes_orders.repository.CartRepository;
import com.sarasavipages.members.m4_dissanayake_inventory.entity.InventoryItem;
import com.sarasavipages.members.m4_dissanayake_inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                 MSSQL → JSON File Backup Scheduler                  │
 * │  Tier 1 (MSSQL) ──[daily 02:00 AM]──► Tier 3 (/backups/*.json)    │
 * │                                                                     │
 * │  Output structure:                                                  │
 * │    /backups/                                                        │
 * │      └── 2026-09-24/                                               │
 * │            ├── books.json                                          │
 * │            ├── carts.json                                          │
 * │            ├── inventory.json                                      │
 * │            └── manifest.json                                       │
 * │                                                                     │
 * │  Old backup folders are deleted after 'backup.retention-days'       │
 * └─────────────────────────────────────────────────────────────────────┘
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BackupScheduler {

    private final BookRepository      bookRepository;
    private final CartRepository      cartRepository;
    private final InventoryRepository inventoryRepository;

    @Value("${backup.directory:./backups}")
    private String backupDirectory;

    @Value("${backup.retention-days:30}")
    private int retentionDays;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // ─────────────────────────────────────────────────────────────────────────
    // Main backup job — cron via property or default "0 0 2 * * ?" (02:00 AM)
    // Can be triggered manually via the /api/admin/backup/trigger endpoint.
    // ─────────────────────────────────────────────────────────────────────────
    @Scheduled(cron = "${backup.cron:0 0 2 * * ?}")
    public void runDailyBackup() {
        String dateLabel = LocalDate.now().format(DATE_FMT);
        Path backupDir   = Paths.get(backupDirectory, dateLabel);

        log.info("[BackupScheduler] ▶ Starting daily backup → {}", backupDir.toAbsolutePath());

        try {
            Files.createDirectories(backupDir);

            ObjectMapper mapper = buildMapper();

            // ── Export each table ─────────────────────────────────────────
            int bookCount  = exportTable(mapper, backupDir, "books",     bookRepository.findAll());
            int cartCount  = exportTable(mapper, backupDir, "carts",     cartRepository.findAll());
            int invCount   = exportTable(mapper, backupDir, "inventory", inventoryRepository.findAll());

            // ── Write manifest ────────────────────────────────────────────
            writeManifest(mapper, backupDir, Map.of(
                "exportedAt",    LocalDateTime.now().toString(),
                "backupDate",    dateLabel,
                "tables",        List.of(
                    Map.of("name", "books",     "records", bookCount),
                    Map.of("name", "carts",     "records", cartCount),
                    Map.of("name", "inventory", "records", invCount)
                )
            ));

            log.info("[BackupScheduler] ✓ Backup complete: books={}, carts={}, inventory={}",
                    bookCount, cartCount, invCount);

            // ── Cleanup old backups ───────────────────────────────────────
            purgeOldBackups();

        } catch (Exception ex) {
            log.error("[BackupScheduler] ✗ Backup failed: {}", ex.getMessage(), ex);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin-triggered manual backup (same logic, different entry point)
    // Called from BackupAdminController.
    // ─────────────────────────────────────────────────────────────────────────
    public Map<String, Object> triggerManualBackup() {
        runDailyBackup();
        String dateLabel = LocalDate.now().format(DATE_FMT);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status",     "success");
        result.put("backupDate", dateLabel);
        result.put("directory",  Paths.get(backupDirectory, dateLabel).toAbsolutePath().toString());
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────
    private <T> int exportTable(ObjectMapper mapper, Path dir, String tableName, List<T> records)
            throws IOException {
        Path file = dir.resolve(tableName + ".json");
        mapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), records);
        log.debug("[BackupScheduler]   ↳ {} records → {}", records.size(), file.getFileName());
        return records.size();
    }

    private void writeManifest(ObjectMapper mapper, Path dir, Map<String, Object> manifest)
            throws IOException {
        Path file = dir.resolve("manifest.json");
        mapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), manifest);
    }

    private void purgeOldBackups() {
        LocalDate cutoff = LocalDate.now().minusDays(retentionDays);
        Path root = Paths.get(backupDirectory);

        if (!Files.exists(root)) return;

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(root)) {
            for (Path entry : stream) {
                if (!Files.isDirectory(entry)) continue;
                try {
                    LocalDate folderDate = LocalDate.parse(entry.getFileName().toString(), DATE_FMT);
                    if (folderDate.isBefore(cutoff)) {
                        deleteDirectoryRecursively(entry);
                        log.info("[BackupScheduler] 🗑 Purged old backup: {}", entry.getFileName());
                    }
                } catch (Exception ignored) {
                    // Not a date-named folder — skip
                }
            }
        } catch (IOException ex) {
            log.warn("[BackupScheduler] Could not purge old backups: {}", ex.getMessage());
        }
    }

    private void deleteDirectoryRecursively(Path dir) throws IOException {
        Files.walkFileTree(dir, new SimpleFileVisitor<>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                Files.delete(file);
                return FileVisitResult.CONTINUE;
            }
            @Override
            public FileVisitResult postVisitDirectory(Path d, IOException exc) throws IOException {
                Files.delete(d);
                return FileVisitResult.CONTINUE;
            }
        });
    }

    private ObjectMapper buildMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
}

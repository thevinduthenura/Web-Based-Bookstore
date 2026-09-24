package com.sarasavipages.members.sync.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB mirror document for the MSSQL 'books' table.
 * Tier 2: Read-fallback / analytics replica.
 * Written ONLY by SyncScheduler — never by API controllers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "books_mirror")
public class BookMirror {

    /** Matches the MSSQL Book.id (String UUID) */
    @Id
    private String id;

    @Indexed
    private String title;

    @Indexed
    private String author;

    @Indexed
    private String category;

    private double price;
    private String coverImage;
    private int stockQuantity;
    private String isbn;
    private String description;
    private double rating;

    /** Timestamp of last sync from MSSQL */
    private LocalDateTime syncedAt;
}

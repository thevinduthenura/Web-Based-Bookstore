package com.sarasavipages.members.sync.repository;

import com.sarasavipages.members.sync.document.BookMirror;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * MongoDB repository for the books_mirror collection.
 * Used by SyncScheduler (write) and optionally as a read-fallback.
 */
@Repository
public interface BookMirrorRepository extends MongoRepository<BookMirror, String> {

    List<BookMirror> findByCategoryIgnoreCase(String category);

    List<BookMirror> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
            String title, String author);
}

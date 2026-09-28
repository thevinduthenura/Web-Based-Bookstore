package com.sarasavipages.members.sync.repository;

import com.sarasavipages.members.sync.document.InventoryMirror;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryMirrorRepository extends MongoRepository<InventoryMirror, String> {
    Optional<InventoryMirror> findByBookId(String bookId);
}

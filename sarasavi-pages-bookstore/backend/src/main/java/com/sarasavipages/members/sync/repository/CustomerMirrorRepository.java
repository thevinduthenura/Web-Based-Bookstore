package com.sarasavipages.members.sync.repository;

import com.sarasavipages.members.sync.document.CustomerMirror;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerMirrorRepository extends MongoRepository<CustomerMirror, String> {
    Optional<CustomerMirror> findByEmail(String email);
}

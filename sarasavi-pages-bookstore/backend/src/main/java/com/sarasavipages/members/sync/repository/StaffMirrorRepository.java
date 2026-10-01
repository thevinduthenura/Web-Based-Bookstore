package com.sarasavipages.members.sync.repository;

import com.sarasavipages.members.sync.document.StaffMirror;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffMirrorRepository extends MongoRepository<StaffMirror, String> {
    Optional<StaffMirror> findByUsername(String username);
    Optional<StaffMirror> findByEmail(String email);
}

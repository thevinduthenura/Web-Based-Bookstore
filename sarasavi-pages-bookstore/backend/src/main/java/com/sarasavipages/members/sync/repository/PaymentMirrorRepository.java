package com.sarasavipages.members.sync.repository;

import com.sarasavipages.members.sync.document.PaymentMirror;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentMirrorRepository extends MongoRepository<PaymentMirror, String> {
    Optional<PaymentMirror> findByTransactionReference(String transactionReference);
}

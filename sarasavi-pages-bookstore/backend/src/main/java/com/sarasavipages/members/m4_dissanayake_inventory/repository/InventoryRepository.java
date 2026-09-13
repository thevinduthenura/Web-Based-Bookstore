package com.sarasavipages.members.m4_dissanayake_inventory.repository;

import com.sarasavipages.members.m4_dissanayake_inventory.entity.InventoryItem;
import com.sarasavipages.members.m4_dissanayake_inventory.entity.StockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {

    Optional<InventoryItem> findByBookId(String bookId);

    Optional<InventoryItem> findByIsbn(String isbn);

    List<InventoryItem> findByCategoryIgnoreCase(String category);

    List<InventoryItem> findByStatus(StockStatus status);

    @Query("SELECT i FROM InventoryItem i WHERE i.stockQuantity <= i.safetyStockLevel")
    List<InventoryItem> findLowStockAlerts();

    List<InventoryItem> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);
}

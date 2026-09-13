package com.sarasavipages.members.m4_dissanayake_inventory.repository;

import com.sarasavipages.members.m4_dissanayake_inventory.entity.StockAdjustmentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockAdjustmentLogRepository extends JpaRepository<StockAdjustmentLog, Long> {

    List<StockAdjustmentLog> findByInventoryItemIdOrderByTimestampDesc(Long inventoryItemId);

    List<StockAdjustmentLog> findTop20ByOrderByTimestampDesc();
}

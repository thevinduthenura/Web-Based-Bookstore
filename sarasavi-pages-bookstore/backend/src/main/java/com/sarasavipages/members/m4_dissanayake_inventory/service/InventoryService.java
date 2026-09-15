package com.sarasavipages.members.m4_dissanayake_inventory.service;

import com.sarasavipages.members.m4_dissanayake_inventory.dto.InventoryItemRequest;
import com.sarasavipages.members.m4_dissanayake_inventory.dto.InventoryResponse;
import com.sarasavipages.members.m4_dissanayake_inventory.dto.StockUpdateRequest;
import com.sarasavipages.members.m4_dissanayake_inventory.entity.StockAdjustmentLog;

import java.util.List;

public interface InventoryService {

    List<InventoryResponse> getAllInventory(String category, String query);

    InventoryResponse getInventoryById(Long id);

    InventoryResponse createInventoryItem(InventoryItemRequest request);

    InventoryResponse adjustStock(Long id, StockUpdateRequest request, String adjustedBy);

    List<InventoryResponse> getLowStockAlerts();

    List<StockAdjustmentLog> getStockAuditLogs(Long inventoryItemId);

    InventoryResponse updateInventoryItem(Long id, InventoryItemRequest request);

    void deleteInventoryItem(Long id);
}

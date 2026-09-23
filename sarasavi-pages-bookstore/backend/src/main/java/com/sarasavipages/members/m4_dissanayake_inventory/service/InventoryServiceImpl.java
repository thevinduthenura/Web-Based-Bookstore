package com.sarasavipages.members.m4_dissanayake_inventory.service;

import com.sarasavipages.members.m4_dissanayake_inventory.dto.InventoryItemRequest;
import com.sarasavipages.members.m4_dissanayake_inventory.dto.InventoryResponse;
import com.sarasavipages.members.m4_dissanayake_inventory.dto.StockUpdateRequest;
import com.sarasavipages.members.m4_dissanayake_inventory.entity.InventoryItem;
import com.sarasavipages.members.m4_dissanayake_inventory.entity.StockAdjustmentLog;
import com.sarasavipages.members.m4_dissanayake_inventory.repository.InventoryRepository;
import com.sarasavipages.members.m4_dissanayake_inventory.repository.StockAdjustmentLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StockAdjustmentLogRepository logRepository;

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getAllInventory(String category, String query) {
        List<InventoryItem> items;
        if (query != null && !query.isBlank()) {
            items = inventoryRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(query.trim(), query.trim());
        } else if (category != null && !category.isBlank()) {
            items = inventoryRepository.findByCategoryIgnoreCase(category.trim());
        } else {
            items = inventoryRepository.findAll();
        }
        return items.stream().map(InventoryResponse::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryById(Long id) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found with ID: " + id));
        return InventoryResponse.fromEntity(item);
    }

    @Override
    @Transactional
    public InventoryResponse createInventoryItem(InventoryItemRequest req) {
        if (inventoryRepository.findByBookId(req.getBookId()).isPresent()) {
            throw new IllegalArgumentException("Inventory item already exists for book ID: " + req.getBookId());
        }

        InventoryItem item = InventoryItem.builder()
                .bookId(req.getBookId())
                .isbn(req.getIsbn())
                .title(req.getTitle())
                .author(req.getAuthor())
                .category(req.getCategory())
                .location(req.getLocation())
                .stockQuantity(req.getStockQuantity())
                .safetyStockLevel(req.getSafetyStockLevel())
                .reorderQuantity(req.getReorderQuantity())
                .unitCost(req.getUnitCost())
                .sellingPrice(req.getSellingPrice())
                .supplier(req.getSupplier())
                .lastRestockedAt(LocalDateTime.now())
                .build();

        InventoryItem saved = inventoryRepository.save(item);

        // Record initial inventory log
        StockAdjustmentLog log = StockAdjustmentLog.builder()
                .inventoryItemId(saved.getId())
                .bookTitle(saved.getTitle())
                .adjustmentType("INITIAL_INTAKE")
                .quantityChanged(saved.getStockQuantity())
                .previousQuantity(0)
                .newQuantity(saved.getStockQuantity())
                .reason("Initial stock intake upon catalog registration")
                .adjustedBy("IT25101062")
                .build();
        logRepository.save(log);

        return InventoryResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public InventoryResponse adjustStock(Long id, StockUpdateRequest req, String adjustedBy) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found with ID: " + id));

        int prevQty = item.getStockQuantity();
        int change = req.getQuantity();
        int newQty;

        String type = req.getAdjustmentType().toUpperCase();
        switch (type) {
            case "RESTOCK":
            case "RETURN":
                newQty = prevQty + change;
                item.setLastRestockedAt(LocalDateTime.now());
                break;
            case "DAMAGE":
            case "SALE_DEDUCTION":
                if (prevQty < change) {
                    throw new IllegalArgumentException("Cannot deduct " + change + " units. Current stock is only " + prevQty);
                }
                newQty = prevQty - change;
                break;
            case "MANUAL_CORRECTION":
                newQty = change;
                break;
            default:
                throw new IllegalArgumentException("Invalid adjustment type: " + req.getAdjustmentType());
        }

        item.setStockQuantity(newQty);
        InventoryItem updated = inventoryRepository.save(item);

        StockAdjustmentLog log = StockAdjustmentLog.builder()
                .inventoryItemId(updated.getId())
                .bookTitle(updated.getTitle())
                .adjustmentType(type)
                .quantityChanged(change)
                .previousQuantity(prevQty)
                .newQuantity(newQty)
                .reason(req.getReason() != null ? req.getReason() : "Stock updated via Inventory Admin portal")
                .adjustedBy(adjustedBy != null ? adjustedBy : "IT25101062")
                .build();
        logRepository.save(log);

        return InventoryResponse.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockAlerts() {
        return inventoryRepository.findLowStockAlerts().stream()
                .map(InventoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockAdjustmentLog> getStockAuditLogs(Long inventoryItemId) {
        if (inventoryItemId != null) {
            return logRepository.findByInventoryItemIdOrderByTimestampDesc(inventoryItemId);
        }
        return logRepository.findTop20ByOrderByTimestampDesc();
    }

    @Override
    @Transactional
    public InventoryResponse updateInventoryItem(Long id, InventoryItemRequest req) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found with ID: " + id));

        item.setTitle(req.getTitle());
        item.setAuthor(req.getAuthor());
        item.setIsbn(req.getIsbn());
        item.setCategory(req.getCategory());
        item.setLocation(req.getLocation());
        item.setSafetyStockLevel(req.getSafetyStockLevel());
        item.setReorderQuantity(req.getReorderQuantity());
        item.setUnitCost(req.getUnitCost());
        item.setSellingPrice(req.getSellingPrice());
        item.setSupplier(req.getSupplier());

        InventoryItem updated = inventoryRepository.save(item);
        return InventoryResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteInventoryItem(Long id) {
        if (!inventoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Inventory item not found with ID: " + id);
        }
        inventoryRepository.deleteById(id);
    }
}

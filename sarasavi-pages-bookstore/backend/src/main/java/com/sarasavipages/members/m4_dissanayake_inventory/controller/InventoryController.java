package com.sarasavipages.members.m4_dissanayake_inventory.controller;

import com.sarasavipages.common.ApiResponse;
import com.sarasavipages.members.m4_dissanayake_inventory.dto.InventoryItemRequest;
import com.sarasavipages.members.m4_dissanayake_inventory.dto.InventoryResponse;
import com.sarasavipages.members.m4_dissanayake_inventory.dto.StockUpdateRequest;
import com.sarasavipages.members.m4_dissanayake_inventory.entity.StockAdjustmentLog;
import com.sarasavipages.members.m4_dissanayake_inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Inventory & Book Catalog REST Controller - UC-INV-01
 * Role Required: SUPER_ADMIN or INVENTORY_ADMIN
 * Owner: Dissanayake S.A.S.D. (IT25101062)
 */
@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@Tag(name = "Module 4 – Inventory & Stock", description = "Stock adjustments, warehouse catalog, and low stock alerts")
@SecurityRequirement(name = "bearerAuth")
public class InventoryController {

    private final InventoryService inventoryService;

    @Operation(summary = "Get all inventory items with optional filtering")
    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getAllInventory(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String query) {
        List<InventoryResponse> items = inventoryService.getAllInventory(category, query);
        return ResponseEntity.ok(ApiResponse.success("Inventory items retrieved successfully", items));
    }

    @Operation(summary = "Get inventory details by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryResponse>> getInventoryById(@PathVariable Long id) {
        try {
            InventoryResponse res = inventoryService.getInventoryById(id);
            return ResponseEntity.ok(ApiResponse.success("Item found", res));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Register new inventory item")
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'INVENTORY_ADMIN')")
    public ResponseEntity<ApiResponse<InventoryResponse>> createInventoryItem(
            @Valid @RequestBody InventoryItemRequest request) {
        try {
            InventoryResponse res = inventoryService.createInventoryItem(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Inventory item registered successfully", res));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Adjust stock quantity (Restock, Damage, Sale, Return)")
    @PutMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'INVENTORY_ADMIN')")
    public ResponseEntity<ApiResponse<InventoryResponse>> adjustStock(
            @PathVariable Long id,
            @Valid @RequestBody StockUpdateRequest request,
            Authentication authentication) {
        try {
            String adjustedBy = (authentication != null) ? authentication.getName() : "IT25101062";
            InventoryResponse updated = inventoryService.adjustStock(id, request, adjustedBy);
            return ResponseEntity.ok(ApiResponse.success("Stock adjusted successfully", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Get low stock alert items (quantity <= safetyStockLevel)")
    @GetMapping("/alerts/low-stock")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getLowStockAlerts() {
        List<InventoryResponse> alerts = inventoryService.getLowStockAlerts();
        return ResponseEntity.ok(ApiResponse.success("Low stock alerts retrieved", alerts));
    }

    @Operation(summary = "Get stock adjustment audit trail logs")
    @GetMapping("/logs")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'INVENTORY_ADMIN')")
    public ResponseEntity<ApiResponse<List<StockAdjustmentLog>>> getStockAuditLogs(
            @RequestParam(required = false) Long itemId) {
        List<StockAdjustmentLog> logs = inventoryService.getStockAuditLogs(itemId);
        return ResponseEntity.ok(ApiResponse.success("Stock adjustment logs retrieved", logs));
    }

    @Operation(summary = "Update inventory item details")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'INVENTORY_ADMIN')")
    public ResponseEntity<ApiResponse<InventoryResponse>> updateInventoryItem(
            @PathVariable Long id,
            @Valid @RequestBody InventoryItemRequest request) {
        try {
            InventoryResponse updated = inventoryService.updateInventoryItem(id, request);
            return ResponseEntity.ok(ApiResponse.success("Inventory item updated successfully", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Operation(summary = "Delete inventory item")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'INVENTORY_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteInventoryItem(@PathVariable Long id) {
        try {
            inventoryService.deleteInventoryItem(id);
            return ResponseEntity.ok(ApiResponse.success("Inventory item deleted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

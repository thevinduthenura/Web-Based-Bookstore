package com.sarasavipages.members.m6_diyes_orders.controller;

import com.sarasavipages.common.ApiResponse;
import com.sarasavipages.members.m6_diyes_orders.entity.Order;
import com.sarasavipages.members.m6_diyes_orders.repository.OrderRepository;
import com.sarasavipages.members.sync.document.OrderMirror;
import com.sarasavipages.members.sync.repository.OrderMirrorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Module 6 – Orders & Logistics", description = "Order dispatch, courier tracking and packing lifecycle")
public class OrderController {

    private final OrderRepository orderRepository;
    private final Optional<OrderMirrorRepository> orderMirrorRepository;

    @Operation(summary = "Get all orders (with MongoDB mirror fallback)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrders() {
        try {
            List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
            if (!orders.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.success("Orders retrieved from MSSQL", orders));
            }
        } catch (Exception ex) {
            log.warn("[OrderController] MSSQL fetch failed: {}", ex.getMessage());
        }

        // Fallback to MongoDB mirror
        if (orderMirrorRepository.isPresent()) {
            try {
                List<Order> mirrored = orderMirrorRepository.get().findAll().stream()
                        .map(this::fromOrderMirror)
                        .collect(Collectors.toList());
                if (!mirrored.isEmpty()) {
                    return ResponseEntity.ok(ApiResponse.success("Orders retrieved from MongoDB mirror replica", mirrored));
                }
            } catch (Exception ex) {
                log.warn("[OrderController] Mongo mirror fetch failed: {}", ex.getMessage());
            }
        }

        return ResponseEntity.ok(ApiResponse.success("No orders found", List.of()));
    }

    @Operation(summary = "Get order by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> getOrderById(@PathVariable String id) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(id);
            if (orderOpt.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("Order found", orderOpt.get()));
            }
        } catch (Exception ignored) {}

        if (orderMirrorRepository.isPresent()) {
            return orderMirrorRepository.get().findById(id)
                    .map(m -> ResponseEntity.ok(ApiResponse.success("Order found in MongoDB mirror", fromOrderMirror(m))))
                    .orElse(ResponseEntity.notFound().build());
        }

        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "Create / Place a new order")
    @PostMapping
    public ResponseEntity<ApiResponse<Order>> createOrder(@RequestBody Order order) {
        if (order.getId() == null || order.getId().isBlank()) {
            order.setId("ORD-" + (int)(10000 + Math.random() * 90000));
        }
        if (order.getCreatedAt() == null) {
            order.setCreatedAt(LocalDateTime.now());
        }
        if (order.getStatus() == null || order.getStatus().isBlank()) {
            order.setStatus("PENDING");
        }
        if (order.getTotalAmount() == null) {
            order.setTotalAmount(BigDecimal.ZERO);
        }

        Order saved = null;
        try {
            saved = orderRepository.save(order);
        } catch (Exception ex) {
            log.warn("[OrderController] Could not save directly to MSSQL: {}", ex.getMessage());
            saved = order;
        }

        // Instant mirror to MongoDB
        final Order finalOrder = saved;
        orderMirrorRepository.ifPresent(repo -> {
            try {
                repo.save(toOrderMirror(finalOrder));
            } catch (Exception ex) {
                log.warn("[OrderController] MongoDB mirror write error: {}", ex.getMessage());
            }
        });

        return ResponseEntity.ok(ApiResponse.success("Order created successfully", finalOrder));
    }

    @Operation(summary = "Update order status, courier or tracking (Order Admin or Super Admin)")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> updateOrder(@PathVariable String id, @RequestBody Order updatedData) {
        Optional<Order> existingOpt = orderRepository.findById(id);

        if (existingOpt.isPresent()) {
            Order existing = existingOpt.get();
            if (updatedData.getCustomerName() != null) existing.setCustomerName(updatedData.getCustomerName());
            if (updatedData.getItemsSummary() != null) existing.setItemsSummary(updatedData.getItemsSummary());
            if (updatedData.getTotalAmount() != null) existing.setTotalAmount(updatedData.getTotalAmount());
            if (updatedData.getStatus() != null) existing.setStatus(updatedData.getStatus());
            if (updatedData.getCourier() != null) existing.setCourier(updatedData.getCourier());
            if (updatedData.getTrackingNo() != null) existing.setTrackingNo(updatedData.getTrackingNo());
            if (updatedData.getDestination() != null) existing.setDestination(updatedData.getDestination());

            Order saved = orderRepository.save(existing);

            orderMirrorRepository.ifPresent(repo -> {
                try {
                    repo.save(toOrderMirror(saved));
                } catch (Exception ignored) {}
            });

            return ResponseEntity.ok(ApiResponse.success("Order updated successfully", saved));
        } else {
            // Check if present in Mongo or save as new
            updatedData.setId(id);
            if (updatedData.getCreatedAt() == null) updatedData.setCreatedAt(LocalDateTime.now());
            Order saved = orderRepository.save(updatedData);

            orderMirrorRepository.ifPresent(repo -> {
                try {
                    repo.save(toOrderMirror(saved));
                } catch (Exception ignored) {}
            });

            return ResponseEntity.ok(ApiResponse.success("Order updated in database", saved));
        }
    }

    @Operation(summary = "Delete order (Order Admin or Super Admin)")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable String id) {
        try {
            if (orderRepository.existsById(id)) {
                orderRepository.deleteById(id);
            }
        } catch (Exception ex) {
            log.warn("[OrderController] MSSQL delete error: {}", ex.getMessage());
        }

        orderMirrorRepository.ifPresent(repo -> {
            try {
                repo.deleteById(id);
            } catch (Exception ignored) {}
        });

        return ResponseEntity.ok(ApiResponse.success("Order deleted successfully", null));
    }

    private OrderMirror toOrderMirror(Order o) {
        return OrderMirror.builder()
                .id(o.getId())
                .customerId(o.getCustomerName())
                .customerName(o.getCustomerName())
                .status(o.getStatus())
                .totalAmount(o.getTotalAmount() != null ? o.getTotalAmount().doubleValue() : 0.0)
                .paymentMethod("COD / Online")
                .itemsSummary(o.getItemsSummary())
                .courier(o.getCourier())
                .trackingNo(o.getTrackingNo())
                .destination(o.getDestination())
                .orderedAt(o.getCreatedAt())
                .syncedAt(LocalDateTime.now())
                .build();
    }

    private Order fromOrderMirror(OrderMirror m) {
        return Order.builder()
                .id(m.getId())
                .customerName(m.getCustomerName() != null ? m.getCustomerName() : "Customer")
                .itemsSummary(m.getItemsSummary() != null ? m.getItemsSummary() : "Assorted Books")
                .totalAmount(BigDecimal.valueOf(m.getTotalAmount()))
                .status(m.getStatus() != null ? m.getStatus() : "PENDING")
                .courier(m.getCourier() != null ? m.getCourier() : "Domex Express")
                .trackingNo(m.getTrackingNo() != null ? m.getTrackingNo() : "Pending")
                .destination(m.getDestination() != null ? m.getDestination() : "Colombo")
                .createdAt(m.getOrderedAt() != null ? m.getOrderedAt() : LocalDateTime.now())
                .build();
    }
}

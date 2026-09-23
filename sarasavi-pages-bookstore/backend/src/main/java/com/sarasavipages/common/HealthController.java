package com.sarasavipages.common;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health check controller for cloud platforms (Render, Kubernetes, Docker).
 * Endpoint: GET /api/health
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "sarasavi-pages-backend",
            "timestamp", System.currentTimeMillis()
        ));
    }
}

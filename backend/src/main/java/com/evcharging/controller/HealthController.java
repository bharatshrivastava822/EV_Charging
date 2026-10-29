package com.evcharging.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping({"/", "/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "ChargerGo Backend API",
            "version", "2.0.0",
            "message", "ChargerGo REST API is live and running.",
            "healthCheck", "/api/health",
            "stationsEndpoint", "/api/stations",
            "timestamp", Instant.now().toString()
        ));
    }
}


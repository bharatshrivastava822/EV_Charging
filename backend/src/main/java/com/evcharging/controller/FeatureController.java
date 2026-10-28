package com.evcharging.controller;

import com.evcharging.dto.FeatureDTO;
import com.evcharging.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FeatureController {

    private final CostEstimatorService costEstimatorService;
    private final RecommendationService recommendationService;
    private final SimulationService simulationService;
    private final NotificationService notificationService;
    private final ReviewService reviewService;

    // --- 1. Charging Cost Calculator ---
    @PostMapping("/features/estimate-cost")
    public ResponseEntity<FeatureDTO.CostEstimateResponse> estimateCost(@Valid @RequestBody FeatureDTO.CostEstimateRequest request) {
        FeatureDTO.CostEstimateResponse response = costEstimatorService.calculateEstimate(request);
        return ResponseEntity.ok(response);
    }

    // --- 2. Smart Recommendations ---
    @GetMapping("/features/recommendations")
    public ResponseEntity<List<FeatureDTO.StationRecommendation>> getRecommendations(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) String chargerType,
            @RequestParam(required = false, defaultValue = "5") Integer limit) {
        List<FeatureDTO.StationRecommendation> recommendations = recommendationService.getRecommendations(lat, lng, chargerType, limit);
        return ResponseEntity.ok(recommendations);
    }

    // --- 3. Station Reviews ---
    @GetMapping("/features/reviews/station/{stationId}")
    public ResponseEntity<List<FeatureDTO.ReviewResponse>> getStationReviews(@PathVariable Long stationId) {
        List<FeatureDTO.ReviewResponse> reviews = reviewService.getStationReviews(stationId);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping("/features/reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FeatureDTO.ReviewResponse> submitReview(
            Authentication authentication,
            @Valid @RequestBody FeatureDTO.ReviewRequest request) {
        FeatureDTO.ReviewResponse response = reviewService.submitReview(authentication.getName(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // --- 4. Simulation Engine ---
    @PostMapping("/features/simulation/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FeatureDTO.SessionResponse> startSimulation(
            Authentication authentication,
            @Valid @RequestBody FeatureDTO.SessionStartRequest request) {
        FeatureDTO.SessionResponse response = simulationService.startSession(authentication.getName(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/features/simulation/{sessionId}/tick")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FeatureDTO.SessionResponse> tickSimulation(
            Authentication authentication,
            @PathVariable Long sessionId) {
        FeatureDTO.SessionResponse response = simulationService.tickSimulation(sessionId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/features/simulation/{sessionId}/stop")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FeatureDTO.SessionResponse> stopSimulation(
            Authentication authentication,
            @PathVariable Long sessionId) {
        FeatureDTO.SessionResponse response = simulationService.stopSession(sessionId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/features/simulation/booking/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FeatureDTO.SessionResponse> getSimulationByBooking(
            Authentication authentication,
            @PathVariable Long bookingId) {
        FeatureDTO.SessionResponse response = simulationService.getSessionByBooking(bookingId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    // --- 5. Notifications ---
    @GetMapping("/notifications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FeatureDTO.NotificationResponse>> getUserNotifications(Authentication authentication) {
        List<FeatureDTO.NotificationResponse> notifications = notificationService.getUserNotifications(authentication.getName());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/notifications/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        long count = notificationService.getUnreadCount(authentication.getName());
        return ResponseEntity.ok(count);
    }

    @PatchMapping("/notifications/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markNotificationRead(
            Authentication authentication,
            @PathVariable Long id) {
        notificationService.markAsRead(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/notifications/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllNotificationsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}

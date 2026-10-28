package com.evcharging.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class FeatureDTO {

    // --- 1. Cost Estimator ---
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class CostEstimateRequest {
        @NotNull(message = "Target energy in kWh is required")
        @Min(value = 1, message = "Energy must be at least 1 kWh")
        private Double energyKwh;

        private Double pricePerKwh; // default to station price if omitted
        private Double serviceFee;  // optional regulatory / parking fee
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class CostEstimateResponse {
        private Double energyKwh;
        private Double pricePerKwh;
        private Double baseCostInr;
        private Double serviceFeeInr;
        private Double totalEstimatedCostInr;
        private String formattedTotal;
        private String disclaimer;
    }

    // --- 2. Smart Recommendation ---
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class StationRecommendation {
        private StationDTO.StationSummary station;
        private double score;
        private String primaryReason;
        private Double distanceKm;
        private Double pricePerKwh;
        private boolean fastChargingAvailable;
    }

    // --- 3. Maintenance Reports ---
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class MaintenanceRequest {
        @NotNull(message = "Charger ID is required")
        private Long chargerId;

        @NotBlank(message = "Issue description is required")
        private String issueDescription;

        private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class MaintenanceResolutionRequest {
        @NotBlank(message = "Resolution notes are required")
        private String resolutionNotes;

        private String status; // RESOLVED or CLOSED
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class MaintenanceResponse {
        private Long id;
        private Long stationId;
        private String stationName;
        private Long chargerId;
        private String chargerNumber;
        private String issueDescription;
        private String severity;
        private String status;
        private String reportedByName;
        private String resolutionNotes;
        private String reportedAt;
        private String resolvedAt;
    }

    // --- 4. Simulation Engine ---
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class SessionStartRequest {
        @NotNull(message = "Booking ID is required")
        private Long bookingId;

        private Integer startBatteryPct;  // default 20
        private Integer targetBatteryPct; // default 80
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class SessionResponse {
        private Long id;
        private Long bookingId;
        private String bookingReference;
        private String stationName;
        private String chargerNumber;
        private String chargerType;
        private Double powerKw;
        private String startTime;
        private String endTime;
        private Double energyDeliveredKwh;
        private Double currentPowerKw;
        private Integer batteryCurrentPct;
        private Integer batteryTargetPct;
        private Double estimatedCostInr;
        private String status;
        private String simulatorNotice;
    }

    // --- 5. Notifications ---
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class NotificationResponse {
        private Long id;
        private String title;
        private String message;
        private String type;
        private boolean read;
        private String createdAt;
    }

    // --- 6. Reviews ---
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class ReviewRequest {
        @NotNull(message = "Station ID is required")
        private Long stationId;

        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating cannot exceed 5")
        private Integer rating;

        private String comment;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class ReviewResponse {
        private Long id;
        private Long stationId;
        private String userName;
        private Integer rating;
        private String comment;
        private String createdAt;
    }
}

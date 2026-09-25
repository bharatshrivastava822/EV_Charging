package com.evcharging.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

public class BookingDTO {

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class BookingRequest {
        @NotNull(message = "Station ID is required")
        private Long stationId;

        @NotNull(message = "Charger ID is required")
        private Long chargerId;

        @NotNull(message = "Slot ID is required")
        private Long slotId;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class BookingResponse {
        private Long id;
        private String bookingReference;
        private String stationName;
        private String stationAddress;
        private String chargerNumber;
        private String chargerType;
        private Double powerKw;
        private String bookingDate;
        private String startTime;
        private String endTime;
        private String status;
        private String createdAt;
        private String cancelledAt;
        private Long stationId;
        private Long chargerId;
        private Long slotId;
        private Long userId;
        private String userName;
        private String userEmail;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class SlotResponse {
        private Long id;
        private Long chargerId;
        private String chargerNumber;
        private String chargerType;
        private Double powerKw;
        private String slotDate;
        private String startTime;
        private String endTime;
        private String status;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class SlotCreateRequest {
        @NotNull(message = "Charger ID is required")
        private Long chargerId;

        @NotNull(message = "Date is required")
        private String slotDate;

        @NotNull(message = "Start time is required")
        private String startTime;

        @NotNull(message = "End time is required")
        private String endTime;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class AdminStats {
        private long totalStations;
        private long activeStations;
        private long totalChargers;
        private long activeChargers;
        private long todayBookings;
        private long confirmedBookings;
        private long cancelledBookings;
        private long totalUsers;
        private long occupiedSlots;
    }
}

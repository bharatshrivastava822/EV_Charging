package com.evcharging.dto;

import lombok.*;

public class OperatorDTO {

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class OperatorStats {
        private long totalStations;
        private long activeStations;
        private long pendingStations;
        private long totalChargers;
        private long activeChargers;
        private long totalBookings;
        private long todayBookings;
        private double estimatedRevenue;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class OperatorStatusResponse {
        private Long id;
        private String name;
        private String email;
        private String role;
        private String operatorStatus;
        private boolean approved;
        private String message;
    }
}


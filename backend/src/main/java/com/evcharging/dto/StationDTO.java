package com.evcharging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalTime;
import java.util.List;

public class StationDTO {

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class StationResponse {
        private Long id;
        private String name;
        private String address;
        private String city;
        private String state;
        private Double latitude;
        private Double longitude;
        private String operator;
        private String openingTime;
        private String closingTime;
        private String status;
        private String approvalStatus;
        private Long ownerId;
        private String ownerName;
        private String imageUrl;
        private int totalChargers;
        private int activeChargers;
        private List<ChargerResponse> chargers;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class StationSummary {
        private Long id;
        private String name;
        private String address;
        private String city;
        private String state;
        private String operator;
        private String openingTime;
        private String closingTime;
        private String status;
        private String approvalStatus;
        private Long ownerId;
        private String ownerName;
        private int totalChargers;
        private int availableChargers;
        private List<String> chargerTypes;
        private Double maxPowerKw;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class StationRequest {
        @NotBlank(message = "Station name is required")
        private String name;

        @NotBlank(message = "Address is required")
        private String address;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "State is required")
        private String state;

        private Double latitude;
        private Double longitude;
        private String operator;

        @NotNull(message = "Opening time is required")
        private String openingTime;

        @NotNull(message = "Closing time is required")
        private String closingTime;

        private String status;
        private String imageUrl;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class ChargerResponse {
        private Long id;
        private Long stationId;
        private String chargerNumber;
        private String chargerType;
        private String chargingSpeed;
        private Double powerKw;
        private String status;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class ChargerRequest {
        @NotNull(message = "Station ID is required")
        private Long stationId;

        @NotBlank(message = "Charger number is required")
        private String chargerNumber;

        @NotBlank(message = "Charger type is required")
        private String chargerType;

        private String chargingSpeed;

        @NotNull(message = "Power (kW) is required")
        private Double powerKw;

        private String status;
    }
}

package com.evcharging.service;

import com.evcharging.dto.FeatureDTO;
import com.evcharging.dto.StationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final StationService stationService;

    public List<FeatureDTO.StationRecommendation> getRecommendations(
            Double userLat, 
            Double userLng, 
            String chargerTypePreference,
            Integer limit) {

        List<StationDTO.StationSummary> stations = stationService.getAllActiveStations(null, null, chargerTypePreference);
        final double baseLat = (userLat != null) ? userLat : 22.7196; // Default to Indore benchmark
        final double baseLng = (userLng != null) ? userLng : 75.8577;
        final int maxResults = (limit != null && limit > 0) ? limit : 5;

        return stations.stream()
                .map(station -> {
                    double dist = 2.5; // default fallback distance
                    if (station.getId() != null) {
                        try {
                            StationDTO.StationResponse full = stationService.getStationById(station.getId());
                            if (full.getLatitude() != null && full.getLongitude() != null) {
                                dist = calculateHaversineDistance(baseLat, baseLng, full.getLatitude(), full.getLongitude());
                            }
                        } catch (Exception ignored) {}
                    }

                    double distanceScore = Math.max(0.0, 10.0 - (dist * 0.5)); // 0 to 10
                    double powerScore = (station.getMaxPowerKw() != null && station.getMaxPowerKw() >= 100.0) ? 10.0 : 6.0;
                    double price = station.getPricePerKwh() != null ? station.getPricePerKwh() : 18.50;
                    double priceScore = Math.max(0.0, 25.0 - price); // Lower price = higher score
                    double availRatio = (station.getTotalChargers() > 0) 
                            ? ((double) station.getAvailableChargers() / station.getTotalChargers()) * 10.0 
                            : 5.0;
                    double ratingScore = (station.getRating() != null) ? station.getRating() * 2.0 : 9.0;

                    // Weighted score out of 100
                    double totalScore = (distanceScore * 2.5) + (powerScore * 2.0) + (priceScore * 2.0) + (availRatio * 1.5) + (ratingScore * 2.0);
                    totalScore = Math.round(totalScore * 10.0) / 10.0;

                    // Primary Reason
                    String reason;
                    if (dist < 3.0) {
                        reason = String.format("Closest Station (%.1f km away)", dist);
                    } else if (station.getMaxPowerKw() != null && station.getMaxPowerKw() >= 120.0) {
                        reason = String.format("Ultra-Fast Hub (%.0f kW DC)", station.getMaxPowerKw());
                    } else if (price <= 17.5) {
                        reason = String.format("Economical Tariff (₹%.2f/kWh)", price);
                    } else if (station.getRating() != null && station.getRating() >= 4.7) {
                        reason = String.format("Top Rated (★ %.1f)", station.getRating());
                    } else {
                        reason = "High Connector Availability";
                    }

                    boolean isFast = station.getMaxPowerKw() != null && station.getMaxPowerKw() >= 50.0;

                    return FeatureDTO.StationRecommendation.builder()
                            .station(station)
                            .score(totalScore)
                            .primaryReason(reason)
                            .distanceKm(Math.round(dist * 10.0) / 10.0)
                            .pricePerKwh(price)
                            .fastChargingAvailable(isFast)
                            .build();
                })
                .sorted(Comparator.comparingDouble(FeatureDTO.StationRecommendation::getScore).reversed())
                .limit(maxResults)
                .collect(Collectors.toList());
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}

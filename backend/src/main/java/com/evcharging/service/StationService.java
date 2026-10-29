package com.evcharging.service;

import com.evcharging.dto.StationDTO;
import com.evcharging.entity.Charger;
import com.evcharging.entity.ChargingStation;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.ChargerRepository;
import com.evcharging.repository.ChargingStationRepository;
import com.evcharging.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StationService {

    private final ChargingStationRepository stationRepository;
    private final ChargerRepository chargerRepository;
    private final SlotRepository slotRepository;
    private final com.evcharging.repository.StationReviewRepository reviewRepository;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Transactional(readOnly = true)
    public List<StationDTO.StationSummary> getAllActiveStations(String search, String city, String chargerType) {
        List<ChargingStation> stations;

        if (search != null && !search.trim().isEmpty()) {
            stations = stationRepository.searchApprovedStations(
                    search.trim(), 
                    ChargingStation.StationStatus.ACTIVE, 
                    ChargingStation.ApprovalStatus.APPROVED);
        } else if (city != null && !city.trim().isEmpty()) {
            stations = stationRepository.findByCityContainingIgnoreCaseAndStatusAndApprovalStatus(
                    city.trim(), 
                    ChargingStation.StationStatus.ACTIVE, 
                    ChargingStation.ApprovalStatus.APPROVED);
        } else {
            stations = stationRepository.findByStatusAndApprovalStatus(
                    ChargingStation.StationStatus.ACTIVE, 
                    ChargingStation.ApprovalStatus.APPROVED);
        }

        return stations.stream()
                .filter(station -> {
                    if (chargerType == null || chargerType.trim().isEmpty()) return true;
                    return station.getChargers().stream()
                            .anyMatch(c -> c.getStatus() == Charger.ChargerStatus.ACTIVE &&
                                           c.getChargerType().name().equalsIgnoreCase(chargerType.trim()));
                })
                .map(this::mapToSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StationDTO.StationResponse getStationById(Long id) {
        ChargingStation station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charging station not found with ID: " + id));

        return mapToResponse(station);
    }

    @Transactional
    public StationDTO.StationResponse createStation(StationDTO.StationRequest request) {
        ChargingStation station = ChargingStation.builder()
                .name(request.getName().trim())
                .address(request.getAddress().trim())
                .city(request.getCity().trim())
                .state(request.getState().trim())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .operator(request.getOperator() != null ? request.getOperator().trim() : null)
                .openingTime(LocalTime.parse(request.getOpeningTime()))
                .closingTime(LocalTime.parse(request.getClosingTime()))
                .status(request.getStatus() != null ? ChargingStation.StationStatus.valueOf(request.getStatus()) : ChargingStation.StationStatus.ACTIVE)
                .imageUrl(request.getImageUrl())
                .build();

        ChargingStation saved = stationRepository.save(station);
        return mapToResponse(saved);
    }

    @Transactional
    public StationDTO.StationResponse updateStation(Long id, StationDTO.StationRequest request) {
        ChargingStation station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charging station not found with ID: " + id));

        station.setName(request.getName().trim());
        station.setAddress(request.getAddress().trim());
        station.setCity(request.getCity().trim());
        station.setState(request.getState().trim());
        station.setLatitude(request.getLatitude());
        station.setLongitude(request.getLongitude());
        station.setOperator(request.getOperator() != null ? request.getOperator().trim() : null);
        station.setOpeningTime(LocalTime.parse(request.getOpeningTime()));
        station.setClosingTime(LocalTime.parse(request.getClosingTime()));
        if (request.getStatus() != null) {
            station.setStatus(ChargingStation.StationStatus.valueOf(request.getStatus()));
        }
        if (request.getImageUrl() != null) {
            station.setImageUrl(request.getImageUrl());
        }

        ChargingStation updated = stationRepository.save(station);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteStation(Long id) {
        ChargingStation station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charging station not found with ID: " + id));
        // Soft delete / deactivate
        station.setStatus(ChargingStation.StationStatus.INACTIVE);
        stationRepository.save(station);
    }

    @Transactional
    public StationDTO.ChargerResponse addCharger(StationDTO.ChargerRequest request) {
        ChargingStation station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("Charging station not found with ID: " + request.getStationId()));

        Charger charger = Charger.builder()
                .station(station)
                .chargerNumber(request.getChargerNumber().trim())
                .chargerType(Charger.ChargerType.valueOf(request.getChargerType().toUpperCase()))
                .chargingSpeed(request.getChargingSpeed())
                .powerKw(request.getPowerKw())
                .status(request.getStatus() != null ? Charger.ChargerStatus.valueOf(request.getStatus()) : Charger.ChargerStatus.ACTIVE)
                .build();

        Charger saved = chargerRepository.save(charger);
        return mapChargerToResponse(saved);
    }

    @Transactional
    public void deleteCharger(Long chargerId) {
        Charger charger = chargerRepository.findById(chargerId)
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found with ID: " + chargerId));
        charger.setStatus(Charger.ChargerStatus.INACTIVE);
        chargerRepository.save(charger);
    }

    public StationDTO.StationSummary mapToSummary(ChargingStation station) {
        List<Charger> activeChargers = station.getChargers().stream()
                .filter(c -> c.getStatus() == Charger.ChargerStatus.ACTIVE)
                .toList();

        List<String> types = activeChargers.stream()
                .map(c -> c.getChargerType().name())
                .distinct()
                .collect(Collectors.toList());

        Double maxPower = activeChargers.stream()
                .mapToDouble(Charger::getPowerKw)
                .max()
                .orElse(0.0);

        Double avgRating = reviewRepository != null ? reviewRepository.getAverageRatingForStation(station.getId()) : null;
        double rating = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 4.8;
        double price = station.getPricePerKwh() != null ? station.getPricePerKwh() : 18.50;

        return StationDTO.StationSummary.builder()
                .id(station.getId())
                .name(station.getName())
                .address(station.getAddress())
                .city(station.getCity())
                .state(station.getState())
                .latitude(station.getLatitude())
                .longitude(station.getLongitude())
                .operator(station.getOperator())
                .openingTime(station.getOpeningTime().format(TIME_FORMATTER))
                .closingTime(station.getClosingTime().format(TIME_FORMATTER))
                .status(station.getStatus().name())
                .approvalStatus(station.getApprovalStatus() != null ? station.getApprovalStatus().name() : ChargingStation.ApprovalStatus.APPROVED.name())
                .pricePerKwh(price)
                .rating(rating)
                .ownerId(station.getOwner() != null ? station.getOwner().getId() : null)
                .ownerName(station.getOwner() != null ? station.getOwner().getName() : null)
                .totalChargers(station.getChargers().size())
                .availableChargers(activeChargers.size())
                .chargerTypes(types)
                .maxPowerKw(maxPower)
                .build();
    }

    public StationDTO.StationResponse mapToResponse(ChargingStation station) {
        List<StationDTO.ChargerResponse> chargerResponses = station.getChargers().stream()
                .map(this::mapChargerToResponse)
                .collect(Collectors.toList());

        long activeCount = station.getChargers().stream()
                .filter(c -> c.getStatus() == Charger.ChargerStatus.ACTIVE)
                .count();

        Double avgRating = reviewRepository != null ? reviewRepository.getAverageRatingForStation(station.getId()) : null;
        double rating = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 4.8;
        double price = station.getPricePerKwh() != null ? station.getPricePerKwh() : 18.50;

        return StationDTO.StationResponse.builder()
                .id(station.getId())
                .name(station.getName())
                .address(station.getAddress())
                .city(station.getCity())
                .state(station.getState())
                .latitude(station.getLatitude())
                .longitude(station.getLongitude())
                .operator(station.getOperator())
                .openingTime(station.getOpeningTime().format(TIME_FORMATTER))
                .closingTime(station.getClosingTime().format(TIME_FORMATTER))
                .status(station.getStatus().name())
                .approvalStatus(station.getApprovalStatus() != null ? station.getApprovalStatus().name() : ChargingStation.ApprovalStatus.APPROVED.name())
                .pricePerKwh(price)
                .rating(rating)
                .ownerId(station.getOwner() != null ? station.getOwner().getId() : null)
                .ownerName(station.getOwner() != null ? station.getOwner().getName() : null)
                .imageUrl(station.getImageUrl())
                .totalChargers(station.getChargers().size())
                .activeChargers((int) activeCount)
                .chargers(chargerResponses)
                .build();
    }

    public StationDTO.ChargerResponse mapChargerToResponse(Charger charger) {
        return StationDTO.ChargerResponse.builder()
                .id(charger.getId())
                .stationId(charger.getStation() != null ? charger.getStation().getId() : null)
                .chargerNumber(charger.getChargerNumber())
                .chargerType(charger.getChargerType().name())
                .chargingSpeed(charger.getChargingSpeed())
                .powerKw(charger.getPowerKw())
                .status(charger.getStatus().name())
                .build();
    }
}

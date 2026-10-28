package com.evcharging.service;

import com.evcharging.dto.BookingDTO;
import com.evcharging.dto.OperatorDTO;
import com.evcharging.dto.StationDTO;
import com.evcharging.entity.*;
import com.evcharging.exception.BadRequestException;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OperatorService {

    private final UserRepository userRepository;
    private final ChargingStationRepository stationRepository;
    private final ChargerRepository chargerRepository;
    private final SlotRepository slotRepository;
    private final BookingRepository bookingRepository;
    private final StationService stationService;
    private final SlotService slotService;
    private final BookingService bookingService;

    @Transactional(readOnly = true)
    public OperatorDTO.OperatorStatusResponse getOperatorStatus(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        boolean approved = user.getRole() == User.Role.ADMIN ||
                (user.getRole() == User.Role.STATION_OPERATOR && user.getOperatorStatus() == User.OperatorStatus.APPROVED);

        String message;
        if (user.getRole() == User.Role.ADMIN) {
            message = "Administrator account (Full permissions granted).";
        } else if (user.getOperatorStatus() == User.OperatorStatus.APPROVED) {
            message = "Operator account approved. You have full access to manage your stations and slots.";
        } else if (user.getOperatorStatus() == User.OperatorStatus.REJECTED) {
            message = "Your operator application was not approved. Please contact platform administration.";
        } else {
            message = "Application under review. An administrator must approve your operator account before you can register stations.";
        }

        return OperatorDTO.OperatorStatusResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .operatorStatus(user.getOperatorStatus().name())
                .approved(approved)
                .message(message)
                .build();
    }

    @Transactional(readOnly = true)
    public OperatorDTO.OperatorStats getOperatorStats(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        List<ChargingStation> myStations = stationRepository.findByOwnerId(user.getId());
        long totalStations = myStations.size();
        long activeStations = myStations.stream()
                .filter(s -> s.getStatus() == ChargingStation.StationStatus.ACTIVE &&
                             s.getApprovalStatus() == ChargingStation.ApprovalStatus.APPROVED)
                .count();
        long pendingStations = myStations.stream()
                .filter(s -> s.getApprovalStatus() == ChargingStation.ApprovalStatus.PENDING)
                .count();

        long totalChargers = myStations.stream().mapToLong(s -> s.getChargers().size()).sum();
        long activeChargers = myStations.stream()
                .flatMap(s -> s.getChargers().stream())
                .filter(c -> c.getStatus() == Charger.ChargerStatus.ACTIVE)
                .count();

        long totalBookings = bookingRepository.countByStationOwnerId(user.getId());
        long todayBookings = bookingRepository.countByStationOwnerIdAndBookingDate(user.getId(), LocalDate.now());
        double estimatedRevenue = totalBookings * 240.0; // Benchmark approx ₹240 / session

        return OperatorDTO.OperatorStats.builder()
                .totalStations(totalStations)
                .activeStations(activeStations)
                .pendingStations(pendingStations)
                .totalChargers(totalChargers)
                .activeChargers(activeChargers)
                .totalBookings(totalBookings)
                .todayBookings(todayBookings)
                .estimatedRevenue(estimatedRevenue)
                .build();
    }

    @Transactional(readOnly = true)
    public List<StationDTO.StationResponse> getMyStations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        List<ChargingStation> stations = stationRepository.findByOwnerId(user.getId());
        return stations.stream().map(stationService::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public StationDTO.StationResponse createStation(String email, StationDTO.StationRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (user.getRole() != User.Role.ADMIN && user.getOperatorStatus() != User.OperatorStatus.APPROVED) {
            throw new BadRequestException("Your operator account is currently " + user.getOperatorStatus() +
                    ". You cannot submit stations until an administrator approves your account.");
        }

        ChargingStation.ApprovalStatus initialApproval = (user.getRole() == User.Role.ADMIN)
                ? ChargingStation.ApprovalStatus.APPROVED
                : ChargingStation.ApprovalStatus.PENDING;

        ChargingStation station = ChargingStation.builder()
                .name(request.getName().trim())
                .address(request.getAddress().trim())
                .city(request.getCity().trim())
                .state(request.getState().trim())
                .latitude(request.getLatitude() != null ? request.getLatitude() : 22.7196)
                .longitude(request.getLongitude() != null ? request.getLongitude() : 75.8577)
                .operator(request.getOperator() != null && !request.getOperator().trim().isEmpty() 
                        ? request.getOperator().trim() : user.getName())
                .openingTime(LocalTime.parse(request.getOpeningTime()))
                .closingTime(LocalTime.parse(request.getClosingTime()))
                .status(ChargingStation.StationStatus.ACTIVE)
                .approvalStatus(initialApproval)
                .owner(user)
                .imageUrl(request.getImageUrl())
                .build();

        ChargingStation saved = stationRepository.save(station);
        return stationService.mapToResponse(saved);
    }

    @Transactional
    public StationDTO.StationResponse updateStation(String email, Long id, StationDTO.StationRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        ChargingStation station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charging station not found with ID: " + id));

        if (user.getRole() != User.Role.ADMIN &&
                (station.getOwner() == null || !station.getOwner().getId().equals(user.getId()))) {
            throw new BadRequestException("Unauthorized: You can only edit charging stations assigned to your account.");
        }

        station.setName(request.getName().trim());
        station.setAddress(request.getAddress().trim());
        station.setCity(request.getCity().trim());
        station.setState(request.getState().trim());
        if (request.getLatitude() != null) station.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) station.setLongitude(request.getLongitude());
        if (request.getOpeningTime() != null) station.setOpeningTime(LocalTime.parse(request.getOpeningTime()));
        if (request.getClosingTime() != null) station.setClosingTime(LocalTime.parse(request.getClosingTime()));
        if (request.getImageUrl() != null) station.setImageUrl(request.getImageUrl());

        ChargingStation updated = stationRepository.save(station);
        return stationService.mapToResponse(updated);
    }

    @Transactional
    public StationDTO.ChargerResponse addCharger(String email, StationDTO.ChargerRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        ChargingStation station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("Charging station not found with ID: " + request.getStationId()));

        if (user.getRole() != User.Role.ADMIN &&
                (station.getOwner() == null || !station.getOwner().getId().equals(user.getId()))) {
            throw new BadRequestException("Unauthorized: You can only add chargers to stations assigned to your account.");
        }

        return stationService.addCharger(request);
    }

    @Transactional
    public void deleteCharger(String email, Long chargerId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        Charger charger = chargerRepository.findById(chargerId)
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found with ID: " + chargerId));

        ChargingStation station = charger.getStation();
        if (user.getRole() != User.Role.ADMIN &&
                (station.getOwner() == null || !station.getOwner().getId().equals(user.getId()))) {
            throw new BadRequestException("Unauthorized: You can only remove chargers from stations assigned to your account.");
        }

        stationService.deleteCharger(chargerId);
    }

    @Transactional
    public BookingDTO.SlotResponse createSlot(String email, BookingDTO.SlotCreateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        Charger charger = chargerRepository.findById(request.getChargerId())
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found with ID: " + request.getChargerId()));

        ChargingStation station = charger.getStation();
        if (user.getRole() != User.Role.ADMIN &&
                (station.getOwner() == null || !station.getOwner().getId().equals(user.getId()))) {
            throw new BadRequestException("Unauthorized: You can only create slots for chargers assigned to your account.");
        }

        return slotService.createSlot(request);
    }

    @Transactional(readOnly = true)
    public List<BookingDTO.BookingResponse> getOperatorBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        List<Booking> bookings = bookingRepository.findByStationOwnerId(user.getId());
        return bookings.stream().map(bookingService::mapToResponse).collect(Collectors.toList());
    }
}

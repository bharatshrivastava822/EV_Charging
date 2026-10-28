package com.evcharging.service;

import com.evcharging.dto.AuthDTO;
import com.evcharging.dto.BookingDTO;
import com.evcharging.entity.Booking;
import com.evcharging.entity.Charger;
import com.evcharging.entity.ChargingStation;
import com.evcharging.entity.User;
import com.evcharging.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ChargingStationRepository stationRepository;
    private final ChargerRepository chargerRepository;
    private final SlotRepository slotRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final BookingService bookingService;

    @Transactional(readOnly = true)
    public BookingDTO.AdminStats getDashboardStats() {
        LocalDate today = LocalDate.now();

        long totalStations = stationRepository.count();
        long activeStations = stationRepository.countByStatus(ChargingStation.StationStatus.ACTIVE);
        long totalChargers = chargerRepository.count();
        long activeChargers = chargerRepository.countByStatus(Charger.ChargerStatus.ACTIVE);
        long todayBookings = bookingRepository.findByBookingDate(today).size();
        long confirmedBookings = bookingRepository.countByStatus(Booking.BookingStatus.CONFIRMED);
        long cancelledBookings = bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED);
        long totalUsers = userRepository.count();
        long occupiedSlots = slotRepository.countBookedSlotsForDate(today);

        return BookingDTO.AdminStats.builder()
                .totalStations(totalStations)
                .activeStations(activeStations)
                .totalChargers(totalChargers)
                .activeChargers(activeChargers)
                .todayBookings(todayBookings)
                .confirmedBookings(confirmedBookings)
                .cancelledBookings(cancelledBookings)
                .totalUsers(totalUsers)
                .occupiedSlots(occupiedSlots)
                .build();
    }

    @Transactional(readOnly = true)
    public List<BookingDTO.BookingResponse> getAllBookings(String date, Long stationId, String status) {
        List<Booking> bookings;

        if (stationId != null) {
            bookings = bookingRepository.findByStationId(stationId);
        } else if (date != null && !date.trim().isEmpty()) {
            LocalDate localDate = LocalDate.parse(date.trim());
            bookings = bookingRepository.findByBookingDate(localDate);
        } else {
            bookings = bookingRepository.findAllOrderByCreatedAtDesc();
        }

        return bookings.stream()
                .filter(b -> {
                    if (status != null && !status.trim().isEmpty()) {
                        return b.getStatus().name().equalsIgnoreCase(status.trim());
                    }
                    return true;
                })
                .map(bookingService::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuthDTO.UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> AuthDTO.UserResponse.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .role(u.getRole().name())
                        .operatorStatus(u.getOperatorStatus() != null ? u.getOperatorStatus().name() : User.OperatorStatus.NONE.name())
                        .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuthDTO.UserResponse> getPendingOperators() {
        return userRepository.findByRoleAndOperatorStatus(User.Role.STATION_OPERATOR, User.OperatorStatus.PENDING)
                .stream()
                .map(u -> AuthDTO.UserResponse.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .role(u.getRole().name())
                        .operatorStatus(u.getOperatorStatus().name())
                        .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public AuthDTO.UserResponse reviewOperator(Long userId, AuthDTO.OperatorReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.evcharging.exception.ResourceNotFoundException("User not found with ID: " + userId));

        if (user.getRole() != User.Role.STATION_OPERATOR) {
            throw new com.evcharging.exception.BadRequestException("Only station operator accounts can be reviewed for operator status.");
        }

        User.OperatorStatus newStatus = User.OperatorStatus.valueOf(request.getStatus().trim().toUpperCase());
        user.setOperatorStatus(newStatus);
        User saved = userRepository.save(user);

        return AuthDTO.UserResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .phone(saved.getPhone())
                .role(saved.getRole().name())
                .operatorStatus(saved.getOperatorStatus().name())
                .createdAt(saved.getCreatedAt() != null ? saved.getCreatedAt().toString() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public List<com.evcharging.dto.StationDTO.StationResponse> getPendingStations() {
        return stationRepository.findByApprovalStatus(ChargingStation.ApprovalStatus.PENDING)
                .stream()
                .map(station -> com.evcharging.dto.StationDTO.StationResponse.builder()
                        .id(station.getId())
                        .name(station.getName())
                        .address(station.getAddress())
                        .city(station.getCity())
                        .state(station.getState())
                        .latitude(station.getLatitude())
                        .longitude(station.getLongitude())
                        .operator(station.getOperator())
                        .openingTime(station.getOpeningTime() != null ? station.getOpeningTime().toString() : "00:00")
                        .closingTime(station.getClosingTime() != null ? station.getClosingTime().toString() : "23:59")
                        .status(station.getStatus().name())
                        .approvalStatus(station.getApprovalStatus().name())
                        .ownerId(station.getOwner() != null ? station.getOwner().getId() : null)
                        .ownerName(station.getOwner() != null ? station.getOwner().getName() : "Unassigned")
                        .imageUrl(station.getImageUrl())
                        .totalChargers(station.getChargers() != null ? station.getChargers().size() : 0)
                        .activeChargers(station.getChargers() != null ? (int) station.getChargers().stream().filter(c -> c.getStatus() == Charger.ChargerStatus.ACTIVE).count() : 0)
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public com.evcharging.dto.StationDTO.StationResponse reviewStation(Long stationId, AuthDTO.StationReviewRequest request) {
        ChargingStation station = stationRepository.findById(stationId)
                .orElseThrow(() -> new com.evcharging.exception.ResourceNotFoundException("Charging station not found with ID: " + stationId));

        ChargingStation.ApprovalStatus newStatus = ChargingStation.ApprovalStatus.valueOf(request.getStatus().trim().toUpperCase());
        station.setApprovalStatus(newStatus);
        ChargingStation saved = stationRepository.save(station);

        return com.evcharging.dto.StationDTO.StationResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .address(saved.getAddress())
                .city(saved.getCity())
                .state(saved.getState())
                .latitude(saved.getLatitude())
                .longitude(saved.getLongitude())
                .operator(saved.getOperator())
                .openingTime(saved.getOpeningTime() != null ? saved.getOpeningTime().toString() : "00:00")
                .closingTime(saved.getClosingTime() != null ? saved.getClosingTime().toString() : "23:59")
                .status(saved.getStatus().name())
                .approvalStatus(saved.getApprovalStatus().name())
                .ownerId(saved.getOwner() != null ? saved.getOwner().getId() : null)
                .ownerName(saved.getOwner() != null ? saved.getOwner().getName() : "Unassigned")
                .imageUrl(saved.getImageUrl())
                .build();
    }
}

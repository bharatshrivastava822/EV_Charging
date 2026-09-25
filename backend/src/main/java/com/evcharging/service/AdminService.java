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
                        .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }
}

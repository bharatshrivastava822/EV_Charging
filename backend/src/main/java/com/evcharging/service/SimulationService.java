package com.evcharging.service;

import com.evcharging.dto.FeatureDTO;
import com.evcharging.entity.*;
import com.evcharging.exception.BadRequestException;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SimulationService {

    private final ChargingSessionRepository sessionRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public FeatureDTO.SessionResponse startSession(String userEmail, FeatureDTO.SessionStartRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + request.getBookingId()));

        if (!booking.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new BadRequestException("Unauthorized: You can only simulate charging sessions for your own bookings.");
        }

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new BadRequestException("Session simulation requires a CONFIRMED booking status.");
        }

        if (sessionRepository.existsByBookingId(booking.getId())) {
            ChargingSession existing = sessionRepository.findByBookingId(booking.getId()).get();
            return mapToResponse(existing);
        }

        int startPct = (request.getStartBatteryPct() != null && request.getStartBatteryPct() >= 0 && request.getStartBatteryPct() <= 100) 
                ? request.getStartBatteryPct() : 20;
        int targetPct = (request.getTargetBatteryPct() != null && request.getTargetBatteryPct() > startPct && request.getTargetBatteryPct() <= 100) 
                ? request.getTargetBatteryPct() : 80;

        Charger charger = booking.getCharger();
        double initialPower = charger.getPowerKw() != null ? charger.getPowerKw() : 50.0;

        ChargingSession session = ChargingSession.builder()
                .booking(booking)
                .user(user)
                .charger(charger)
                .startTime(LocalDateTime.now())
                .energyDeliveredKwh(0.0)
                .currentPowerKw(initialPower)
                .batteryStartPct(startPct)
                .batteryCurrentPct(startPct)
                .batteryTargetPct(targetPct)
                .estimatedCostInr(0.0)
                .status(ChargingSession.SessionStatus.IN_PROGRESS)
                .build();

        ChargingSession saved = sessionRepository.save(session);

        notificationService.createNotification(
                user,
                "Charging Session Active",
                String.format("Simulated session started for ref #%s at %s.", booking.getBookingReference(), booking.getStation().getName()),
                Notification.NotificationType.BOOKING
        );

        return mapToResponse(saved);
    }

    @Transactional
    public FeatureDTO.SessionResponse tickSimulation(Long sessionId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        ChargingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Charging session not found: " + sessionId));

        if (!session.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new BadRequestException("Unauthorized access to simulation session.");
        }

        if (session.getStatus() != ChargingSession.SessionStatus.IN_PROGRESS) {
            return mapToResponse(session);
        }

        // Advance simulation step (approx 5 kWh step / +8% battery per tick)
        double addedKwh = Math.round((session.getCharger().getPowerKw() * 0.08) * 100.0) / 100.0;
        double newDelivered = Math.round((session.getEnergyDeliveredKwh() + addedKwh) * 100.0) / 100.0;
        int newBattery = Math.min(session.getBatteryTargetPct(), session.getBatteryCurrentPct() + 7);

        double tariff = (session.getBooking().getStation().getPricePerKwh() != null) 
                ? session.getBooking().getStation().getPricePerKwh() : 18.50;
        double cost = Math.round((newDelivered * tariff) * 100.0) / 100.0;

        session.setEnergyDeliveredKwh(newDelivered);
        session.setBatteryCurrentPct(newBattery);
        session.setEstimatedCostInr(cost);

        if (newBattery >= session.getBatteryTargetPct()) {
            session.setStatus(ChargingSession.SessionStatus.COMPLETED);
            session.setEndTime(LocalDateTime.now());
            session.setCurrentPowerKw(0.0);

            notificationService.createNotification(
                    user,
                    "Charging Session Complete",
                    String.format("Session completed! %.1f kWh delivered. Total cost: ₹%.2f.", newDelivered, cost),
                    Notification.NotificationType.BOOKING
            );
        }

        ChargingSession saved = sessionRepository.save(session);
        return mapToResponse(saved);
    }

    @Transactional
    public FeatureDTO.SessionResponse stopSession(Long sessionId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        ChargingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Charging session not found: " + sessionId));

        if (!session.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new BadRequestException("Unauthorized access to simulation session.");
        }

        session.setStatus(ChargingSession.SessionStatus.STOPPED);
        session.setEndTime(LocalDateTime.now());
        session.setCurrentPowerKw(0.0);

        ChargingSession saved = sessionRepository.save(session);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public FeatureDTO.SessionResponse getSessionByBooking(Long bookingId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        ChargingSession session = sessionRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("No active simulation found for booking ID: " + bookingId));

        if (!session.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new BadRequestException("Unauthorized access to simulation session.");
        }

        return mapToResponse(session);
    }

    private FeatureDTO.SessionResponse mapToResponse(ChargingSession s) {
        return FeatureDTO.SessionResponse.builder()
                .id(s.getId())
                .bookingId(s.getBooking().getId())
                .bookingReference(s.getBooking().getBookingReference())
                .stationName(s.getBooking().getStation().getName())
                .chargerNumber(s.getCharger().getChargerNumber())
                .chargerType(s.getCharger().getChargerType().name())
                .powerKw(s.getCharger().getPowerKw())
                .startTime(s.getStartTime() != null ? s.getStartTime().toString() : null)
                .endTime(s.getEndTime() != null ? s.getEndTime().toString() : null)
                .energyDeliveredKwh(s.getEnergyDeliveredKwh())
                .currentPowerKw(s.getCurrentPowerKw())
                .batteryCurrentPct(s.getBatteryCurrentPct())
                .batteryTargetPct(s.getBatteryTargetPct())
                .estimatedCostInr(s.getEstimatedCostInr())
                .status(s.getStatus().name())
                .simulatorNotice("ChargerGo Virtual Telemetry Simulator Engine: Real-time mathematical simulation based on station tariff and connector power profile. No physical hardware connection.")
                .build();
    }
}

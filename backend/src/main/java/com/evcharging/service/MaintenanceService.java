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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceReportRepository maintenanceRepository;
    private final ChargerRepository chargerRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public FeatureDTO.MaintenanceResponse reportIssue(String userEmail, FeatureDTO.MaintenanceRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Charger charger = chargerRepository.findById(request.getChargerId())
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found with ID: " + request.getChargerId()));

        ChargingStation station = charger.getStation();

        // If user is operator, verify station ownership
        if (user.getRole() == User.Role.STATION_OPERATOR) {
            if (station.getOwner() == null || !station.getOwner().getId().equals(user.getId())) {
                throw new BadRequestException("Unauthorized: Operators can only report maintenance for assigned stations.");
            }
        }

        MaintenanceReport.Severity severity = MaintenanceReport.Severity.MEDIUM;
        if (request.getSeverity() != null) {
            try {
                severity = MaintenanceReport.Severity.valueOf(request.getSeverity().trim().toUpperCase());
            } catch (Exception ignored) {}
        }

        MaintenanceReport report = MaintenanceReport.builder()
                .station(station)
                .charger(charger)
                .reportedBy(user)
                .issueDescription(request.getIssueDescription().trim())
                .severity(severity)
                .status(MaintenanceReport.MaintenanceStatus.OPEN)
                .build();

        // Mark charger as MAINTENANCE to protect drivers from booking offline equipment
        charger.setStatus(Charger.ChargerStatus.MAINTENANCE);
        chargerRepository.save(charger);

        MaintenanceReport saved = maintenanceRepository.save(report);

        // Notify user/operator
        notificationService.createNotification(
                user,
                "Maintenance Ticket Created",
                String.format("Report #%d logged for %s (%s). Charger status set to MAINTENANCE.",
                        saved.getId(), station.getName(), charger.getChargerNumber()),
                Notification.NotificationType.MAINTENANCE
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FeatureDTO.MaintenanceResponse> getAllReports() {
        return maintenanceRepository.findAllByOrderByReportedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeatureDTO.MaintenanceResponse> getOperatorReports(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return maintenanceRepository.findByStationOwnerId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeatureDTO.MaintenanceResponse resolveIssue(Long reportId, String userEmail, FeatureDTO.MaintenanceResolutionRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        MaintenanceReport report = maintenanceRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance report not found: " + reportId));

        ChargingStation station = report.getStation();
        if (user.getRole() == User.Role.STATION_OPERATOR) {
            if (station.getOwner() == null || !station.getOwner().getId().equals(user.getId())) {
                throw new BadRequestException("Unauthorized: Operators can only manage maintenance for assigned stations.");
            }
        }

        MaintenanceReport.MaintenanceStatus newStatus = MaintenanceReport.MaintenanceStatus.RESOLVED;
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            try {
                newStatus = MaintenanceReport.MaintenanceStatus.valueOf(request.getStatus().trim().toUpperCase());
            } catch (Exception ignored) {}
        }

        report.setStatus(newStatus);
        report.setResolutionNotes(request.getResolutionNotes().trim());
        report.setResolvedAt(LocalDateTime.now());

        // Restore charger to ACTIVE once resolved or closed
        Charger charger = report.getCharger();
        charger.setStatus(Charger.ChargerStatus.ACTIVE);
        chargerRepository.save(charger);

        MaintenanceReport updated = maintenanceRepository.save(report);

        // Notify reporter
        if (report.getReportedBy() != null) {
            notificationService.createNotification(
                    report.getReportedBy(),
                    "Maintenance Issue Resolved",
                    String.format("Report #%d for %s (%s) has been resolved. Charger is now ACTIVE.",
                            report.getId(), station.getName(), charger.getChargerNumber()),
                    Notification.NotificationType.MAINTENANCE
            );
        }

        return mapToResponse(updated);
    }

    private FeatureDTO.MaintenanceResponse mapToResponse(MaintenanceReport r) {
        return FeatureDTO.MaintenanceResponse.builder()
                .id(r.getId())
                .stationId(r.getStation() != null ? r.getStation().getId() : null)
                .stationName(r.getStation() != null ? r.getStation().getName() : "Unknown Station")
                .chargerId(r.getCharger() != null ? r.getCharger().getId() : null)
                .chargerNumber(r.getCharger() != null ? r.getCharger().getChargerNumber() : "Unknown")
                .issueDescription(r.getIssueDescription())
                .severity(r.getSeverity().name())
                .status(r.getStatus().name())
                .reportedByName(r.getReportedBy() != null ? r.getReportedBy().getName() : "System")
                .resolutionNotes(r.getResolutionNotes())
                .reportedAt(r.getReportedAt() != null ? r.getReportedAt().toString() : null)
                .resolvedAt(r.getResolvedAt() != null ? r.getResolvedAt().toString() : null)
                .build();
    }
}


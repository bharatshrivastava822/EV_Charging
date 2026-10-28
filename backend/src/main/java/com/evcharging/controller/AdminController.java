package com.evcharging.controller;

import com.evcharging.dto.AuthDTO;
import com.evcharging.dto.BookingDTO;
import com.evcharging.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final com.evcharging.service.MaintenanceService maintenanceService;

    @GetMapping("/stats")
    public ResponseEntity<BookingDTO.AdminStats> getDashboardStats() {
        BookingDTO.AdminStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO.BookingResponse>> getAllBookings(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) Long stationId,
            @RequestParam(required = false) String status) {
        List<BookingDTO.BookingResponse> bookings = adminService.getAllBookings(date, stationId, status);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/users")
    public ResponseEntity<List<AuthDTO.UserResponse>> getAllUsers() {
        List<AuthDTO.UserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/operators/pending")
    public ResponseEntity<List<AuthDTO.UserResponse>> getPendingOperators() {
        List<AuthDTO.UserResponse> pending = adminService.getPendingOperators();
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/operators/{id}/review")
    public ResponseEntity<AuthDTO.UserResponse> reviewOperator(
            @PathVariable Long id,
            @RequestBody AuthDTO.OperatorReviewRequest request) {
        AuthDTO.UserResponse response = adminService.reviewOperator(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stations/pending")
    public ResponseEntity<List<com.evcharging.dto.StationDTO.StationResponse>> getPendingStations() {
        List<com.evcharging.dto.StationDTO.StationResponse> stations = adminService.getPendingStations();
        return ResponseEntity.ok(stations);
    }

    @PostMapping("/stations/{id}/review")
    public ResponseEntity<com.evcharging.dto.StationDTO.StationResponse> reviewStation(
            @PathVariable Long id,
            @RequestBody AuthDTO.StationReviewRequest request) {
        com.evcharging.dto.StationDTO.StationResponse response = adminService.reviewStation(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/maintenance")
    public ResponseEntity<List<com.evcharging.dto.FeatureDTO.MaintenanceResponse>> getAllMaintenanceReports() {
        List<com.evcharging.dto.FeatureDTO.MaintenanceResponse> reports = maintenanceService.getAllReports();
        return ResponseEntity.ok(reports);
    }

    @PostMapping("/maintenance/{id}/resolve")
    public ResponseEntity<com.evcharging.dto.FeatureDTO.MaintenanceResponse> resolveMaintenance(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody com.evcharging.dto.FeatureDTO.MaintenanceResolutionRequest request) {
        com.evcharging.dto.FeatureDTO.MaintenanceResponse response = maintenanceService.resolveIssue(id, authentication.getName(), request);
        return ResponseEntity.ok(response);
    }
}

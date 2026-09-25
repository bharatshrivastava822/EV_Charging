package com.evcharging.controller;

import com.evcharging.dto.AuthDTO;
import com.evcharging.dto.BookingDTO;
import com.evcharging.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

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
}

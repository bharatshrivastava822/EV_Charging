package com.evcharging.controller;

import com.evcharging.dto.BookingDTO;
import com.evcharging.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDTO.BookingResponse> createBooking(
            @Valid @RequestBody BookingDTO.BookingRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        BookingDTO.BookingResponse response = bookingService.createBooking(request, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO.BookingResponse>> getMyBookings(
            @RequestParam(required = false) String status,
            Authentication authentication) {
        String email = authentication.getName();
        List<BookingDTO.BookingResponse> bookings = bookingService.getUserBookings(email, status);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO.BookingResponse> getBookingById(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        boolean isAdmin = isAdmin(authentication);
        BookingDTO.BookingResponse booking = bookingService.getBookingById(id, email, isAdmin);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/ref/{reference}")
    public ResponseEntity<BookingDTO.BookingResponse> getBookingByReference(
            @PathVariable String reference,
            Authentication authentication) {
        String email = authentication.getName();
        boolean isAdmin = isAdmin(authentication);
        BookingDTO.BookingResponse booking = bookingService.getBookingByReference(reference, email, isAdmin);
        return ResponseEntity.ok(booking);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO.BookingResponse> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        boolean isAdmin = isAdmin(authentication);
        BookingDTO.BookingResponse booking = bookingService.cancelBooking(id, email, isAdmin);
        return ResponseEntity.ok(booking);
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
    }
}

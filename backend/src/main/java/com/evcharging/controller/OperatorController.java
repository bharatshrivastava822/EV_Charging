package com.evcharging.controller;

import com.evcharging.dto.BookingDTO;
import com.evcharging.dto.OperatorDTO;
import com.evcharging.dto.StationDTO;
import com.evcharging.service.OperatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operator")
@PreAuthorize("hasAnyRole('STATION_OPERATOR', 'ADMIN')")
@RequiredArgsConstructor
public class OperatorController {

    private final OperatorService operatorService;

    @GetMapping("/status")
    public ResponseEntity<OperatorDTO.OperatorStatusResponse> getOperatorStatus(Authentication authentication) {
        OperatorDTO.OperatorStatusResponse status = operatorService.getOperatorStatus(authentication.getName());
        return ResponseEntity.ok(status);
    }

    @GetMapping("/stats")
    public ResponseEntity<OperatorDTO.OperatorStats> getOperatorStats(Authentication authentication) {
        OperatorDTO.OperatorStats stats = operatorService.getOperatorStats(authentication.getName());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stations")
    public ResponseEntity<List<StationDTO.StationResponse>> getMyStations(Authentication authentication) {
        List<StationDTO.StationResponse> stations = operatorService.getMyStations(authentication.getName());
        return ResponseEntity.ok(stations);
    }

    @PostMapping("/stations")
    public ResponseEntity<StationDTO.StationResponse> createStation(
            Authentication authentication,
            @Valid @RequestBody StationDTO.StationRequest request) {
        StationDTO.StationResponse response = operatorService.createStation(authentication.getName(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/stations/{id}")
    public ResponseEntity<StationDTO.StationResponse> updateStation(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody StationDTO.StationRequest request) {
        StationDTO.StationResponse response = operatorService.updateStation(authentication.getName(), id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chargers")
    public ResponseEntity<StationDTO.ChargerResponse> addCharger(
            Authentication authentication,
            @Valid @RequestBody StationDTO.ChargerRequest request) {
        StationDTO.ChargerResponse response = operatorService.addCharger(authentication.getName(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/chargers/{id}")
    public ResponseEntity<Void> deleteCharger(
            Authentication authentication,
            @PathVariable Long id) {
        operatorService.deleteCharger(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/slots")
    public ResponseEntity<BookingDTO.SlotResponse> createSlot(
            Authentication authentication,
            @Valid @RequestBody BookingDTO.SlotCreateRequest request) {
        BookingDTO.SlotResponse response = operatorService.createSlot(authentication.getName(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO.BookingResponse>> getOperatorBookings(Authentication authentication) {
        List<BookingDTO.BookingResponse> bookings = operatorService.getOperatorBookings(authentication.getName());
        return ResponseEntity.ok(bookings);
    }
}

package com.evcharging.controller;

import com.evcharging.dto.BookingDTO;
import com.evcharging.entity.Slot;
import com.evcharging.service.SlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;

    @GetMapping("/charger/{chargerId}")
    public ResponseEntity<List<BookingDTO.SlotResponse>> getSlotsByCharger(
            @PathVariable Long chargerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<BookingDTO.SlotResponse> slots = slotService.getSlotsByChargerAndDate(chargerId, date);
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/station/{stationId}")
    public ResponseEntity<List<BookingDTO.SlotResponse>> getSlotsByStation(
            @PathVariable Long stationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<BookingDTO.SlotResponse> slots = slotService.getStationSlotsForDate(stationId, date);
        return ResponseEntity.ok(slots);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingDTO.SlotResponse> createSlot(@Valid @RequestBody BookingDTO.SlotCreateRequest request) {
        BookingDTO.SlotResponse response = slotService.createSlot(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingDTO.SlotResponse> updateSlotStatus(
            @PathVariable Long id,
            @RequestParam Slot.SlotStatus status) {
        BookingDTO.SlotResponse response = slotService.updateSlotStatus(id, status);
        return ResponseEntity.ok(response);
    }
}

package com.evcharging.controller;

import com.evcharging.dto.StationDTO;
import com.evcharging.service.StationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    @GetMapping
    public ResponseEntity<List<StationDTO.StationSummary>> getAllStations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String chargerType) {
        List<StationDTO.StationSummary> stations = stationService.getAllActiveStations(search, city, chargerType);
        return ResponseEntity.ok(stations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StationDTO.StationResponse> getStationById(@PathVariable Long id) {
        StationDTO.StationResponse station = stationService.getStationById(id);
        return ResponseEntity.ok(station);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StationDTO.StationResponse> createStation(@Valid @RequestBody StationDTO.StationRequest request) {
        StationDTO.StationResponse response = stationService.createStation(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StationDTO.StationResponse> updateStation(
            @PathVariable Long id,
            @Valid @RequestBody StationDTO.StationRequest request) {
        StationDTO.StationResponse response = stationService.updateStation(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStation(@PathVariable Long id) {
        stationService.deleteStation(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/chargers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StationDTO.ChargerResponse> addCharger(@Valid @RequestBody StationDTO.ChargerRequest request) {
        StationDTO.ChargerResponse response = stationService.addCharger(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/chargers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCharger(@PathVariable Long id) {
        stationService.deleteCharger(id);
        return ResponseEntity.noContent().build();
    }
}

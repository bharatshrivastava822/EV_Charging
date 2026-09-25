package com.evcharging.service;

import com.evcharging.dto.BookingDTO;
import com.evcharging.entity.Charger;
import com.evcharging.entity.Slot;
import com.evcharging.exception.BadRequestException;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.ChargerRepository;
import com.evcharging.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SlotService {

    private final SlotRepository slotRepository;
    private final ChargerRepository chargerRepository;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Transactional(readOnly = true)
    public List<BookingDTO.SlotResponse> getSlotsByChargerAndDate(Long chargerId, LocalDate date) {
        // First check if charger exists
        Charger charger = chargerRepository.findById(chargerId)
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found with ID: " + chargerId));

        List<Slot> slots = slotRepository.findByChargerIdAndSlotDate(chargerId, date);

        // If slots don't exist for this date, automatically generate default slots (6 AM to 11 PM, 30 min increments)
        if (slots.isEmpty() && charger.getStatus() == Charger.ChargerStatus.ACTIVE) {
            slots = generateDefaultSlotsForCharger(charger, date);
        }

        return slots.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<Slot> generateDefaultSlotsForCharger(Charger charger, LocalDate date) {
        List<Slot> generated = new ArrayList<>();
        LocalTime start = LocalTime.of(6, 0);
        LocalTime end = LocalTime.of(23, 0);

        LocalTime current = start;
        while (current.isBefore(end)) {
            LocalTime next = current.plusMinutes(30);
            Slot slot = Slot.builder()
                    .charger(charger)
                    .slotDate(date)
                    .startTime(current)
                    .endTime(next)
                    .status(Slot.SlotStatus.AVAILABLE)
                    .build();
            generated.add(slot);
            current = next;
        }

        return slotRepository.saveAll(generated);
    }

    @Transactional
    public BookingDTO.SlotResponse createSlot(BookingDTO.SlotCreateRequest request) {
        Charger charger = chargerRepository.findById(request.getChargerId())
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found with ID: " + request.getChargerId()));

        LocalDate date = LocalDate.parse(request.getSlotDate(), DATE_FORMATTER);
        LocalTime startTime = LocalTime.parse(request.getStartTime(), TIME_FORMATTER);
        LocalTime endTime = LocalTime.parse(request.getEndTime(), TIME_FORMATTER);

        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("Slot end time must be after start time");
        }

        Slot slot = Slot.builder()
                .charger(charger)
                .slotDate(date)
                .startTime(startTime)
                .endTime(endTime)
                .status(Slot.SlotStatus.AVAILABLE)
                .build();

        Slot saved = slotRepository.save(slot);
        return mapToResponse(saved);
    }

    @Transactional
    public BookingDTO.SlotResponse updateSlotStatus(Long slotId, Slot.SlotStatus status) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with ID: " + slotId));

        if (slot.getStatus() == Slot.SlotStatus.BOOKED && status != Slot.SlotStatus.AVAILABLE) {
            throw new BadRequestException("Cannot manually change status of an active booked slot without cancelling booking.");
        }

        slot.setStatus(status);
        Slot saved = slotRepository.save(slot);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingDTO.SlotResponse> getStationSlotsForDate(Long stationId, LocalDate date) {
        List<Slot> slots = slotRepository.findByStationIdAndDate(stationId, date);
        return slots.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BookingDTO.SlotResponse mapToResponse(Slot slot) {
        return BookingDTO.SlotResponse.builder()
                .id(slot.getId())
                .chargerId(slot.getCharger().getId())
                .chargerNumber(slot.getCharger().getChargerNumber())
                .chargerType(slot.getCharger().getChargerType().name())
                .powerKw(slot.getCharger().getPowerKw())
                .slotDate(slot.getSlotDate().format(DATE_FORMATTER))
                .startTime(slot.getStartTime().format(TIME_FORMATTER))
                .endTime(slot.getEndTime().format(TIME_FORMATTER))
                .status(slot.getStatus().name())
                .build();
    }
}

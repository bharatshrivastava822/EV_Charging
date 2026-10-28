package com.evcharging.service;

import com.evcharging.dto.BookingDTO;
import com.evcharging.entity.*;
import com.evcharging.exception.BadRequestException;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SlotRepository slotRepository;
    private final ChargingStationRepository stationRepository;
    private final ChargerRepository chargerRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy");
    private static final DateTimeFormatter RAW_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter REF_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final Random RANDOM = new Random();

    /**
     * Critical transaction-safe booking method with pessimistic locking to prevent race conditions.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingDTO.BookingResponse createBooking(BookingDTO.BookingRequest request, String userEmail) {
        // 1. Verify user is authenticated and exists
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 2. Verify station exists and is active
        ChargingStation station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("Charging station not found with ID: " + request.getStationId()));

        if (station.getStatus() != ChargingStation.StationStatus.ACTIVE) {
            throw new BadRequestException("This charging station is currently not operational.");
        }

        // 3. Verify charger exists and is active
        Charger charger = chargerRepository.findById(request.getChargerId())
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found with ID: " + request.getChargerId()));

        if (charger.getStatus() != Charger.ChargerStatus.ACTIVE) {
            throw new BadRequestException("This charger is currently not operational.");
        }

        if (!charger.getStation().getId().equals(station.getId())) {
            throw new BadRequestException("Selected charger does not belong to this station.");
        }

        // 4. Verify slot exists using PESSIMISTIC WRITE lock
        Slot slot = slotRepository.findByIdForUpdate(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with ID: " + request.getSlotId()));

        // 5. Verify slot belongs to selected charger
        if (!slot.getCharger().getId().equals(charger.getId())) {
            throw new BadRequestException("Selected slot does not belong to the chosen charger.");
        }

        // 6. Verify slot is AVAILABLE
        if (slot.getStatus() != Slot.SlotStatus.AVAILABLE) {
            throw new BadRequestException("Sorry, this charging slot has already been booked or is unavailable.");
        }

        // 7. Verify slot date/time is valid (not in the past)
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        if (slot.getSlotDate().isBefore(today) || (slot.getSlotDate().isEqual(today) && slot.getStartTime().isBefore(now))) {
            throw new BadRequestException("Cannot book a time slot in the past.");
        }

        // 8. Prevent duplicate booking of same slot
        if (bookingRepository.existsBySlotIdAndStatus(slot.getId(), Booking.BookingStatus.CONFIRMED)) {
            throw new BadRequestException("Sorry, this charging slot has already been booked.");
        }

        // 9. Update slot status to BOOKED
        slot.setStatus(Slot.SlotStatus.BOOKED);
        slotRepository.save(slot);

        // 10. Generate unique booking reference (EV-YYYYMMDD-XXXX)
        String bookingReference = generateUniqueBookingReference(slot.getSlotDate());

        // 11. Create and persist booking
        Booking booking = Booking.builder()
                .user(user)
                .station(station)
                .charger(charger)
                .slot(slot)
                .bookingReference(bookingReference)
                .bookingDate(slot.getSlotDate())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .status(Booking.BookingStatus.CONFIRMED)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        if (notificationService != null) {
            notificationService.createNotification(
                    user,
                    "Charging Slot Confirmed",
                    String.format("Slot confirmed at %s (%s). Reference: #%s. Date: %s at %s.",
                            station.getName(), charger.getChargerNumber(), bookingReference, slot.getSlotDate(), slot.getStartTime()),
                    com.evcharging.entity.Notification.NotificationType.BOOKING
            );
        }

        return mapToResponse(savedBooking);
    }

    @Transactional
    public BookingDTO.BookingResponse cancelBooking(Long bookingId, String userEmail, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        // 1. Verify booking belongs to user (unless admin)
        if (!isAdmin && !booking.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new BadRequestException("You do not have permission to cancel this booking.");
        }

        // 2. Verify booking is cancellable
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("This booking has already been cancelled.");
        }

        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel an already completed charging session.");
        }

        // 3. Mark booking as cancelled
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // 4. Release slot back to AVAILABLE
        Slot slot = booking.getSlot();
        if (slot != null) {
            slot.setStatus(Slot.SlotStatus.AVAILABLE);
            slotRepository.save(slot);
        }

        if (notificationService != null && booking.getUser() != null) {
            notificationService.createNotification(
                    booking.getUser(),
                    "Booking Cancelled",
                    String.format("Reservation #%s for %s has been cancelled and the slot released.",
                            booking.getBookingReference(), booking.getStation().getName()),
                    com.evcharging.entity.Notification.NotificationType.BOOKING
            );
        }

        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingDTO.BookingResponse> getUserBookings(String userEmail, String statusFilter) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Booking> bookings;
        if (statusFilter != null && !statusFilter.trim().isEmpty()) {
            Booking.BookingStatus status = Booking.BookingStatus.valueOf(statusFilter.toUpperCase());
            bookings = bookingRepository.findByUserIdAndStatusOrderByBookingDateAsc(user.getId(), status);
        } else {
            bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }

        return bookings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDTO.BookingResponse getBookingById(Long id, String userEmail, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!isAdmin && !booking.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new BadRequestException("You do not have permission to view this booking.");
        }

        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public BookingDTO.BookingResponse getBookingByReference(String reference, String userEmail, boolean isAdmin) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reference: " + reference));

        if (!isAdmin && !booking.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new BadRequestException("You do not have permission to view this booking.");
        }

        return mapToResponse(booking);
    }

    private String generateUniqueBookingReference(LocalDate date) {
        String dateStr = date.format(REF_DATE_FORMATTER);
        String ref;
        int attempts = 0;
        do {
            int randomNum = 1000 + RANDOM.nextInt(9000);
            ref = "CG-" + dateStr + "-" + randomNum;
            attempts++;
            if (attempts > 50) {
                ref = "CG-" + dateStr + "-" + System.currentTimeMillis() % 10000;
                break;
            }
        } while (bookingRepository.findByBookingReference(ref).isPresent());

        return ref;
    }

    public BookingDTO.BookingResponse mapToResponse(Booking booking) {
        return BookingDTO.BookingResponse.builder()
                .id(booking.getId())
                .bookingReference(booking.getBookingReference())
                .stationName(booking.getStation().getName())
                .stationAddress(booking.getStation().getAddress() + ", " + booking.getStation().getCity())
                .chargerNumber(booking.getCharger().getChargerNumber())
                .chargerType(booking.getCharger().getChargerType().name())
                .powerKw(booking.getCharger().getPowerKw())
                .bookingDate(booking.getBookingDate().format(DATE_FORMATTER))
                .startTime(booking.getStartTime().format(TIME_FORMATTER))
                .endTime(booking.getEndTime().format(TIME_FORMATTER))
                .status(booking.getStatus().name())
                .createdAt(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null)
                .cancelledAt(booking.getCancelledAt() != null ? booking.getCancelledAt().toString() : null)
                .stationId(booking.getStation().getId())
                .chargerId(booking.getCharger().getId())
                .slotId(booking.getSlot().getId())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .userEmail(booking.getUser().getEmail())
                .build();
    }
}

package com.evcharging;

import com.evcharging.dto.AuthDTO;
import com.evcharging.dto.BookingDTO;
import com.evcharging.dto.StationDTO;
import com.evcharging.entity.Booking;
import com.evcharging.entity.Charger;
import com.evcharging.entity.ChargingStation;
import com.evcharging.entity.Slot;
import com.evcharging.exception.BadRequestException;
import com.evcharging.repository.BookingRepository;
import com.evcharging.repository.ChargerRepository;
import com.evcharging.repository.ChargingStationRepository;
import com.evcharging.repository.SlotRepository;
import com.evcharging.service.AuthService;
import com.evcharging.service.BookingService;
import com.evcharging.service.SlotService;
import com.evcharging.service.StationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class EvChargingApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private StationService stationService;

    @Autowired
    private SlotService slotService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ChargingStationRepository stationRepository;

    @Autowired
    private ChargerRepository chargerRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private ChargingStation testStation;
    private Charger testCharger;
    private Slot testSlot;

    @BeforeEach
    void setUp() {
        testStation = ChargingStation.builder()
                .name("Test Highway Station")
                .address("Sector 18, Expressway")
                .city("Noida")
                .state("Uttar Pradesh")
                .operator("Test Operator")
                .openingTime(LocalTime.of(6, 0))
                .closingTime(LocalTime.of(23, 0))
                .status(ChargingStation.StationStatus.ACTIVE)
                .build();
        testStation = stationRepository.save(testStation);

        testCharger = Charger.builder()
                .station(testStation)
                .chargerNumber("T01")
                .chargerType(Charger.ChargerType.CCS2)
                .chargingSpeed("DC Fast")
                .powerKw(120.0)
                .status(Charger.ChargerStatus.ACTIVE)
                .build();
        testCharger = chargerRepository.save(testCharger);

        testSlot = Slot.builder()
                .charger(testCharger)
                .slotDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(10, 30))
                .status(Slot.SlotStatus.AVAILABLE)
                .build();
        testSlot = slotRepository.save(testSlot);
    }

    @Test
    @DisplayName("Test 1: User Registration")
    void testUserRegistration() {
        AuthDTO.RegisterRequest request = new AuthDTO.RegisterRequest();
        request.setName("Rahul Sharma");
        request.setEmail("rahul.test@example.com");
        request.setPassword("SecurePass@123");
        request.setPhone("9988776655");

        AuthDTO.AuthResponse response = authService.register(request);

        assertNotNull(response.getToken());
        assertEquals("rahul.test@example.com", response.getEmail());
        assertEquals("USER", response.getRole());
    }

    @Test
    @DisplayName("Test 2: User Login")
    void testUserLogin() {
        AuthDTO.RegisterRequest regReq = new AuthDTO.RegisterRequest();
        regReq.setName("Sneha Roy");
        regReq.setEmail("sneha.test@example.com");
        regReq.setPassword("Password@123");
        regReq.setPhone("9988776644");
        authService.register(regReq);

        AuthDTO.LoginRequest loginReq = new AuthDTO.LoginRequest();
        loginReq.setEmail("sneha.test@example.com");
        loginReq.setPassword("Password@123");

        AuthDTO.AuthResponse response = authService.login(loginReq);
        assertNotNull(response.getToken());
        assertEquals("sneha.test@example.com", response.getEmail());
    }

    @Test
    @DisplayName("Test 3: Station Retrieval and Search")
    void testStationRetrieval() {
        List<StationDTO.StationSummary> stations = stationService.getAllActiveStations(null, "Noida", null);
        assertFalse(stations.isEmpty());
        assertTrue(stations.stream().anyMatch(s -> s.getName().equals("Test Highway Station")));
    }

    @Test
    @DisplayName("Test 4: Slot Retrieval")
    void testSlotRetrieval() {
        List<BookingDTO.SlotResponse> slots = slotService.getSlotsByChargerAndDate(testCharger.getId(), LocalDate.now().plusDays(1));
        assertFalse(slots.isEmpty());
        assertTrue(slots.stream().anyMatch(s -> s.getStartTime().equals("10:00")));
    }

    @Test
    @DisplayName("Test 5 & 6: Successful Booking & Duplicate Booking Prevention")
    void testBookingAndDuplicatePrevention() {
        // Register user
        AuthDTO.RegisterRequest regReq = new AuthDTO.RegisterRequest("Vikram", "vikram@test.com", "Vikram@123", "9876500000");
        authService.register(regReq);

        BookingDTO.BookingRequest bookReq = new BookingDTO.BookingRequest(
                testStation.getId(),
                testCharger.getId(),
                testSlot.getId()
        );

        // 1. First booking should succeed
        BookingDTO.BookingResponse booking = bookingService.createBooking(bookReq, "vikram@test.com");
        assertNotNull(booking);
        assertNotNull(booking.getBookingReference());
        assertEquals("CONFIRMED", booking.getStatus());

        // Verify slot is now BOOKED
        Slot updatedSlot = slotRepository.findById(testSlot.getId()).orElseThrow();
        assertEquals(Slot.SlotStatus.BOOKED, updatedSlot.getStatus());

        // 2. Second booking of same slot should throw BadRequestException
        assertThrows(BadRequestException.class, () -> {
            bookingService.createBooking(bookReq, "vikram@test.com");
        });
    }

    @Test
    @DisplayName("Test 7: Booking Cancellation Releases Slot")
    void testBookingCancellation() {
        AuthDTO.RegisterRequest regReq = new AuthDTO.RegisterRequest("Ananya", "ananya@test.com", "Ananya@123", "9876500001");
        authService.register(regReq);

        BookingDTO.BookingRequest bookReq = new BookingDTO.BookingRequest(
                testStation.getId(),
                testCharger.getId(),
                testSlot.getId()
        );

        BookingDTO.BookingResponse booking = bookingService.createBooking(bookReq, "ananya@test.com");
        assertEquals("CONFIRMED", booking.getStatus());

        // Cancel the booking
        BookingDTO.BookingResponse cancelled = bookingService.cancelBooking(booking.getId(), "ananya@test.com", false);
        assertEquals("CANCELLED", cancelled.getStatus());

        // Slot must be AVAILABLE again
        Slot slotAfterCancel = slotRepository.findById(testSlot.getId()).orElseThrow();
        assertEquals(Slot.SlotStatus.AVAILABLE, slotAfterCancel.getStatus());
    }

    @Test
    @DisplayName("Test 8: Admin Station Creation")
    void testAdminStationCreation() {
        StationDTO.StationRequest req = new StationDTO.StationRequest();
        req.setName("Admin Created Station");
        req.setAddress("Ring Road Phase 2");
        req.setCity("Indore");
        req.setState("Madhya Pradesh");
        req.setOpeningTime("06:00");
        req.setClosingTime("22:00");
        req.setStatus("ACTIVE");

        StationDTO.StationResponse created = stationService.createStation(req);
        assertNotNull(created.getId());
        assertEquals("Admin Created Station", created.getName());
    }
}

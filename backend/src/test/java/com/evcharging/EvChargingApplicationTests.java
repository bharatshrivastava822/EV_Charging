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

    @Autowired
    private com.evcharging.repository.UserRepository userRepository;

    @Autowired
    private com.evcharging.service.OperatorService operatorService;

    @Autowired
    private com.evcharging.service.AdminService adminService;

    @Autowired
    private com.evcharging.service.CostEstimatorService costEstimatorService;

    @Autowired
    private com.evcharging.service.RecommendationService recommendationService;

    @Autowired
    private com.evcharging.service.MaintenanceService maintenanceService;

    @Autowired
    private com.evcharging.service.SimulationService simulationService;

    @Autowired
    private com.evcharging.service.NotificationService notificationService;

    @Autowired
    private com.evcharging.service.ReviewService reviewService;

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
        assertEquals("DRIVER", response.getRole());
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

    @Test
    @DisplayName("Test 9: Past Slot Booking Rejected")
    void testPastSlotBookingRejected() {
        AuthDTO.RegisterRequest regReq = new AuthDTO.RegisterRequest("Rohan", "rohan@test.com", "Rohan@123", "9876500002");
        authService.register(regReq);

        // Create a slot in the past (yesterday)
        Slot pastSlot = Slot.builder()
                .charger(testCharger)
                .slotDate(LocalDate.now().minusDays(1))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(10, 30))
                .status(Slot.SlotStatus.AVAILABLE)
                .build();
        pastSlot = slotRepository.save(pastSlot);

        BookingDTO.BookingRequest bookReq = new BookingDTO.BookingRequest(
                testStation.getId(),
                testCharger.getId(),
                pastSlot.getId()
        );

        assertThrows(BadRequestException.class, () -> {
            bookingService.createBooking(bookReq, "rohan@test.com");
        });
    }

    @Test
    @DisplayName("Test 10: Booking Reference Access Control")
    void testBookingReferenceAccessControl() {
        AuthDTO.RegisterRequest userAReq = new AuthDTO.RegisterRequest("User A", "usera@test.com", "UserA@123", "9876500003");
        authService.register(userAReq);

        AuthDTO.RegisterRequest userBReq = new AuthDTO.RegisterRequest("User B", "userb@test.com", "UserB@123", "9876500004");
        authService.register(userBReq);

        BookingDTO.BookingRequest bookReq = new BookingDTO.BookingRequest(
                testStation.getId(),
                testCharger.getId(),
                testSlot.getId()
        );

        BookingDTO.BookingResponse booking = bookingService.createBooking(bookReq, "usera@test.com");
        String ref = booking.getBookingReference();

        // 1. Owner can access
        BookingDTO.BookingResponse ownerView = bookingService.getBookingByReference(ref, "usera@test.com", false);
        assertEquals(booking.getId(), ownerView.getId());

        // 2. Admin can access
        BookingDTO.BookingResponse adminView = bookingService.getBookingByReference(ref, "admin@test.com", true);
        assertEquals(booking.getId(), adminView.getId());

        // 3. Unauthorized user cannot access
        assertThrows(BadRequestException.class, () -> {
            bookingService.getBookingByReference(ref, "userb@test.com", false);
        });
    }

    @Test
    @DisplayName("Test 11: Station Operator Registration & Admin Approval Workflow")
    void testOperatorRegistrationAndApprovalWorkflow() {
        // 1. Register as Station Operator
        AuthDTO.RegisterRequest opReq = new AuthDTO.RegisterRequest(
                "Kunal Operators", "kunal@testops.com", "Pass@123", "9876543299", "STATION_OPERATOR");
        AuthDTO.AuthResponse opResp = authService.register(opReq);

        assertEquals("STATION_OPERATOR", opResp.getRole());
        assertEquals("PENDING", opResp.getOperatorStatus());

        // 2. Pending operator cannot create station
        StationDTO.StationRequest newStation = new StationDTO.StationRequest();
        newStation.setName("Kunal Hub Jaipur");
        newStation.setAddress("MI Road");
        newStation.setCity("Jaipur");
        newStation.setState("Rajasthan");
        newStation.setOpeningTime("06:00");
        newStation.setClosingTime("22:00");

        assertThrows(BadRequestException.class, () -> {
            operatorService.createStation("kunal@testops.com", newStation);
        });

        // 3. Admin approves operator
        AuthDTO.OperatorReviewRequest approveReq = new AuthDTO.OperatorReviewRequest("APPROVED", "Verified identity");
        adminService.reviewOperator(opResp.getId(), approveReq);

        // 4. Approved operator now successfully submits station (starts PENDING admin approval)
        StationDTO.StationResponse created = operatorService.createStation("kunal@testops.com", newStation);
        assertNotNull(created.getId());
        assertEquals("PENDING", created.getApprovalStatus());

        // 5. Driver cannot see pending station in public station search
        List<StationDTO.StationSummary> publicStations = stationService.getAllActiveStations(null, "Jaipur", null);
        assertTrue(publicStations.isEmpty());

        // 6. Admin approves station
        AuthDTO.StationReviewRequest approveStationReq = new AuthDTO.StationReviewRequest("APPROVED", "Site inspected");
        adminService.reviewStation(created.getId(), approveStationReq);

        // 7. Driver now sees approved station
        List<StationDTO.StationSummary> publicAfterApproval = stationService.getAllActiveStations(null, "Jaipur", null);
        assertEquals(1, publicAfterApproval.size());
        assertEquals("Kunal Hub Jaipur", publicAfterApproval.get(0).getName());
    }

    @Test
    @DisplayName("Test 12: Admin Self-Registration Prevention")
    void testAdminSelfRegistrationForbidden() {
        AuthDTO.RegisterRequest req = new AuthDTO.RegisterRequest(
                "Fake Admin", "fakeadmin@hacker.com", "Hacked@123", "9876543200", "ADMIN");

        assertThrows(BadRequestException.class, () -> {
            authService.register(req);
        });
    }

    @Test
    @DisplayName("Test 13: Charging Cost Estimator Calculation")
    void testCostEstimatorCalculation() {
        com.evcharging.dto.FeatureDTO.CostEstimateRequest req = new com.evcharging.dto.FeatureDTO.CostEstimateRequest();
        req.setEnergyKwh(30.0);
        req.setPricePerKwh(18.0);
        req.setServiceFee(15.0);

        com.evcharging.dto.FeatureDTO.CostEstimateResponse res = costEstimatorService.calculateEstimate(req);
        assertEquals(540.0, res.getBaseCostInr());
        assertEquals(15.0, res.getServiceFeeInr());
        assertEquals(555.0, res.getTotalEstimatedCostInr());
        assertNotNull(res.getDisclaimer());

        // Negative value test
        com.evcharging.dto.FeatureDTO.CostEstimateRequest invalidReq = new com.evcharging.dto.FeatureDTO.CostEstimateRequest();
        invalidReq.setEnergyKwh(-10.0);
        assertThrows(BadRequestException.class, () -> costEstimatorService.calculateEstimate(invalidReq));
    }

    @Test
    @DisplayName("Test 14: Smart Station Recommendations")
    void testSmartRecommendationEngine() {
        List<com.evcharging.dto.FeatureDTO.StationRecommendation> recs = recommendationService.getRecommendations(22.7533, 75.8937, null, 5);
        assertNotNull(recs);
        assertFalse(recs.isEmpty());
        assertTrue(recs.get(0).getScore() > 0);
        assertNotNull(recs.get(0).getPrimaryReason());
    }

    @Test
    @DisplayName("Test 15: Charger Maintenance Reporting & Status Restoration")
    void testMaintenanceWorkflow() {
        com.evcharging.dto.FeatureDTO.MaintenanceRequest req = new com.evcharging.dto.FeatureDTO.MaintenanceRequest();
        req.setChargerId(testCharger.getId());
        req.setIssueDescription("Display panel flicker and loose gun pin");
        req.setSeverity("HIGH");

        com.evcharging.dto.FeatureDTO.MaintenanceResponse report = maintenanceService.reportIssue("admin@evcharge.in", req);
        assertNotNull(report.getId());
        assertEquals("OPEN", report.getStatus());

        // Verify charger status changed to MAINTENANCE
        Charger c = chargerRepository.findById(testCharger.getId()).get();
        assertEquals(Charger.ChargerStatus.MAINTENANCE, c.getStatus());

        // Resolve maintenance
        com.evcharging.dto.FeatureDTO.MaintenanceResolutionRequest resolveReq = new com.evcharging.dto.FeatureDTO.MaintenanceResolutionRequest();
        resolveReq.setResolutionNotes("Replaced gun pin and rebooted telematics board");
        resolveReq.setStatus("RESOLVED");

        com.evcharging.dto.FeatureDTO.MaintenanceResponse resolved = maintenanceService.resolveIssue(report.getId(), "admin@evcharge.in", resolveReq);
        assertEquals("RESOLVED", resolved.getStatus());

        // Verify charger restored to ACTIVE
        Charger cRestored = chargerRepository.findById(testCharger.getId()).get();
        assertEquals(Charger.ChargerStatus.ACTIVE, cRestored.getStatus());
    }

    @Test
    @DisplayName("Test 16: Live Simulation Engine Session Lifecycle")
    void testChargingSessionSimulationEngine() {
        AuthDTO.RegisterRequest drvReq = new AuthDTO.RegisterRequest("Sim Driver", "simdriver@test.com", "Pass@123", "9876543277");
        authService.register(drvReq);

        BookingDTO.BookingRequest bookReq = new BookingDTO.BookingRequest(testStation.getId(), testCharger.getId(), testSlot.getId());
        BookingDTO.BookingResponse booking = bookingService.createBooking(bookReq, "simdriver@test.com");

        // Start session
        com.evcharging.dto.FeatureDTO.SessionStartRequest startReq = new com.evcharging.dto.FeatureDTO.SessionStartRequest();
        startReq.setBookingId(booking.getId());
        startReq.setStartBatteryPct(25);
        startReq.setTargetBatteryPct(35);

        com.evcharging.dto.FeatureDTO.SessionResponse session = simulationService.startSession("simdriver@test.com", startReq);
        assertEquals("IN_PROGRESS", session.getStatus());
        assertEquals(25, session.getBatteryCurrentPct());

        // Tick simulation
        com.evcharging.dto.FeatureDTO.SessionResponse ticked = simulationService.tickSimulation(session.getId(), "simdriver@test.com");
        assertTrue(ticked.getBatteryCurrentPct() > 25);
        assertTrue(ticked.getEnergyDeliveredKwh() > 0);

        // Stop session
        com.evcharging.dto.FeatureDTO.SessionResponse stopped = simulationService.stopSession(session.getId(), "simdriver@test.com");
        assertEquals("STOPPED", stopped.getStatus());
    }

    @Test
    @DisplayName("Test 17: In-App Notification Dispatch & Read Management")
    void testNotificationDispatchAndReadStatus() {
        com.evcharging.entity.User user = userRepository.findByEmail("admin@evcharge.in").get();
        notificationService.createNotification(user, "System Test", "Test alert content", com.evcharging.entity.Notification.NotificationType.SYSTEM);

        List<com.evcharging.dto.FeatureDTO.NotificationResponse> notifs = notificationService.getUserNotifications("admin@evcharge.in");
        assertFalse(notifs.isEmpty());

        long unreadBefore = notificationService.getUnreadCount("admin@evcharge.in");
        assertTrue(unreadBefore > 0);

        notificationService.markAllAsRead("admin@evcharge.in");
        long unreadAfter = notificationService.getUnreadCount("admin@evcharge.in");
        assertEquals(0, unreadAfter);
    }
}

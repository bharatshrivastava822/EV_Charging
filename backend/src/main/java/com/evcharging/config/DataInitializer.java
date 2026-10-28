package com.evcharging.config;

import com.evcharging.entity.*;
import com.evcharging.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ChargingStationRepository stationRepository;
    private final ChargerRepository chargerRepository;
    private final SlotRepository slotRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database already contains data, skipping auto-seed.");
            return;
        }

        log.info("Initializing EV Charging Database with realistic seed data...");

        // 1. Users
        User admin = User.builder()
                .name("Station Admin")
                .email("admin@evcharge.in")
                .phone("9876543210")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .role(User.Role.ADMIN)
                .operatorStatus(User.OperatorStatus.NONE)
                .build();
        admin = userRepository.save(admin);

        User operatorApproved = User.builder()
                .name("Vikram Malhotra (Station Partner)")
                .email("operator@evcharge.in")
                .phone("9876543220")
                .passwordHash(passwordEncoder.encode("Operator@123"))
                .role(User.Role.STATION_OPERATOR)
                .operatorStatus(User.OperatorStatus.APPROVED)
                .build();
        operatorApproved = userRepository.save(operatorApproved);

        User operatorPending = User.builder()
                .name("Rahul Verma (New Partner)")
                .email("pending.operator@evcharge.in")
                .phone("9876543221")
                .passwordHash(passwordEncoder.encode("Operator@123"))
                .role(User.Role.STATION_OPERATOR)
                .operatorStatus(User.OperatorStatus.PENDING)
                .build();
        operatorPending = userRepository.save(operatorPending);

        User aryan = User.builder()
                .name("Aryan Sharma")
                .email("aryan@example.com")
                .phone("9876543211")
                .passwordHash(passwordEncoder.encode("User@123"))
                .role(User.Role.DRIVER)
                .operatorStatus(User.OperatorStatus.NONE)
                .build();
        userRepository.save(aryan);

        User priya = User.builder()
                .name("Priya Patel")
                .email("priya@example.com")
                .phone("9876543212")
                .passwordHash(passwordEncoder.encode("User@123"))
                .role(User.Role.DRIVER)
                .operatorStatus(User.OperatorStatus.NONE)
                .build();
        userRepository.save(priya);

        // 2. Stations
        ChargingStation s1 = ChargingStation.builder()
                .name("GreenCharge Vijay Nagar")
                .address("12, Vijay Nagar Square, AB Road")
                .city("Indore")
                .state("Madhya Pradesh")
                .latitude(22.7533)
                .longitude(75.8937)
                .operator("GreenCharge India")
                .openingTime(LocalTime.of(6, 0))
                .closingTime(LocalTime.of(23, 0))
                .status(ChargingStation.StationStatus.ACTIVE)
                .approvalStatus(ChargingStation.ApprovalStatus.APPROVED)
                .owner(operatorApproved)
                .build();
        s1 = stationRepository.save(s1);

        ChargingStation s2 = ChargingStation.builder()
                .name("Indore EV Hub")
                .address("Plot 45, Scheme No. 78, Near Bombay Hospital")
                .city("Indore")
                .state("Madhya Pradesh")
                .latitude(22.7196)
                .longitude(75.8577)
                .operator("Tata Power EV")
                .openingTime(LocalTime.of(0, 0))
                .closingTime(LocalTime.of(23, 59))
                .status(ChargingStation.StationStatus.ACTIVE)
                .approvalStatus(ChargingStation.ApprovalStatus.APPROVED)
                .owner(operatorApproved)
                .build();
        s2 = stationRepository.save(s2);

        ChargingStation s3 = ChargingStation.builder()
                .name("Bhopal Central Charging Point")
                .address("MP Nagar Zone-II, Near DB Mall")
                .city("Bhopal")
                .state("Madhya Pradesh")
                .latitude(23.2332)
                .longitude(77.4350)
                .operator("EESL Energy")
                .openingTime(LocalTime.of(7, 0))
                .closingTime(LocalTime.of(22, 0))
                .status(ChargingStation.StationStatus.ACTIVE)
                .approvalStatus(ChargingStation.ApprovalStatus.APPROVED)
                .owner(admin)
                .build();
        s3 = stationRepository.save(s3);

        ChargingStation s4 = ChargingStation.builder()
                .name("Ujjain Highway EV Station")
                .address("Indore-Ujjain Highway, Near Toll Plaza")
                .city("Ujjain")
                .state("Madhya Pradesh")
                .latitude(23.1793)
                .longitude(75.7849)
                .operator("Fortum Charge & Drive")
                .openingTime(LocalTime.of(5, 0))
                .closingTime(LocalTime.of(23, 0))
                .status(ChargingStation.StationStatus.ACTIVE)
                .approvalStatus(ChargingStation.ApprovalStatus.APPROVED)
                .owner(admin)
                .build();
        s4 = stationRepository.save(s4);

        ChargingStation s5 = ChargingStation.builder()
                .name("Bengaluru Tech Park Charging Hub")
                .address("Whitefield Main Road, ITPL Gate 2")
                .city("Bengaluru")
                .state("Karnataka")
                .latitude(12.9698)
                .longitude(77.7500)
                .operator("Ather Grid")
                .openingTime(LocalTime.of(6, 0))
                .closingTime(LocalTime.of(23, 0))
                .status(ChargingStation.StationStatus.ACTIVE)
                .approvalStatus(ChargingStation.ApprovalStatus.APPROVED)
                .owner(admin)
                .build();
        s5 = stationRepository.save(s5);

        // 3. Chargers
        List<Charger> chargers = new ArrayList<>();
        // S1
        chargers.add(Charger.builder().station(s1).chargerNumber("C01").chargerType(Charger.ChargerType.CCS2).chargingSpeed("DC Fast").powerKw(60.0).status(Charger.ChargerStatus.ACTIVE).build());
        chargers.add(Charger.builder().station(s1).chargerNumber("C02").chargerType(Charger.ChargerType.CCS2).chargingSpeed("DC Fast").powerKw(120.0).status(Charger.ChargerStatus.ACTIVE).build());
        chargers.add(Charger.builder().station(s1).chargerNumber("C03").chargerType(Charger.ChargerType.TYPE2).chargingSpeed("AC Slow").powerKw(22.0).status(Charger.ChargerStatus.ACTIVE).build());
        chargers.add(Charger.builder().station(s1).chargerNumber("C04").chargerType(Charger.ChargerType.CHAdeMO).chargingSpeed("DC Fast").powerKw(50.0).status(Charger.ChargerStatus.ACTIVE).build());

        // S2
        chargers.add(Charger.builder().station(s2).chargerNumber("C01").chargerType(Charger.ChargerType.CCS2).chargingSpeed("DC Fast").powerKw(120.0).status(Charger.ChargerStatus.ACTIVE).build());
        chargers.add(Charger.builder().station(s2).chargerNumber("C02").chargerType(Charger.ChargerType.CCS2).chargingSpeed("DC Fast").powerKw(120.0).status(Charger.ChargerStatus.ACTIVE).build());
        chargers.add(Charger.builder().station(s2).chargerNumber("C03").chargerType(Charger.ChargerType.TYPE2).chargingSpeed("AC Slow").powerKw(22.0).status(Charger.ChargerStatus.ACTIVE).build());
        chargers.add(Charger.builder().station(s2).chargerNumber("C04").chargerType(Charger.ChargerType.DC_FAST).chargingSpeed("Ultra Fast").powerKw(150.0).status(Charger.ChargerStatus.ACTIVE).build());

        // S3
        chargers.add(Charger.builder().station(s3).chargerNumber("C01").chargerType(Charger.ChargerType.CCS2).chargingSpeed("DC Fast").powerKw(60.0).status(Charger.ChargerStatus.ACTIVE).build());
        chargers.add(Charger.builder().station(s3).chargerNumber("C02").chargerType(Charger.ChargerType.TYPE2).chargingSpeed("AC Slow").powerKw(22.0).status(Charger.ChargerStatus.ACTIVE).build());

        // S4
        chargers.add(Charger.builder().station(s4).chargerNumber("C01").chargerType(Charger.ChargerType.CCS2).chargingSpeed("DC Fast").powerKw(120.0).status(Charger.ChargerStatus.ACTIVE).build());
        chargers.add(Charger.builder().station(s4).chargerNumber("C02").chargerType(Charger.ChargerType.CHAdeMO).chargingSpeed("DC Fast").powerKw(50.0).status(Charger.ChargerStatus.ACTIVE).build());

        // S5
        chargers.add(Charger.builder().station(s5).chargerNumber("C01").chargerType(Charger.ChargerType.CCS2).chargingSpeed("DC Fast").powerKw(120.0).status(Charger.ChargerStatus.ACTIVE).build());
        chargers.add(Charger.builder().station(s5).chargerNumber("C02").chargerType(Charger.ChargerType.TYPE2).chargingSpeed("AC Slow").powerKw(22.0).status(Charger.ChargerStatus.ACTIVE).build());
        chargers.add(Charger.builder().station(s5).chargerNumber("C03").chargerType(Charger.ChargerType.DC_FAST).chargingSpeed("Ultra Fast").powerKw(150.0).status(Charger.ChargerStatus.ACTIVE).build());

        List<Charger> savedChargers = chargerRepository.saveAll(chargers);

        // 4. Slots for next 5 days
        LocalDate today = LocalDate.now();
        List<Slot> initialSlots = new ArrayList<>();

        for (Charger ch : savedChargers) {
            for (int day = 0; day < 5; day++) {
                LocalDate date = today.plusDays(day);
                for (int hour = 7; hour <= 21; hour += 2) {
                    initialSlots.add(Slot.builder()
                            .charger(ch)
                            .slotDate(date)
                            .startTime(LocalTime.of(hour, 0))
                            .endTime(LocalTime.of(hour, 30))
                            .status(Slot.SlotStatus.AVAILABLE)
                            .build());
                    initialSlots.add(Slot.builder()
                            .charger(ch)
                            .slotDate(date)
                            .startTime(LocalTime.of(hour, 30))
                            .endTime(LocalTime.of(hour + 1, 0))
                            .status(Slot.SlotStatus.AVAILABLE)
                            .build());
                }
            }
        }

        slotRepository.saveAll(initialSlots);
        log.info("Database seeding completed with {} chargers and {} initial slots.", savedChargers.size(), initialSlots.size());
    }
}

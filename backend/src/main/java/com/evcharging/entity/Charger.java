package com.evcharging.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chargers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Charger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private ChargingStation station;

    @Column(name = "charger_number", nullable = false, length = 10)
    private String chargerNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "charger_type", nullable = false)
    private ChargerType chargerType;

    @Column(name = "charging_speed", length = 50)
    private String chargingSpeed;

    @Column(name = "power_kw", nullable = false)
    private Double powerKw;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChargerStatus status = ChargerStatus.ACTIVE;

    @OneToMany(mappedBy = "charger", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Slot> slots = new ArrayList<>();

    public enum ChargerType {
        CCS2, CHAdeMO, TYPE2, AC, DC_FAST
    }

    public enum ChargerStatus {
        ACTIVE, INACTIVE, MAINTENANCE
    }
}

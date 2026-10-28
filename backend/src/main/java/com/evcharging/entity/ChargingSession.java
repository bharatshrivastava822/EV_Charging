package com.evcharging.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "charging_sessions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ChargingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charger_id", nullable = false)
    private Charger charger;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "energy_delivered_kwh")
    @Builder.Default
    private Double energyDeliveredKwh = 0.0;

    @Column(name = "current_power_kw")
    @Builder.Default
    private Double currentPowerKw = 0.0;

    @Column(name = "battery_start_pct")
    @Builder.Default
    private Integer batteryStartPct = 20;

    @Column(name = "battery_current_pct")
    @Builder.Default
    private Integer batteryCurrentPct = 20;

    @Column(name = "battery_target_pct")
    @Builder.Default
    private Integer batteryTargetPct = 80;

    @Column(name = "estimated_cost_inr")
    @Builder.Default
    private Double estimatedCostInr = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SessionStatus status = SessionStatus.IN_PROGRESS;

    public enum SessionStatus {
        IN_PROGRESS, COMPLETED, STOPPED
    }
}

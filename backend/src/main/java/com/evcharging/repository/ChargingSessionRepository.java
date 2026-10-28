package com.evcharging.repository;

import com.evcharging.entity.ChargingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Long> {
    Optional<ChargingSession> findByBookingId(Long bookingId);
    List<ChargingSession> findByUserIdOrderByStartTimeDesc(Long userId);
    boolean existsByBookingId(Long bookingId);
}

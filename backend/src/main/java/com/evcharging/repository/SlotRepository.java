package com.evcharging.repository;

import com.evcharging.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SlotRepository extends JpaRepository<Slot, Long> {
    
    List<Slot> findByChargerIdAndSlotDate(Long chargerId, LocalDate slotDate);
    
    List<Slot> findByChargerIdAndSlotDateAndStatus(Long chargerId, LocalDate slotDate, Slot.SlotStatus status);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Slot s WHERE s.id = :id")
    Optional<Slot> findByIdForUpdate(@Param("id") Long id);
    
    @Query("SELECT s FROM Slot s WHERE s.charger.station.id = :stationId AND s.slotDate = :date")
    List<Slot> findByStationIdAndDate(@Param("stationId") Long stationId, @Param("date") LocalDate date);
    
    @Query("SELECT COUNT(s) FROM Slot s WHERE s.charger.station.id = :stationId AND s.slotDate = :date AND s.status = :status")
    long countByStationAndDateAndStatus(@Param("stationId") Long stationId, @Param("date") LocalDate date, @Param("status") Slot.SlotStatus status);

    @Query("SELECT COUNT(s) FROM Slot s WHERE s.slotDate = :date AND s.status = 'BOOKED'")
    long countBookedSlotsForDate(@Param("date") LocalDate date);
}

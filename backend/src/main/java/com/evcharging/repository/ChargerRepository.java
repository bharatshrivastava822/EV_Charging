package com.evcharging.repository;

import com.evcharging.entity.Charger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChargerRepository extends JpaRepository<Charger, Long> {
    List<Charger> findByStationId(Long stationId);
    List<Charger> findByStationIdAndStatus(Long stationId, Charger.ChargerStatus status);
    long countByStationIdAndStatus(Long stationId, Charger.ChargerStatus status);
    long countByStatus(Charger.ChargerStatus status);
}

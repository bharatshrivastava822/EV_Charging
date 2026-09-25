package com.evcharging.repository;

import com.evcharging.entity.ChargingStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChargingStationRepository extends JpaRepository<ChargingStation, Long> {
    List<ChargingStation> findByStatus(ChargingStation.StationStatus status);
    
    List<ChargingStation> findByCityContainingIgnoreCaseAndStatus(String city, ChargingStation.StationStatus status);
    
    @Query("SELECT s FROM ChargingStation s WHERE " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.address) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND s.status = :status")
    List<ChargingStation> searchStations(@Param("query") String query, @Param("status") ChargingStation.StationStatus status);
    
    long countByStatus(ChargingStation.StationStatus status);
}

package com.evcharging.repository;

import com.evcharging.entity.ChargingStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChargingStationRepository extends JpaRepository<ChargingStation, Long> {
    List<ChargingStation> findByStatus(ChargingStation.StationStatus status);
    
    List<ChargingStation> findByStatusAndApprovalStatus(
            ChargingStation.StationStatus status, 
            ChargingStation.ApprovalStatus approvalStatus);

    List<ChargingStation> findByCityContainingIgnoreCaseAndStatusAndApprovalStatus(
            String city, 
            ChargingStation.StationStatus status, 
            ChargingStation.ApprovalStatus approvalStatus);

    List<ChargingStation> findByCityContainingIgnoreCaseAndStatus(String city, ChargingStation.StationStatus status);

    List<ChargingStation> findByOwnerId(Long ownerId);

    List<ChargingStation> findByApprovalStatus(ChargingStation.ApprovalStatus approvalStatus);

    @Query("SELECT s FROM ChargingStation s WHERE " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.address) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND s.status = :status AND s.approvalStatus = :approvalStatus")
    List<ChargingStation> searchApprovedStations(
            @Param("query") String query, 
            @Param("status") ChargingStation.StationStatus status,
            @Param("approvalStatus") ChargingStation.ApprovalStatus approvalStatus);

    @Query("SELECT s FROM ChargingStation s WHERE " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.address) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND s.status = :status")
    List<ChargingStation> searchStations(@Param("query") String query, @Param("status") ChargingStation.StationStatus status);
    
    long countByStatus(ChargingStation.StationStatus status);

    long countByApprovalStatus(ChargingStation.ApprovalStatus approvalStatus);

    long countByOwnerId(Long ownerId);
}

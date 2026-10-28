package com.evcharging.repository;

import com.evcharging.entity.MaintenanceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MaintenanceReportRepository extends JpaRepository<MaintenanceReport, Long> {
    List<MaintenanceReport> findByStationId(Long stationId);
    
    @Query("SELECT m FROM MaintenanceReport m WHERE m.station.owner.id = :ownerId ORDER BY m.reportedAt DESC")
    List<MaintenanceReport> findByStationOwnerId(@Param("ownerId") Long ownerId);

    List<MaintenanceReport> findAllByOrderByReportedAtDesc();

    long countByStatus(MaintenanceReport.MaintenanceStatus status);

    @Query("SELECT COUNT(m) FROM MaintenanceReport m WHERE m.station.owner.id = :ownerId AND m.status = 'OPEN'")
    long countOpenByOwnerId(@Param("ownerId") Long ownerId);
}

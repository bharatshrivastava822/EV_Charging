package com.evcharging.repository;

import com.evcharging.entity.StationReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface StationReviewRepository extends JpaRepository<StationReview, Long> {
    List<StationReview> findByStationIdOrderByCreatedAtDesc(Long stationId);

    @Query("SELECT AVG(r.rating) FROM StationReview r WHERE r.station.id = :stationId")
    Double getAverageRatingForStation(@Param("stationId") Long stationId);

    long countByStationId(Long stationId);
}


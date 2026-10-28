package com.evcharging.repository;

import com.evcharging.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Booking> findByUserIdAndStatusOrderByBookingDateAsc(Long userId, Booking.BookingStatus status);
    
    Optional<Booking> findByBookingReference(String bookingReference);
    
    Optional<Booking> findByIdAndUserId(Long id, Long userId);
    
    boolean existsBySlotIdAndStatus(Long slotId, Booking.BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.bookingDate = :date ORDER BY b.createdAt DESC")
    List<Booking> findByBookingDate(@Param("date") LocalDate date);
    
    @Query("SELECT b FROM Booking b ORDER BY b.createdAt DESC")
    List<Booking> findAllOrderByCreatedAtDesc();
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingDate = :date AND b.status = 'CONFIRMED'")
    long countConfirmedForDate(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    long countByStatus(@Param("status") Booking.BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.station.id = :stationId ORDER BY b.createdAt DESC")
    List<Booking> findByStationId(@Param("stationId") Long stationId);

    @Query("SELECT b FROM Booking b WHERE b.station.owner.id = :ownerId ORDER BY b.createdAt DESC")
    List<Booking> findByStationOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.station.owner.id = :ownerId")
    long countByStationOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.station.owner.id = :ownerId AND b.bookingDate = :date")
    long countByStationOwnerIdAndBookingDate(@Param("ownerId") Long ownerId, @Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status IN :statuses ORDER BY b.bookingDate DESC")
    List<Booking> findByUserIdAndStatusIn(@Param("userId") Long userId, @Param("statuses") List<Booking.BookingStatus> statuses);
}

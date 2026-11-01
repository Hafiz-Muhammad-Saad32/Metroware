package net.original.metroware.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import net.original.metroware.Entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Integer userId);
}
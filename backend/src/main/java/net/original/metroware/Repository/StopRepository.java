package net.original.metroware.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import net.original.metroware.Entity.Stop;

public interface StopRepository extends JpaRepository<Stop, Long> {

    List<Stop> findByStopNameIgnoreCase(String stopName);
}
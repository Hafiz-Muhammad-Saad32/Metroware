package net.original.metroware.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import net.original.metroware.Entity.Bus;

public interface BusRepository extends JpaRepository<Bus, Long> {

    List<Bus> findByRouteIdOrderByBusId(Long routeId);
}
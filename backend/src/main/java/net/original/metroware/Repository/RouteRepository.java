package net.original.metroware.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import net.original.metroware.Entity.Route;

public interface RouteRepository extends JpaRepository<Route, Long> {

    boolean existsByRouteNameIgnoreCase(String routeName);

    boolean existsByRouteNameIgnoreCaseAndRouteIdNot(String routeName, Long routeId);
}
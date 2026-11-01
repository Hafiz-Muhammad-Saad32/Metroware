package net.original.metroware.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import net.original.metroware.Entity.RouteStop;
import net.original.metroware.Entity.RouteStopId;

public interface RouteStopRepository extends JpaRepository<RouteStop, RouteStopId> {

    List<RouteStop> findByRouteIdOrderByStopOrder(Long routeId);

    List<RouteStop> findAllByOrderByRouteIdAscStopOrderAsc();

    List<RouteStop> findByStopId(Long stopId);

    boolean existsByRouteIdAndStopId(Long routeId, Long stopId);

    // route ke saare links foran delete (insert se pehle chalna zaroori hai)
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from RouteStop rs where rs.routeId = :routeId")
    void clearRoute(@Param("routeId") Long routeId);
}
package net.original.metroware.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import net.original.metroware.Service.RouteService;
import net.original.metroware.dto.PlanDto;
import net.original.metroware.dto.RouteDetailDto;
import net.original.metroware.dto.RouteDto;
import net.original.metroware.dto.RouteRequest;
import net.original.metroware.dto.StopDto;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    // ----- user + admin (login zaroori) -----

    @GetMapping
    public List<RouteDto> getRoutes() {
        return routeService.getAllRoutes();
    }

    @GetMapping("/plan")
    public PlanDto plan(
            @RequestParam("fromLat") double fromLat,
            @RequestParam("fromLng") double fromLng,
            @RequestParam("toLat") double toLat,
            @RequestParam("toLng") double toLng) {
        return routeService.planTrip(fromLat, fromLng, toLat, toLng);
    }

    @GetMapping("/{id}")
    public RouteDetailDto getRoute(@PathVariable("id") Long id) {
        return routeService.getRoute(id);
    }

    @GetMapping("/{id}/stops")
    public List<StopDto> getRouteStops(@PathVariable("id") Long id) {
        return routeService.getRouteStops(id);
    }

    // ----- sirf admin (SecurityConfig mein pehle se lagi hai) -----

    @PostMapping
    public RouteDetailDto createRoute(@Valid @RequestBody RouteRequest request) {
        return routeService.createRoute(request);
    }

    @PutMapping("/{id}")
    public RouteDetailDto updateRoute(
            @PathVariable("id") Long id,
            @Valid @RequestBody RouteRequest request) {
        return routeService.updateRoute(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable("id") Long id) {
        routeService.deleteRoute(id);
        return ResponseEntity.noContent().build();
    }
}
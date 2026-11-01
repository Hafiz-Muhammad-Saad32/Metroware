package net.original.metroware.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.original.metroware.Service.StopService;
import net.original.metroware.dto.StopDto;

@RestController
@RequestMapping("/api/stops")
public class StopController {

    private final StopService stopService;

    public StopController(StopService stopService) {
        this.stopService = stopService;
    }

    @GetMapping
    public List<StopDto> getAllStops() {
        return stopService.getAllRouteStops();
    }

    @GetMapping("/route/{routeId}")
    public List<StopDto> getStopsByRoute(@PathVariable("routeId") Long routeId) {
        return stopService.getStopsOfRoute(routeId);
    }
}
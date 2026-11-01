package net.original.metroware.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import net.original.metroware.Entity.RouteStop;
import net.original.metroware.Entity.Stop;
import net.original.metroware.Repository.RouteStopRepository;
import net.original.metroware.Repository.StopRepository;
import net.original.metroware.dto.StopDto;

@Service
public class StopService {

    private final StopRepository stopRepository;
    private final RouteStopRepository routeStopRepository;

    public StopService(StopRepository stopRepository, RouteStopRepository routeStopRepository) {
        this.stopRepository = stopRepository;
        this.routeStopRepository = routeStopRepository;
    }

    // saare routes ke saare stops (route aur order ke hisaab se)
    public List<StopDto> getAllRouteStops() {
        return toDtos(routeStopRepository.findAllByOrderByRouteIdAscStopOrderAsc());
    }

    public List<StopDto> getStopsOfRoute(Long routeId) {
        return toDtos(routeStopRepository.findByRouteIdOrderByStopOrder(routeId));
    }

    // stops + route_stops ka join: frontend ko wahi purani "Stop" shakal milti hai
    private List<StopDto> toDtos(List<RouteStop> links) {
        Set<Long> ids = links.stream().map(RouteStop::getStopId).collect(Collectors.toSet());
        Map<Long, Stop> stops = stopRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Stop::getStopId, Function.identity()));

        return links.stream().map(link -> {
            Stop s = stops.get(link.getStopId());
            return new StopDto(
                    s.getStopId(),
                    link.getRouteId(),
                    s.getStopName(),
                    s.getLatitude(),
                    s.getLongitude(),
                    link.getStopOrder());
        }).toList();
    }
}
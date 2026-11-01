package net.original.metroware.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.original.metroware.Entity.Bus;
import net.original.metroware.Entity.Route;
import net.original.metroware.Entity.RouteStop;
import net.original.metroware.Entity.Stop;
import net.original.metroware.Repository.BusRepository;
import net.original.metroware.Repository.RouteRepository;
import net.original.metroware.Repository.RouteStopRepository;
import net.original.metroware.Repository.StopRepository;
import net.original.metroware.dto.PlanDto;
import net.original.metroware.dto.RouteDetailDto;
import net.original.metroware.dto.RouteDto;
import net.original.metroware.dto.RouteRequest;
import net.original.metroware.dto.StopDto;
import net.original.metroware.dto.StopInput;
import net.original.metroware.exception.ApiException;
import net.original.metroware.util.GeoUtils;

@Service
public class RouteService {

    // is se zyada paidal doori par stop ho to route suggest nahi karte
    private static final double MAX_WALK_KM = 10.0;

    // same naam aur is doori ke andar wala stop "wahi stop" maana jata hai (dobara nahi banta)
    private static final double SAME_STOP_KM = 0.2;

    private final RouteRepository routeRepository;
    private final StopRepository stopRepository;
    private final RouteStopRepository routeStopRepository;
    private final BusRepository busRepository;
    private final StopService stopService;

    public RouteService(RouteRepository routeRepository,
                        StopRepository stopRepository,
                        RouteStopRepository routeStopRepository,
                        BusRepository busRepository,
                        StopService stopService) {
        this.routeRepository = routeRepository;
        this.stopRepository = stopRepository;
        this.routeStopRepository = routeStopRepository;
        this.busRepository = busRepository;
        this.stopService = stopService;
    }

    // ---------- READ ----------

    public List<RouteDto> getAllRoutes() {
        Map<Long, List<StopDto>> byRoute = stopService.getAllRouteStops().stream()
                .collect(Collectors.groupingBy(StopDto::routeId));

        return routeRepository.findAll(Sort.by("routeId")).stream()
                .map(r -> toRouteDto(r, byRoute.getOrDefault(r.getRouteId(), List.of())))
                .toList();
    }

    public RouteDetailDto getRoute(Long id) {
        return toDetail(findRoute(id));
    }

    public List<StopDto> getRouteStops(Long id) {
        findRoute(id);
        return stopService.getStopsOfRoute(id);
    }

    // ---------- ADMIN: CREATE / UPDATE / DELETE ----------

    @Transactional
    public RouteDetailDto createRoute(RouteRequest req) {
        String name = req.getRouteName().trim();

        if (routeRepository.existsByRouteNameIgnoreCase(name)) {
            throw new ApiException(HttpStatus.CONFLICT, "A route with this name already exists");
        }

        Route route = new Route();
        route.setRouteName(name);
        route = routeRepository.save(route);

        replaceStops(route.getRouteId(), req.getStops());
        syncBuses(route, req.getBusCount());

        return toDetail(route);
    }

    @Transactional
    public RouteDetailDto updateRoute(Long id, RouteRequest req) {
        Route route = findRoute(id);
        String name = req.getRouteName().trim();

        if (routeRepository.existsByRouteNameIgnoreCaseAndRouteIdNot(name, id)) {
            throw new ApiException(HttpStatus.CONFLICT, "A route with this name already exists");
        }

        route.setRouteName(name);
        route = routeRepository.save(route);

        replaceStops(id, req.getStops());
        syncBuses(route, req.getBusCount());

        return toDetail(route);
    }

    @Transactional
    public void deleteRoute(Long id) {
        Route route = findRoute(id);

        // baqi kaam database khud karta hai (foreign key rules):
        //   route_stops  -> ON DELETE CASCADE   (links delete)
        //   buses        -> ON DELETE SET NULL  (bus bachti hai, route_id NULL)
        //   stops        -> delete nahi hote (kisi aur route ya purani booking ke kaam aa sakte hain)
        routeRepository.delete(route);
    }

    // ---------- USER: NEAREST ROUTE ----------

    public PlanDto planTrip(double fromLat, double fromLng, double toLat, double toLng) {

        if (!validPoint(fromLat, fromLng) || !validPoint(toLat, toLng)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid coordinates");
        }

        // route ke hisaab se stops (pehle se order mein)
        Map<Long, List<StopDto>> stopsByRoute = stopService.getAllRouteStops().stream()
                .collect(Collectors.groupingBy(StopDto::routeId));

        Route bestRoute = null;
        StopDto bestBoard = null;
        StopDto bestDrop = null;
        List<StopDto> bestStops = null;
        double bestBoardKm = 0;
        double bestDropKm = 0;
        double bestTotal = Double.MAX_VALUE;

        for (Route route : routeRepository.findAll()) {
            List<StopDto> rs = stopsByRoute.getOrDefault(route.getRouteId(), List.of());
            if (rs.size() < 2) {
                continue;
            }

            StopDto board = nearestStop(rs, fromLat, fromLng);
            StopDto drop = nearestStop(rs, toLat, toLng);
            if (board.stopId().equals(drop.stopId())) {
                continue;
            }

            double boardKm = GeoUtils.haversineKm(fromLat, fromLng, board.latitude(), board.longitude());
            double dropKm = GeoUtils.haversineKm(toLat, toLng, drop.latitude(), drop.longitude());
            if (boardKm > MAX_WALK_KM || dropKm > MAX_WALK_KM) {
                continue;
            }

            double total = boardKm + dropKm;
            if (total < bestTotal) {
                bestTotal = total;
                bestRoute = route;
                bestBoard = board;
                bestDrop = drop;
                bestStops = rs;
                bestBoardKm = boardKm;
                bestDropKm = dropKm;
            }
        }

        if (bestRoute == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "No bus route found for these places");
        }

        int lo = Math.min(bestBoard.stopOrder(), bestDrop.stopOrder());
        int hi = Math.max(bestBoard.stopOrder(), bestDrop.stopOrder());

        List<StopDto> ride = new ArrayList<>(bestStops.stream()
                .filter(s -> s.stopOrder() >= lo && s.stopOrder() <= hi)
                .toList());
        if (bestBoard.stopOrder() > bestDrop.stopOrder()) {
            Collections.reverse(ride);
        }

        List<String> busNumbers = busRepository.findByRouteIdOrderByBusId(bestRoute.getRouteId())
                .stream().map(Bus::getBusNumber).toList();

        return new PlanDto(toRouteDto(bestRoute, bestStops), bestBoard, bestDrop,
                bestBoardKm, bestDropKm, ride, busNumbers);
    }

    // ---------- helpers ----------

    private Route findRoute(Long id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Route not found"));
    }

    private RouteDto toRouteDto(Route route, List<StopDto> orderedStops) {
        String start = orderedStops.isEmpty() ? "" : orderedStops.get(0).stopName();
        String end = orderedStops.isEmpty() ? "" : orderedStops.get(orderedStops.size() - 1).stopName();
        return new RouteDto(route.getRouteId(), route.getRouteName(), start, end);
    }

    private RouteDetailDto toDetail(Route route) {
        List<StopDto> stops = stopService.getStopsOfRoute(route.getRouteId());
        RouteDto dto = toRouteDto(route, stops);
        return new RouteDetailDto(
                dto.routeId(),
                dto.routeName(),
                dto.startStop(),
                dto.endStop(),
                stops,
                busRepository.findByRouteIdOrderByBusId(route.getRouteId()));
    }

    // har input ko ek asli stop se jodta hai (purana mil jaye to wahi, warna naya),
    // phir route ke links naye sire se likhta hai
    private void replaceStops(Long routeId, List<StopInput> inputs) {
        List<Stop> resolved = new ArrayList<>();
        Set<Long> seen = new HashSet<>();

        for (StopInput in : inputs) {
            Stop stop = findOrCreateStop(in);
            if (!seen.add(stop.getStopId())) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "A stop can appear only once in a route: " + stop.getStopName());
            }
            resolved.add(stop);
        }

        routeStopRepository.clearRoute(routeId);

        List<RouteStop> links = new ArrayList<>();
        for (int i = 0; i < resolved.size(); i++) {
            links.add(new RouteStop(routeId, resolved.get(i).getStopId(), i + 1));
        }
        routeStopRepository.saveAll(links);
    }

    private Stop findOrCreateStop(StopInput in) {
        String name = in.getStopName().trim();

        for (Stop existing : stopRepository.findByStopNameIgnoreCase(name)) {
            double km = GeoUtils.haversineKm(in.getLatitude(), in.getLongitude(),
                    existing.getLatitude(), existing.getLongitude());
            if (km <= SAME_STOP_KM) {
                return existing;
            }
        }

        Stop stop = new Stop();
        stop.setStopName(name);
        stop.setLatitude(in.getLatitude());
        stop.setLongitude(in.getLongitude());
        return stopRepository.save(stop);
    }

    // sirf farq add ya remove hota hai
    private void syncBuses(Route route, int desired) {
        List<Bus> mine = busRepository.findByRouteIdOrderByBusId(route.getRouteId());

        if (desired > mine.size()) {
            String prefix = busPrefix(route.getRouteName());
            Set<String> used = busRepository.findAll().stream()
                    .map(Bus::getBusNumber)
                    .collect(Collectors.toCollection(HashSet::new));

            int n = 1;
            for (int k = mine.size(); k < desired; k++) {
                String number;
                do {
                    number = prefix + "-" + String.format("%02d", n++);
                } while (used.contains(number));
                used.add(number);

                Bus bus = new Bus();
                bus.setBusNumber(number);
                bus.setRouteId(route.getRouteId());
                busRepository.save(bus);
            }
        } else if (desired < mine.size()) {
            busRepository.deleteAll(mine.subList(desired, mine.size()));
        }
    }

    // "Green Line" -> "GL"
    private String busPrefix(String routeName) {
        StringBuilder sb = new StringBuilder();
        for (String w : routeName.trim().split("\\s+")) {
            if (!w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0)));
            }
        }
        return sb.length() == 0 ? "B" : sb.toString();
    }

    private StopDto nearestStop(List<StopDto> list, double lat, double lng) {
        return list.stream()
                .min(Comparator.comparingDouble(
                        s -> GeoUtils.haversineKm(lat, lng, s.latitude(), s.longitude())))
                .orElseThrow();
    }

    private boolean validPoint(double lat, double lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }
}
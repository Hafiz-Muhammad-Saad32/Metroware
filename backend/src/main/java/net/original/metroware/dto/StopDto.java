package net.original.metroware.dto;

// frontend ka "Stop": ek route par ek stop (stops + route_stops ka join)
public record StopDto(
        Long stopId,
        Long routeId,
        String stopName,
        double latitude,
        double longitude,
        Integer stopOrder) {
}
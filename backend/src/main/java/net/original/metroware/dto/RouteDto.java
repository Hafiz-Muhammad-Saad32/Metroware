package net.original.metroware.dto;

public record RouteDto(
        Long routeId,
        String routeName,
        String startStop,
        String endStop) {
}
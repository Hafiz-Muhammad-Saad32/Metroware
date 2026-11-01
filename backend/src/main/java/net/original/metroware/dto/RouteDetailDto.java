package net.original.metroware.dto;

import java.util.List;

import net.original.metroware.Entity.Bus;

public record RouteDetailDto(
        Long routeId,
        String routeName,
        String startStop,
        String endStop,
        List<StopDto> stops,
        List<Bus> buses) {
}
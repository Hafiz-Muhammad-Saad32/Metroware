package net.original.metroware.dto;

import java.util.List;

public record PlanDto(
        RouteDto route,
        StopDto board,
        StopDto drop,
        double walkToBoardKm,
        double walkFromDropKm,
        List<StopDto> ride,
        List<String> busNumbers) {
}
package net.original.metroware.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RouteRequest {

    @NotBlank(message = "Route name is required")
    @Size(max = 100, message = "Route name is too long")
    private String routeName;

    @NotNull(message = "Stops are required")
    @Size(min = 2, message = "A route needs at least 2 stops")
    @Valid
    private List<StopInput> stops;

    @NotNull(message = "Number of buses is required")
    @Min(value = 1, message = "At least 1 bus is required")
    @Max(value = 50, message = "Maximum 50 buses per route")
    private Integer busCount;
}
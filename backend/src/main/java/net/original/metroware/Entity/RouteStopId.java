package net.original.metroware.Entity;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// route_stops ki composite primary key (route_id, stop_id)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteStopId implements Serializable {

    private Long routeId;
    private Long stopId;
}
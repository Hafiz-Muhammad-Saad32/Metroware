package net.original.metroware.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// junction table: Routes M:N Stops, saath mein route par stop ki tarteeb
@Entity
@Table(name = "route_stops")
@IdClass(RouteStopId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RouteStop {

    @Id
    private Long routeId;

    @Id
    private Long stopId;

    @Column(nullable = false)
    private Integer stopOrder;
}
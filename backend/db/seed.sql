-- =====================================================================
--  METROWARE  |  Sample data (optional).  Run AFTER schema.sql.
--  Two routes share two stops (Nazimabad, Numaish) => shows the M:N link.
--  Coordinates are approximate (demo only).
--  The admin user is created by the backend (DataSeeder) on first start.
-- =====================================================================
USE metroware;

INSERT INTO routes (route_id, route_name) VALUES
    (1, 'Green Line'),
    (2, 'Orange Line');

INSERT INTO stops (stop_id, stop_name, latitude, longitude) VALUES
    (1, 'Surjani',         25.0135, 67.0450),
    (2, 'North Karachi',   24.9900, 67.0650),
    (3, 'Nagan Chowrangi', 24.9570, 67.0600),
    (4, 'Nazimabad',       24.9120, 67.0310),   -- shared
    (5, 'Numaish',         24.8727, 67.0338),   -- shared
    (6, 'Orangi Town',     24.9480, 66.9920),
    (7, 'Banaras Chowk',   24.8990, 66.9990),
    (8, 'Tower',           24.8480, 67.0000);

-- Green Line: Surjani -> North Karachi -> Nagan -> Nazimabad -> Numaish
INSERT INTO route_stops (route_id, stop_id, stop_order) VALUES
    (1, 1, 1), (1, 2, 2), (1, 3, 3), (1, 4, 4), (1, 5, 5);

-- Orange Line: Orangi -> Banaras -> Nazimabad -> Numaish -> Tower
INSERT INTO route_stops (route_id, stop_id, stop_order) VALUES
    (2, 6, 1), (2, 7, 2), (2, 4, 3), (2, 5, 4), (2, 8, 5);

INSERT INTO buses (bus_number, route_id) VALUES
    ('GL-01', 1), ('GL-02', 1), ('OL-01', 2);

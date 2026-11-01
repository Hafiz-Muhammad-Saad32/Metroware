-- =====================================================================
--  METROWARE  |  Database schema  (MySQL 8.0.16+)
--  Normal form: 3NF.  Run this file to (re)create the whole database.
--  WARNING: it DROPS all tables first, so all data is deleted.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS metroware
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE metroware;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS tickets, payments, bookings, complaints, lost_found_things,
                     buses, route_stops, stops, routes, users;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. USERS
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id        INT          NOT NULL AUTO_INCREMENT,
    user_name      VARCHAR(100) NOT NULL,
    user_email     VARCHAR(255) NOT NULL,
    user_password  VARCHAR(255) NOT NULL,                 -- BCrypt hash
    user_role      VARCHAR(10)  NOT NULL DEFAULT 'user',
    CONSTRAINT pk_users        PRIMARY KEY (user_id),
    CONSTRAINT uq_users_email  UNIQUE (user_email),
    CONSTRAINT ck_users_role   CHECK (user_role IN ('user', 'admin')),
    CONSTRAINT ck_users_name   CHECK (CHAR_LENGTH(TRIM(user_name)) > 0)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 2. ROUTES  (start/end stop are NOT stored: they are derived from route_stops)
-- ---------------------------------------------------------------------
CREATE TABLE routes (
    route_id    BIGINT       NOT NULL AUTO_INCREMENT,
    route_name  VARCHAR(100) NOT NULL,
    CONSTRAINT pk_routes       PRIMARY KEY (route_id),
    CONSTRAINT uq_routes_name  UNIQUE (route_name),
    CONSTRAINT ck_routes_name  CHECK (CHAR_LENGTH(TRIM(route_name)) > 0)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 3. STOPS  (one row per physical place; shared by many routes)
-- ---------------------------------------------------------------------
CREATE TABLE stops (
    stop_id    BIGINT       NOT NULL AUTO_INCREMENT,
    stop_name  VARCHAR(100) NOT NULL,
    latitude   DOUBLE       NOT NULL,
    longitude  DOUBLE       NOT NULL,
    CONSTRAINT pk_stops        PRIMARY KEY (stop_id),
    CONSTRAINT uq_stops_place  UNIQUE (stop_name, latitude, longitude),
    CONSTRAINT ck_stops_lat    CHECK (latitude  BETWEEN -90  AND 90),
    CONSTRAINT ck_stops_lng    CHECK (longitude BETWEEN -180 AND 180)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 4. ROUTE_STOPS  (junction table: Routes M:N Stops, with order on the route)
-- ---------------------------------------------------------------------
CREATE TABLE route_stops (
    route_id    BIGINT NOT NULL,
    stop_id     BIGINT NOT NULL,
    stop_order  INT    NOT NULL,
    CONSTRAINT pk_route_stops   PRIMARY KEY (route_id, stop_id),
    CONSTRAINT uq_route_order   UNIQUE (route_id, stop_order),
    CONSTRAINT ck_rs_order      CHECK (stop_order >= 1),
    CONSTRAINT fk_rs_route      FOREIGN KEY (route_id) REFERENCES routes (route_id)
                                ON DELETE CASCADE,        -- route delete => its links go
    CONSTRAINT fk_rs_stop       FOREIGN KEY (stop_id)  REFERENCES stops (stop_id)
                                ON DELETE RESTRICT        -- a stop used by a route cannot be deleted
) ENGINE = InnoDB;

CREATE INDEX idx_rs_stop ON route_stops (stop_id);

-- ---------------------------------------------------------------------
-- 5. BUSES  (route_id becomes NULL when the route is deleted)
-- ---------------------------------------------------------------------
CREATE TABLE buses (
    bus_id      BIGINT      NOT NULL AUTO_INCREMENT,
    bus_number  VARCHAR(30) NOT NULL,
    route_id    BIGINT      NULL,
    CONSTRAINT pk_buses        PRIMARY KEY (bus_id),
    CONSTRAINT uq_buses_number UNIQUE (bus_number),
    CONSTRAINT fk_buses_route  FOREIGN KEY (route_id) REFERENCES routes (route_id)
                               ON DELETE SET NULL
) ENGINE = InnoDB;

CREATE INDEX idx_buses_route ON buses (route_id);

-- ---------------------------------------------------------------------
-- 6. BOOKINGS  (one purchase by one user for one trip)
--    bus_number / route_name / pickup_name / drop_name are a deliberate
--    SNAPSHOT (denormalization) so history stays correct even after the
--    bus, route or stop is changed or deleted.
-- ---------------------------------------------------------------------
CREATE TABLE bookings (
    booking_id      BIGINT       NOT NULL AUTO_INCREMENT,
    user_id         INT          NOT NULL,
    bus_id          BIGINT       NULL,
    pickup_stop_id  BIGINT       NULL,
    drop_stop_id    BIGINT       NULL,
    bus_number      VARCHAR(30)  NOT NULL,
    route_name      VARCHAR(100) NOT NULL,
    pickup_name     VARCHAR(100) NOT NULL,
    drop_name       VARCHAR(100) NOT NULL,
    unit_price      INT          NOT NULL,
    booked_at       DATETIME(6)  NOT NULL,
    CONSTRAINT pk_bookings       PRIMARY KEY (booking_id),
    CONSTRAINT ck_bookings_price CHECK (unit_price > 0),
    CONSTRAINT fk_bookings_user  FOREIGN KEY (user_id) REFERENCES users (user_id)
                                 ON DELETE RESTRICT,      -- user with bookings cannot be deleted
    CONSTRAINT fk_bookings_bus   FOREIGN KEY (bus_id) REFERENCES buses (bus_id)
                                 ON DELETE SET NULL,
    CONSTRAINT fk_bookings_pick  FOREIGN KEY (pickup_stop_id) REFERENCES stops (stop_id)
                                 ON DELETE SET NULL,
    CONSTRAINT fk_bookings_drop  FOREIGN KEY (drop_stop_id) REFERENCES stops (stop_id)
                                 ON DELETE SET NULL
) ENGINE = InnoDB;

CREATE INDEX idx_bookings_user_date ON bookings (user_id, booked_at);

-- ---------------------------------------------------------------------
-- 7. TICKETS  (one row per passenger seat in a booking)
-- ---------------------------------------------------------------------
CREATE TABLE tickets (
    ticket_id   BIGINT NOT NULL AUTO_INCREMENT,
    booking_id  BIGINT NOT NULL,
    CONSTRAINT pk_tickets          PRIMARY KEY (ticket_id),
    CONSTRAINT fk_tickets_booking  FOREIGN KEY (booking_id) REFERENCES bookings (booking_id)
                                   ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_tickets_booking ON tickets (booking_id);

-- ---------------------------------------------------------------------
-- 8. PAYMENTS  (exactly one payment per booking)
-- ---------------------------------------------------------------------
CREATE TABLE payments (
    payment_id      BIGINT      NOT NULL AUTO_INCREMENT,
    booking_id      BIGINT      NOT NULL,
    payment_method  VARCHAR(20) NOT NULL,
    payment_status  VARCHAR(20) NOT NULL,
    amount          INT         NOT NULL,
    transaction_id  VARCHAR(50) NULL,
    paid_at         DATETIME(6) NULL,
    CONSTRAINT pk_payments          PRIMARY KEY (payment_id),
    CONSTRAINT uq_payments_booking  UNIQUE (booking_id),
    CONSTRAINT uq_payments_txn      UNIQUE (transaction_id),
    CONSTRAINT ck_payments_method   CHECK (payment_method IN ('cash', 'easypaisa')),
    CONSTRAINT ck_payments_status   CHECK (payment_status IN ('pending', 'paid')),
    CONSTRAINT ck_payments_amount   CHECK (amount > 0),
    -- paid  <=> paid_at is filled;  pending <=> paid_at is empty
    CONSTRAINT ck_payments_paid_at  CHECK (
        (payment_status = 'paid'    AND paid_at IS NOT NULL) OR
        (payment_status = 'pending' AND paid_at IS NULL)),
    -- an Easypaisa payment must carry a transaction id
    CONSTRAINT ck_payments_txn      CHECK (payment_method <> 'easypaisa' OR transaction_id IS NOT NULL),
    CONSTRAINT fk_payments_booking  FOREIGN KEY (booking_id) REFERENCES bookings (booking_id)
                                    ON DELETE CASCADE
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 9. COMPLAINTS
-- ---------------------------------------------------------------------
CREATE TABLE complaints (
    complaint_id    INT           NOT NULL AUTO_INCREMENT,
    user_id         INT           NOT NULL,
    complaint_text  VARCHAR(1000) NOT NULL,
    complaint_date  DATETIME(6)   NOT NULL,
    CONSTRAINT pk_complaints       PRIMARY KEY (complaint_id),
    CONSTRAINT ck_complaints_text  CHECK (CHAR_LENGTH(TRIM(complaint_text)) > 0),
    CONSTRAINT fk_complaints_user  FOREIGN KEY (user_id) REFERENCES users (user_id)
                                   ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE INDEX idx_complaints_date ON complaints (complaint_date);

-- ---------------------------------------------------------------------
-- 10. LOST_FOUND_THINGS
-- ---------------------------------------------------------------------
CREATE TABLE lost_found_things (
    item_id      INT            NOT NULL AUTO_INCREMENT,
    user_id      INT            NOT NULL,
    item_name    VARCHAR(100)   NOT NULL,
    description  VARCHAR(1000)  NOT NULL,
    item_type    ENUM('LOST', 'FOUND') NOT NULL,
    `date`       DATETIME(6)    NOT NULL,
    CONSTRAINT pk_lost_found      PRIMARY KEY (item_id),
    CONSTRAINT ck_lf_name         CHECK (CHAR_LENGTH(TRIM(item_name)) > 0),
    CONSTRAINT ck_lf_description  CHECK (CHAR_LENGTH(TRIM(description)) > 0),
    CONSTRAINT fk_lf_user         FOREIGN KEY (user_id) REFERENCES users (user_id)
                                  ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE INDEX idx_lf_type_date ON lost_found_things (item_type, `date`);

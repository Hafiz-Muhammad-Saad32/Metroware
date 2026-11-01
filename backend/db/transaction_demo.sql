-- =====================================================================
--  TRANSACTION (ACID) DEMO for the presentation.
--  Idea: a booking = 1 row in bookings + 1 row in payments (+ tickets).
--  If ANY step fails, NOTHING must be saved (atomicity).
--  Run the blocks one by one (select a block, press Execute).
--  Needs at least one row in users (start the backend once: it creates the admin).
-- =====================================================================
USE metroware;

-- BLOCK 1: how many bookings now?
SELECT COUNT(*) AS bookings_before FROM bookings;

-- BLOCK 2: start a transaction and insert the booking
START TRANSACTION;

INSERT INTO bookings (user_id, bus_number, route_name, pickup_name, drop_name, unit_price, booked_at)
SELECT MIN(user_id), 'GL-01', 'Green Line', 'Surjani', 'Numaish', 80, NOW(6) FROM users;

SELECT COUNT(*) AS bookings_inside_transaction FROM bookings;   -- one more (only visible to us)

-- BLOCK 3: the payment step FAILS (amount must be > 0, CHECK constraint)
INSERT INTO payments (booking_id, payment_method, payment_status, amount)
VALUES (LAST_INSERT_ID(), 'cash', 'pending', 0);                -- ERROR 3819

-- BLOCK 4: because of the error we cancel everything
ROLLBACK;

SELECT COUNT(*) AS bookings_after_rollback FROM bookings;       -- same as bookings_before

-- BLOCK 5: the same flow, but successful => COMMIT makes it permanent
START TRANSACTION;
INSERT INTO bookings (user_id, bus_number, route_name, pickup_name, drop_name, unit_price, booked_at)
SELECT MIN(user_id), 'GL-01', 'Green Line', 'Surjani', 'Numaish', 80, NOW(6) FROM users;
SET @b = LAST_INSERT_ID();
INSERT INTO payments (booking_id, payment_method, payment_status, amount)
VALUES (@b, 'cash', 'pending', 80);
INSERT INTO tickets (booking_id) VALUES (@b);
COMMIT;

SELECT b.booking_id, p.payment_status, p.amount, COUNT(t.ticket_id) AS tickets
FROM bookings b
JOIN payments p ON p.booking_id = b.booking_id
JOIN tickets  t ON t.booking_id = b.booking_id
GROUP BY b.booking_id, p.payment_status, p.amount;

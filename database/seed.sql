-- ChargerGo EV Charging Slot Booking System - Seed Data
USE ev_charging_db;

-- Admin user (password: Admin@123)
-- BCrypt hash for Admin@123
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Admin Manager', 'admin@evcharge.in', '9876543210', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN');

-- Regular users (password: User@123)
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Aryan Sharma', 'aryan@example.com', '9876543211', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'),
('Priya Patel', 'priya@example.com', '9876543212', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'),
('Rahul Verma', 'rahul@example.com', '9876543213', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER');

-- Charging Stations
INSERT INTO charging_stations (name, address, city, state, latitude, longitude, operator, opening_time, closing_time, status) VALUES
('ChargerGo Vijay Nagar Hub', '12, Vijay Nagar Square, AB Road', 'Indore', 'Madhya Pradesh', 22.7533, 75.8937, 'ChargerGo Express', '06:00:00', '23:00:00', 'ACTIVE'),
('ChargerGo Indore Supercharge Point', 'Plot 45, Scheme No. 78, Near Bombay Hospital', 'Indore', 'Madhya Pradesh', 22.7610, 75.8850, 'ChargerGo Pro', '00:00:00', '23:59:00', 'ACTIVE'),
('ChargerGo Bhopal MP Nagar Station', 'MP Nagar Zone-II, Near DB City Mall', 'Bhopal', 'Madhya Pradesh', 23.2332, 77.4350, 'ChargerGo Central', '07:00:00', '22:00:00', 'ACTIVE'),
('ChargerGo Highway Express Hub', 'Indore-Ujjain Expressway, Toll Plaza Milestone 18', 'Ujjain', 'Madhya Pradesh', 23.0100, 75.8200, 'ChargerGo Highway', '00:00:00', '23:59:00', 'ACTIVE'),
('ChargerGo Bengaluru Tech Hub', 'ITPL Main Road, Whitefield', 'Bengaluru', 'Karnataka', 12.9850, 77.7310, 'ChargerGo Tech', '06:00:00', '23:00:00', 'ACTIVE'),
('ChargerGo Cyber City Station', 'Cyber Towers, HITEC City', 'Hyderabad', 'Telangana', 17.4474, 78.3762, 'ChargerGo South', '06:00:00', '23:00:00', 'ACTIVE'),
('ChargerGo Connaught Place Hub', 'Block A, Inner Circle, Connaught Place', 'New Delhi', 'Delhi', 28.6315, 77.2167, 'ChargerGo Capital', '06:00:00', '23:30:00', 'ACTIVE'),
('ChargerGo Bandra Kurla Complex', 'G Block, BKC, Bandra East', 'Mumbai', 'Maharashtra', 19.0657, 72.8687, 'ChargerGo West', '00:00:00', '23:59:00', 'ACTIVE');

-- Chargers for ChargerGo Vijay Nagar Hub (station_id = 1)
INSERT INTO chargers (station_id, charger_number, charger_type, charging_speed, power_kw, status) VALUES
(1, 'C01', 'CCS2', 'DC Fast', 60.00, 'ACTIVE'),
(1, 'C02', 'CCS2', 'DC Ultra-Fast', 120.00, 'ACTIVE'),
(1, 'C03', 'TYPE2', 'AC Standard', 22.00, 'ACTIVE'),
(1, 'C04', 'CHAdeMO', 'DC Fast', 50.00, 'ACTIVE');

-- Chargers for ChargerGo Indore Supercharge Point (station_id = 2)
INSERT INTO chargers (station_id, charger_number, charger_type, charging_speed, power_kw, status) VALUES
(2, 'C01', 'CCS2', 'DC Ultra-Fast', 150.00, 'ACTIVE'),
(2, 'C02', 'CCS2', 'DC Ultra-Fast', 120.00, 'ACTIVE'),
(2, 'C03', 'TYPE2', 'AC Standard', 22.00, 'ACTIVE'),
(2, 'C04', 'TYPE2', 'AC Standard', 22.00, 'ACTIVE'),
(2, 'C05', 'DC_FAST', 'DC Fast', 60.00, 'ACTIVE'),
(2, 'C06', 'CHAdeMO', 'DC Fast', 50.00, 'ACTIVE');

-- Chargers for ChargerGo Bhopal MP Nagar Station (station_id = 3)
INSERT INTO chargers (station_id, charger_number, charger_type, charging_speed, power_kw, status) VALUES
(3, 'C01', 'CCS2', 'DC Fast', 60.00, 'ACTIVE'),
(3, 'C02', 'TYPE2', 'AC Standard', 22.00, 'ACTIVE'),
(3, 'C03', 'TYPE2', 'AC Standard', 7.40, 'ACTIVE');

-- Chargers for ChargerGo Highway Express Hub (station_id = 4)
INSERT INTO chargers (station_id, charger_number, charger_type, charging_speed, power_kw, status) VALUES
(4, 'C01', 'CCS2', 'DC Ultra-Fast', 150.00, 'ACTIVE'),
(4, 'C02', 'CCS2', 'DC Fast', 60.00, 'ACTIVE'),
(4, 'C03', 'CHAdeMO', 'DC Fast', 50.00, 'ACTIVE'),
(4, 'C04', 'TYPE2', 'AC Standard', 22.00, 'ACTIVE'),
(4, 'C05', 'DC_FAST', 'DC Fast', 60.00, 'ACTIVE');

-- Chargers for ChargerGo Bengaluru Tech Hub (station_id = 5)
INSERT INTO chargers (station_id, charger_number, charger_type, charging_speed, power_kw, status) VALUES
(5, 'C01', 'CCS2', 'DC Ultra-Fast', 150.00, 'ACTIVE'),
(5, 'C02', 'CCS2', 'DC Ultra-Fast', 120.00, 'ACTIVE'),
(5, 'C03', 'TYPE2', 'AC Standard', 22.00, 'ACTIVE'),
(5, 'C04', 'TYPE2', 'AC Standard', 22.00, 'ACTIVE'),
(5, 'C05', 'DC_FAST', 'DC Fast', 60.00, 'ACTIVE'),
(5, 'C06', 'CHAdeMO', 'DC Fast', 50.00, 'ACTIVE');

-- Stored procedure to auto-generate slots
DELIMITER //

CREATE PROCEDURE GenerateSlots(IN p_days INT)
BEGIN
    DECLARE v_date DATE;
    DECLARE v_day INT DEFAULT 0;
    DECLARE v_charger_id BIGINT;
    DECLARE v_hour INT;
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE charger_cursor CURSOR FOR 
        SELECT id FROM chargers WHERE status = 'ACTIVE';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    WHILE v_day < p_days DO
        SET v_date = DATE_ADD(CURDATE(), INTERVAL v_day DAY);
        
        OPEN charger_cursor;
        
        read_loop: LOOP
            FETCH charger_cursor INTO v_charger_id;
            IF done THEN
                LEAVE read_loop;
            END IF;
            
            SET v_hour = 6;
            WHILE v_hour < 23 DO
                INSERT IGNORE INTO slots (charger_id, slot_date, start_time, end_time, status)
                VALUES 
                    (v_charger_id, v_date, SEC_TO_TIME(v_hour * 3600), SEC_TO_TIME(v_hour * 3600 + 1800), 'AVAILABLE'),
                    (v_charger_id, v_date, SEC_TO_TIME(v_hour * 3600 + 1800), SEC_TO_TIME((v_hour + 1) * 3600), 'AVAILABLE');
                SET v_hour = v_hour + 1;
            END WHILE;
        END LOOP;
        
        SET done = FALSE;
        CLOSE charger_cursor;
        SET v_day = v_day + 1;
    END WHILE;
END //

DELIMITER ;

-- Generate slots for the next 7 days
CALL GenerateSlots(7);

-- Mark some slots as booked for realistic data
UPDATE slots SET status = 'BOOKED' WHERE id IN (
    SELECT id FROM (
        SELECT s.id FROM slots s 
        WHERE s.slot_date = CURDATE() 
        AND s.charger_id IN (1, 2, 5, 6)
        AND s.start_time IN ('09:00:00', '10:00:00', '14:00:00', '15:30:00')
        LIMIT 8
    ) AS temp
);

-- Sample bookings
INSERT INTO bookings (user_id, station_id, charger_id, slot_id, booking_reference, booking_date, start_time, end_time, status) 
SELECT 
    2, 1, 1, s.id, CONCAT('CG-', DATE_FORMAT(CURDATE(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 9999), 4, '0')),
    s.slot_date, s.start_time, s.end_time, 'CONFIRMED'
FROM slots s 
WHERE s.charger_id = 1 AND s.slot_date = CURDATE() AND s.start_time = '09:00:00' AND s.status = 'BOOKED'
LIMIT 1;

-- EV Charging Slot Booking System - Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS ev_charging_db;
USE ev_charging_db;

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Charging stations table
CREATE TABLE charging_stations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(300) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    operator VARCHAR(150),
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stations_city (city),
    INDEX idx_stations_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chargers table
CREATE TABLE chargers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id BIGINT NOT NULL,
    charger_number VARCHAR(10) NOT NULL,
    charger_type ENUM('CCS2', 'CHAdeMO', 'TYPE2', 'AC', 'DC_FAST') NOT NULL,
    charging_speed VARCHAR(50),
    power_kw DECIMAL(6, 2) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY (station_id) REFERENCES charging_stations(id) ON DELETE CASCADE,
    INDEX idx_chargers_station (station_id),
    INDEX idx_chargers_status (status),
    UNIQUE KEY uk_station_charger (station_id, charger_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Slots table
CREATE TABLE slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    charger_id BIGINT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('AVAILABLE', 'BOOKED', 'BLOCKED') NOT NULL DEFAULT 'AVAILABLE',
    FOREIGN KEY (charger_id) REFERENCES chargers(id) ON DELETE CASCADE,
    INDEX idx_slots_charger (charger_id),
    INDEX idx_slots_date (slot_date),
    INDEX idx_slots_status (status),
    UNIQUE KEY uk_charger_slot (charger_id, slot_date, start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bookings table
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    station_id BIGINT NOT NULL,
    charger_id BIGINT NOT NULL,
    slot_id BIGINT NOT NULL,
    booking_reference VARCHAR(30) NOT NULL UNIQUE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW') NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (station_id) REFERENCES charging_stations(id),
    FOREIGN KEY (charger_id) REFERENCES chargers(id),
    FOREIGN KEY (slot_id) REFERENCES slots(id),
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_station (station_id),
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_reference (booking_reference),
    INDEX idx_bookings_date (booking_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

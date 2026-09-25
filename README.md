# ChargerGo — EV Charging Station Finder & Slot Reservation System

**Find. Reserve. Charge.**  
A full-stack, production-grade web application for locating verified high-speed EV charging stations across India and reserving guaranteed 30-minute charging windows.

---

## ⚡ Problem Statement & Objective

As electric vehicle adoption surges, EV drivers encounter significant uncertainty:
- Arriving at charging hubs only to find all connectors occupied
- Unpredictable queues and downtime during peak highway travel
- Inability to plan long-distance journeys around confirmed charging sessions

**ChargerGo** solves this by delivering a **map-first real-time reservation platform**, enabling drivers to find verified charging stations, inspect connector power capacities, and reserve time slots before arrival.

---

## 🌟 Key Features

### For EV Drivers (`USER` Role)
- **Map-Centric Search**: Interactive dark-themed Google Map showing verified charging hubs with dynamic status markers.
- **Instant Station Inspection**: Seamless side/bottom panel updates instantly on marker selection without page reloads.
- **Fast Filter Chips**: Filter by availability, charging speed (DC Fast, 120 kW+ Ultra-Fast), and connector types (CCS2, Type 2, CHAdeMO).
- **Guaranteed Slot Booking**: Reserve 30-minute time windows with unique reference IDs (`CG-YYYYMMDD-XXXX`) and instant confirmation QR codes.
- **Booking Management**: View upcoming, completed, and cancelled sessions with live cancellation that releases slots back to the network.
- **Driver Profile**: Manage account details and vehicle charging preferences.

### For Charging Station Operators (`ADMIN` Role)
- **Operations Console**: Monitor station utilization, active connectors, and reservation traffic.
- **Station Management**: Add new hubs, update operating hours, and deactivate stations.
- **Connector Configuration**: Configure charging units (power kW, connector standard, charging speeds).
- **Slot Management**: Create, block maintenance windows, and inspect scheduled sessions.
- **Driver Management**: Overview registered drivers and reservation history.

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐         ┌─────────────────────────────────┐         ┌───────────────────────┐
│       React 18 SPA (Vite)       │────────▶│      Spring Boot 3.2 REST       │────────▶│       MySQL 8.0       │
│  - Map-First UI (Google Maps)   │  REST   │  - Spring Security + JWT        │   JPA   │  - Normalized Schema  │
│  - Dark EV Theme (#B8FF00)      │  JSON   │  - Pessimistic Locking Slots    │Hibernate│  - Performance Index  │
│  - Port 5173                    │◀────────│  - Port 8080                    │◀────────│  - Port 3306          │
└─────────────────────────────────┘         └─────────────────────────────────┘         └───────────────────────┘
```

---

## 🎨 Visual Design System

The application uses an intentional dark EV mobility aesthetic:

| Design Token | Value | Description |
|---|---|---|
| `--primary` | `#B8FF00` | Electric Lime Green (Buttons, Active states, Available badges) |
| `--primary-contrast` | `#080B0F` | High-contrast black text on electric green buttons |
| `--background` | `#0B0E14` | Deep black canvas |
| `--surface` | `#121722` | Dark charcoal cards and panels |
| `--surface-hover` | `#18202F` | Interactive elevated surfaces |
| `--text` | `#F3F4F6` | High-contrast clean white text |
| `--text-secondary` | `#9CA3AF` | Neutral body labels |
| `--border` | `#222D3E` | Subtle structural dividers |

---

## 🔑 Environment Variables & Security

### Frontend (`frontend/.env`)
```properties
VITE_MAPS_API_KEY=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao
VITE_API_BASE_URL=/api
```

### Backend (`backend/src/main/resources/application.properties`)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ev_charging_db?useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password
app.jwt.secret=ev-charging-booking-secret-key-that-is-long-enough-for-hs512-algorithm-minimum-64-bytes-requirement
app.jwt.expiration-ms=86400000
```

---

## 🚀 Quick Setup & Run Guide

### 1. Database Setup (MySQL)
```sql
CREATE DATABASE IF NOT EXISTS ev_charging_db;
USE ev_charging_db;

-- Run schema and seed scripts:
mysql -u root -p ev_charging_db < database/schema.sql
mysql -u root -p ev_charging_db < database/seed.sql
```

### 2. Start Backend API
```bash
cd backend
mvn spring-boot:run
```
*API runs on `http://localhost:8080/api`*

### 3. Start Frontend Client
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🧪 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin Console** | `admin@evcharge.in` | `Admin@123` |
| **Driver (Aryan)** | `aryan@example.com` | `User@123` |
| **Driver (Priya)** | `priya@example.com` | `User@123` |

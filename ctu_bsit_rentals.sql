-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 06, 2026 at 02:26 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ctu_bsit_rentals`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL,
  `full_name` varchar(140) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `full_name`, `email`, `password_hash`, `created_at`) VALUES
(1, 'admin', 'CTU BSIT Administrator', 'bsit.admin@ctu-daanbantayan.local', '$2y$10$NKARJRIWMJyri8pb.6nvbesYa1Kk6xyZSBJWO61Hx41il5gcOMZ8G', '2026-10-21 12:23:21'),
(2, 'CTU-DB-BSIT-ADMIN', 'CTU Daanbantayan BSIT Administrator', 'admin@ctu-daanbantayan.local', '$2y$10$NKARJRIWMJyri8pb.6nvbesYa1Kk6xyZSBJWO61Hx41il5gcOMZ8G', '2026-10-21 12:23:21');

-- --------------------------------------------------------

--
-- Table structure for table `damage_reports`
--

CREATE TABLE `damage_reports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `rental_id` bigint(20) UNSIGNED NOT NULL,
  `reported_by` bigint(20) UNSIGNED NOT NULL,
  `incident_type` enum('damaged','lost') NOT NULL,
  `description` text NOT NULL,
  `estimated_cost` decimal(10,2) UNSIGNED DEFAULT NULL,
  `status` enum('reported','under_review','resolved') NOT NULL DEFAULT 'reported',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `damage_reports`
--

INSERT INTO `damage_reports` (`id`, `rental_id`, `reported_by`, `incident_type`, `description`, `estimated_cost`, `status`, `created_at`) VALUES
(3, 1, 1, 'damaged', 'broken', NULL, 'reported', '2026-10-29 13:23:03');

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(190) NOT NULL,
  `category` enum('microcontroller','prototyping','iot','cables','stationery') NOT NULL,
  `category_label` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `specs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`specs`)),
  `daily_rate` decimal(10,2) UNSIGNED NOT NULL,
  `deposit` decimal(10,2) UNSIGNED NOT NULL,
  `stock_total` int(10) UNSIGNED NOT NULL,
  `item_condition` enum('Excellent','Good','Fair') NOT NULL DEFAULT 'Good',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`id`, `name`, `category`, `category_label`, `description`, `specs`, `daily_rate`, `deposit`, `stock_total`, `item_condition`, `created_at`, `updated_at`, `is_active`) VALUES
(1, 'Arduino Uno R3 Starter Kit', 'microcontroller', 'Microcontroller', 'Starter kit for introductory programming, electronics, and classroom projects.', '[\"Arduino Uno R3 compatible board\",\"USB cable\",\"LEDs and resistors\",\"Basic jumper wires\"]', 35.00, 300.00, 5, 'Fair', '2026-10-08 13:56:00', '2026-10-29 13:14:53', 1),
(2, 'ESP32-WROOM-32 Development Kit', 'microcontroller', 'Microcontroller', 'Wi-Fi and Bluetooth development board for connected devices and IoT projects.', '[\"ESP32-WROOM-32 development board\", \"Wi-Fi and Bluetooth\", \"USB programming cable\", \"Breadboard-compatible pins\"]', 45.00, 350.00, 1, 'Good', '2026-10-08 13:56:00', '2026-10-08 13:56:00', 1),
(3, 'IoT Sensor Starter Kit', 'iot', 'IoT & Wireless', 'Multi-sensor kit for Arduino and ESP32 environmental and automation projects.', '[\"DHT11 temperature and humidity sensor\", \"HC-SR04 ultrasonic sensor\", \"PIR motion sensor\", \"Soil moisture sensor\", \"Photoresistor module\"]', 40.00, 320.00, 1, 'Good', '2026-10-08 13:56:00', '2026-10-08 13:56:00', 1),
(4, 'Breadboard & Jumper Wire Prototyping Kit', 'prototyping', 'Prototyping', 'Reusable solderless prototyping kit for building and testing circuits.', '[\"830-point solderless breadboard\", \"Assorted male-to-male jumper wires\", \"LED assortment\", \"Resistor assortment\"]', 15.00, 150.00, 1, 'Good', '2026-10-08 13:56:00', '2026-10-08 13:56:00', 1),
(5, 'Digital Multimeter', 'prototyping', 'Prototyping', 'Handheld meter for basic electronics troubleshooting and laboratory exercises.', '[\"AC and DC voltage measurement\", \"DC current measurement\", \"Resistance measurement\", \"Continuity and diode test\"]', 25.00, 250.00, 1, 'Good', '2026-10-08 13:56:00', '2026-10-08 13:56:00', 1),
(6, 'Cat6 Ethernet Cable (5m)', 'cables', 'Cables', 'Five-meter Ethernet cable for networking labs and device connections.', '[\"5-meter Cat6 cable\", \"RJ45 connectors\", \"Suitable for Gigabit Ethernet\"]', 10.00, 80.00, 1, 'Good', '2026-10-08 13:56:00', '2026-10-08 13:56:00', 1),
(7, 'Casio Scientific Calculator (fx-991ES Plus)', 'stationery', 'Academic Stationery & Math', 'Standard non-programmable scientific calculator approved for university exams, engineering, and mathematics coursework across all CTU programs.', '[\"417 functions\",\"Natural Textbook Display\",\"Solar plus battery dual power\",\"Approved for CTU departmental exams\"]', 15.00, 150.00, 5, 'Excellent', '2026-10-21 12:37:59', '2026-10-21 12:37:59', 1),
(8, 'Engineering Technical Drafting Kit', 'stationery', 'Drafting & Architecture', 'Complete drafting set for Engineering, Architecture, and Industrial Technology students doing plates, drawings, and blueprint exercises.', '[\"24-inch acrylic T-square\",\"30\\/60 and 45\\/90 drafting triangles\",\"Precision compass & divider set\",\"Architectural scale ruler\"]', 25.00, 200.00, 4, 'Good', '2026-10-21 12:37:59', '2026-10-21 12:37:59', 1),
(9, 'Wireless Presentation Clicker & Laser Pointer', 'stationery', 'Presentation & Defense', 'Ergonomic wireless presenter remote with bright laser pointer for capstone defenses, teaching demonstrations, and thesis reports.', '[\"Plug-and-play USB receiver\",\"Up to 15m operating range\",\"Slide navigation & black screen toggle\",\"Rechargeable battery\"]', 20.00, 180.00, 4, 'Excellent', '2026-10-21 12:37:59', '2026-10-21 12:37:59', 1),
(10, 'Laboratory Gown & Safety Goggles Set', 'stationery', 'Laboratory Gear', 'Official white cotton laboratory gown with impact-resistant splash safety goggles required for science, chemistry, and workshop lab sessions.', '[\"Heavy-duty white cotton lab coat\",\"Anti-fog splash goggles\",\"Three reinforced pockets\",\"Standard university lab compliance\"]', 20.00, 150.00, 6, 'Good', '2026-10-21 12:37:59', '2026-10-21 12:37:59', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `rental_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subject` varchar(190) NOT NULL,
  `message` text NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `rental_id`, `subject`, `message`, `created_by`, `created_at`, `read_at`) VALUES
(6, 1, 8, 'Overdue rental reminder', 'Your rental of Arduino Uno R3 Starter Kit (LN-8) was due on 2026-10-09. Please contact rental staff to arrange its return.', 1, '2026-10-21 13:09:23', '2026-11-04 13:25:00'),
(7, 1, 1, 'Overdue rental reminder', 'Your rental of Breadboard & Jumper Wire Prototyping Kit (LN-1) was due on 2026-10-09. Please contact rental staff to arrange its return.', 1, '2026-10-21 13:09:23', '2026-11-04 13:25:00'),
(8, 1, 6, 'Overdue rental reminder', 'Your rental of Digital Multimeter (LN-6) was due on 2026-10-09. Please contact rental staff to arrange its return.', 1, '2026-10-21 13:09:23', '2026-11-04 13:25:00'),
(9, 3, 3, 'Overdue rental reminder', 'Your rental of Cat6 Ethernet Cable (5m) (LN-3) was due on 2026-10-09. Please contact rental staff to arrange its return.', 1, '2026-10-21 13:09:23', '2026-10-29 13:50:30'),
(10, 3, 5, 'Overdue rental reminder', 'Your rental of Arduino Uno R3 Starter Kit (LN-5) was due on 2026-10-09. Please contact rental staff to arrange its return.', 1, '2026-10-21 13:09:23', '2026-10-29 13:50:30'),
(11, 1, 1, 'Overdue rental reminder', 'Your rental of Breadboard & Jumper Wire Prototyping Kit (LN-1) was due on 2026-10-09. Please contact rental staff to arrange its return.', 1, '2026-10-29 13:09:21', '2026-11-04 13:25:00'),
(12, 1, 1, 'Overdue rental reminder', 'Your rental of Breadboard & Jumper Wire Prototyping Kit (LN-1) was due on 2026-10-09. Please contact rental staff to arrange its return.', 1, '2026-10-29 13:09:31', '2026-11-04 13:25:00'),
(14, 1, 1, 'Overdue rental reminder', 'Your rental of Breadboard & Jumper Wire Prototyping Kit (LN-1) was due on 2026-10-09. Please contact rental staff to arrange its return.', 1, '2026-10-29 13:37:49', '2026-11-04 13:25:00'),
(15, 3, 11, 'Overdue rental reminder', 'Your rental of Cat6 Ethernet Cable (5m) (LN-11) was due on 2026-10-30. Please contact rental staff to arrange its return.', 1, '2026-11-04 13:29:22', NULL),
(16, 3, 14, 'Overdue rental reminder', 'Your rental of Arduino Uno R3 Starter Kit (LN-14) was due on 2026-10-31. Please contact rental staff to arrange its return.', 1, '2026-11-04 13:29:22', NULL),
(17, 3, 12, 'Overdue rental reminder', 'Your rental of Arduino Uno R3 Starter Kit (LN-12) was due on 2026-11-02. Please contact rental staff to arrange its return.', 1, '2026-11-04 13:29:22', NULL),
(18, 1, 16, 'Rental request approved', 'Your rental request has been approved. Please coordinate payment and item pickup with the administrator.', 1, '2026-11-04 13:30:52', NULL),
(19, 7, 17, 'Rental request approved', 'Your rental request has been approved. Please coordinate payment and item pickup with the administrator.', 1, '2026-11-04 13:46:13', '2026-11-04 14:00:17'),
(20, 7, 18, 'Rental request approved', 'Your rental request has been approved. Please coordinate payment and item pickup with the administrator.', 1, '2026-11-04 13:47:21', '2026-11-04 14:00:17'),
(21, 3, 14, 'Deposit Refund Receipt', 'Your refundable security deposit of ₱10.50 for Arduino Uno R3 Starter Kit (LN-14) has been approved and processed for refund following return inspection.', 1, '2026-11-04 13:58:35', NULL),
(22, 3, 10, 'Deposit Refund Receipt', 'Your refundable security deposit of ₱10.50 for Arduino Uno R3 Starter Kit (LN-10) has been approved and processed for refund following return inspection.', 1, '2026-11-04 13:58:35', NULL),
(23, 3, 5, 'Deposit Refund Receipt', 'Your refundable security deposit of ₱300.00 for Arduino Uno R3 Starter Kit (LN-5) has been approved and processed for refund following return inspection.', 1, '2026-11-04 13:58:35', NULL),
(24, 3, 3, 'Deposit Refund Receipt', 'Your refundable security deposit of ₱80.00 for Cat6 Ethernet Cable (5m) (LN-3) has been approved and processed for refund following return inspection.', 1, '2026-11-04 13:58:35', NULL),
(25, 1, 1, 'Deposit Refund Receipt', 'Your refundable security deposit of ₱150.00 for Breadboard & Jumper Wire Prototyping Kit (LN-1) has been approved and processed for refund following return inspection.', 1, '2026-11-04 13:58:35', NULL),
(26, 1, 6, 'Deposit Refund Receipt', 'Your refundable security deposit of ₱250.00 for Digital Multimeter (LN-6) has been approved and processed for refund following return inspection.', 1, '2026-11-04 13:58:35', NULL),
(27, 1, 8, 'Deposit Refund Receipt', 'Your refundable security deposit of ₱10.50 for Arduino Uno R3 Starter Kit (LN-8) has been approved and processed for refund following return inspection.', 1, '2026-11-04 13:58:35', NULL),
(28, 1, 9, 'Deposit Refund Receipt', 'Your refundable security deposit of ₱10.50 for Arduino Uno R3 Starter Kit (LN-9) has been approved and processed for refund following return inspection.', 1, '2026-11-04 13:58:35', NULL),
(29, 1, 7, 'Deposit Refund Receipt', 'Your refundable security deposit of ₱350.00 for ESP32-WROOM-32 Development Kit (LN-7) has been approved and processed for refund following return inspection.', 1, '2026-11-04 13:58:35', NULL),
(30, 1, 2, 'Deposit Refund Receipt', 'Your refundable security deposit of ₱250.00 for Digital Multimeter (LN-2) has been approved and processed for refund following return inspection.', 1, '2026-11-04 13:58:35', NULL),
(31, 3, 11, 'Overdue rental reminder', 'Your rental of Cat6 Ethernet Cable (5m) (LN-11) was due on 2026-10-30. Please contact rental staff to arrange its return.', 1, '2026-11-04 13:59:06', NULL),
(32, 3, 12, 'Overdue rental reminder', 'Your rental of Arduino Uno R3 Starter Kit (LN-12) was due on 2026-11-02. Please contact rental staff to arrange its return.', 1, '2026-11-04 13:59:06', NULL),
(33, 7, 19, 'Rental request approved', 'Your rental request has been approved. Please coordinate payment and item pickup with the administrator.', 1, '2026-11-04 14:00:59', '2026-11-04 14:13:32'),
(34, 8, 20, 'Rental request rejected', 'Your rental request was reviewed and rejected. Please contact the administrator if you need more information.', 1, '2026-11-04 14:13:57', '2026-11-04 14:14:00'),
(35, 8, 21, 'Rental request approved', 'Your rental request has been approved. Please coordinate payment and item pickup with the administrator.', 1, '2026-11-04 14:14:16', '2026-11-04 14:14:20');

-- --------------------------------------------------------

--
-- Table structure for table `overdue_records`
--

CREATE TABLE `overdue_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `rental_id` bigint(20) UNSIGNED NOT NULL,
  `detected_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `days_overdue` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `status` enum('open','resolved') NOT NULL DEFAULT 'open',
  `resolved_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `overdue_records`
--

INSERT INTO `overdue_records` (`id`, `rental_id`, `detected_at`, `days_overdue`, `status`, `resolved_at`, `updated_at`) VALUES
(1, 1, '2026-10-21 12:14:43', 20, 'resolved', '2026-10-29 14:05:20', '2026-10-29 14:05:20'),
(2, 3, '2026-10-21 12:14:43', 19, 'resolved', '2026-10-28 14:25:36', '2026-10-28 14:25:36'),
(3, 5, '2026-10-21 12:14:43', 19, 'resolved', '2026-10-28 14:25:38', '2026-10-28 14:25:38'),
(4, 6, '2026-10-21 12:14:43', 19, 'resolved', '2026-10-28 14:25:34', '2026-10-28 14:25:34'),
(5, 8, '2026-10-21 12:14:43', 19, 'resolved', '2026-10-28 14:25:32', '2026-10-28 14:25:32'),
(15, 9, '2026-10-28 14:25:11', 6, 'resolved', '2026-10-28 14:25:31', '2026-10-28 14:25:31'),
(72, 11, '2026-11-04 13:17:59', 5, 'resolved', '2026-11-04 13:59:20', '2026-11-04 13:59:20'),
(73, 12, '2026-11-04 13:17:59', 2, 'resolved', '2026-11-04 13:59:19', '2026-11-04 13:59:19'),
(74, 14, '2026-11-04 13:17:59', 4, 'resolved', '2026-11-04 13:51:45', '2026-11-04 13:51:45');

-- --------------------------------------------------------

--
-- Table structure for table `payment_records`
--

CREATE TABLE `payment_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `rental_id` bigint(20) UNSIGNED NOT NULL,
  `recorded_by` bigint(20) UNSIGNED NOT NULL,
  `payment_type` enum('rental_fee','deposit','refund','fine') NOT NULL,
  `amount` decimal(10,2) UNSIGNED NOT NULL,
  `method` enum('Cash','GCash','Maya','Other') NOT NULL,
  `reference` varchar(120) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_records`
--

INSERT INTO `payment_records` (`id`, `rental_id`, `recorded_by`, `payment_type`, `amount`, `method`, `reference`, `created_at`) VALUES
(2, 5, 2, 'rental_fee', 35.00, 'Cash', NULL, '2026-10-08 15:35:33'),
(3, 5, 2, 'deposit', 300.00, 'Cash', NULL, '2026-10-08 15:35:33'),
(4, 6, 1, 'rental_fee', 25.00, 'Cash', NULL, '2026-10-08 15:46:07'),
(5, 6, 1, 'deposit', 250.00, 'Cash', NULL, '2026-10-08 15:46:07'),
(6, 7, 1, 'rental_fee', 45.00, 'GCash', NULL, '2026-10-08 15:46:25'),
(7, 7, 1, 'deposit', 350.00, 'GCash', NULL, '2026-10-08 15:46:25'),
(8, 8, 1, 'rental_fee', 35.00, 'Maya', NULL, '2026-10-08 15:56:34'),
(9, 8, 1, 'deposit', 10.50, 'Maya', NULL, '2026-10-08 15:56:34'),
(10, 9, 1, 'rental_fee', 35.00, 'Cash', NULL, '2026-10-21 13:36:24'),
(11, 9, 1, 'deposit', 10.50, 'Cash', NULL, '2026-10-21 13:36:24'),
(12, 10, 3, 'rental_fee', 35.00, 'Cash', NULL, '2026-10-29 13:14:18'),
(13, 10, 3, 'deposit', 10.50, 'Cash', NULL, '2026-10-29 13:14:18'),
(14, 10, 1, 'deposit', 12.00, 'Cash', NULL, '2026-10-29 13:23:28'),
(15, 11, 3, 'rental_fee', 10.00, 'Cash', NULL, '2026-10-29 14:03:15'),
(16, 11, 3, 'deposit', 3.00, 'Cash', NULL, '2026-10-29 14:03:15'),
(17, 12, 3, 'rental_fee', 140.00, 'GCash', NULL, '2026-10-29 15:49:24'),
(18, 12, 3, 'deposit', 42.00, 'GCash', NULL, '2026-10-29 15:49:24'),
(19, 13, 3, 'rental_fee', 90.00, 'GCash', NULL, '2026-10-30 05:02:04'),
(20, 13, 3, 'deposit', 27.00, 'GCash', NULL, '2026-10-30 05:02:04'),
(21, 14, 3, 'rental_fee', 35.00, 'Cash', NULL, '2026-10-30 05:19:12'),
(22, 14, 3, 'deposit', 10.50, 'Cash', NULL, '2026-10-30 05:19:12'),
(23, 16, 1, 'rental_fee', 12.00, 'Cash', NULL, '2026-11-04 13:31:28'),
(24, 18, 1, 'rental_fee', 0.39, 'Cash', NULL, '2026-11-04 13:48:19'),
(25, 18, 1, 'rental_fee', 39.00, 'Cash', NULL, '2026-11-04 13:48:56'),
(26, 19, 1, 'rental_fee', 39.00, 'Cash', NULL, '2026-11-04 14:01:20'),
(27, 19, 1, 'rental_fee', 30.00, 'Cash', NULL, '2026-11-04 14:03:44'),
(28, 19, 1, 'rental_fee', 30.00, 'Cash', NULL, '2026-11-04 14:05:46'),
(29, 19, 1, 'deposit', 9.00, 'Cash', NULL, '2026-11-04 14:05:54'),
(30, 21, 1, 'rental_fee', 35.00, 'Cash', NULL, '2026-11-04 14:14:50'),
(31, 21, 1, 'deposit', 10.50, 'Cash', NULL, '2026-11-04 14:14:58');

-- --------------------------------------------------------

--
-- Table structure for table `rentals`
--

CREATE TABLE `rentals` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `inventory_id` bigint(20) UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `due_date` date NOT NULL,
  `daily_rate` decimal(10,2) UNSIGNED NOT NULL,
  `deposit` decimal(10,2) UNSIGNED NOT NULL,
  `payment_method` enum('Cash','GCash','Maya') NOT NULL,
  `status` enum('pending','approved','active','returned','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `returned_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rentals`
--

INSERT INTO `rentals` (`id`, `user_id`, `inventory_id`, `start_date`, `due_date`, `daily_rate`, `deposit`, `payment_method`, `status`, `created_at`, `returned_at`) VALUES
(1, 1, 4, '2026-10-08', '2026-10-09', 15.00, 150.00, 'Cash', 'returned', '2026-10-08 13:59:58', '2026-10-29 14:05:20'),
(2, 1, 5, '2026-10-08', '2026-10-09', 25.00, 250.00, 'GCash', 'returned', '2026-10-08 14:02:38', '2026-10-08 14:22:32'),
(3, 3, 6, '2026-10-08', '2026-10-09', 10.00, 80.00, 'Cash', 'returned', '2026-10-08 15:18:03', '2026-10-28 14:25:36'),
(5, 3, 1, '2026-10-08', '2026-10-09', 35.00, 300.00, 'Cash', 'returned', '2026-10-08 15:35:33', '2026-10-28 14:25:38'),
(6, 1, 5, '2026-10-08', '2026-10-09', 25.00, 250.00, 'Cash', 'returned', '2026-10-08 15:46:07', '2026-10-28 14:25:34'),
(7, 1, 2, '2026-10-08', '2026-10-09', 45.00, 350.00, 'GCash', 'returned', '2026-10-08 15:46:25', '2026-10-08 15:57:22'),
(8, 1, 1, '2026-10-08', '2026-10-09', 35.00, 10.50, 'Maya', 'returned', '2026-10-08 15:56:34', '2026-10-28 14:25:32'),
(9, 1, 1, '2026-10-21', '2026-10-22', 35.00, 10.50, 'Cash', 'returned', '2026-10-21 13:36:24', '2026-10-28 14:25:31'),
(10, 3, 1, '2026-10-29', '2026-10-30', 35.00, 10.50, 'Cash', 'returned', '2026-10-29 13:14:18', '2026-10-29 13:15:10'),
(11, 3, 6, '2026-10-29', '2026-10-30', 10.00, 3.00, 'Cash', 'returned', '2026-10-29 14:03:15', '2026-11-04 13:59:20'),
(12, 3, 1, '2026-10-29', '2026-11-02', 35.00, 42.00, 'GCash', 'returned', '2026-10-29 15:49:24', '2026-11-04 13:59:19'),
(13, 3, 4, '2026-10-30', '2026-11-05', 15.00, 27.00, 'GCash', 'returned', '2026-10-30 05:02:04', '2026-11-04 13:59:19'),
(14, 3, 1, '2026-10-30', '2026-10-31', 35.00, 10.50, 'Cash', 'returned', '2026-10-30 05:19:12', '2026-11-04 13:51:45'),
(16, 1, 1, '2026-11-04', '2026-11-05', 35.00, 10.50, 'Cash', 'approved', '2026-11-04 13:28:29', NULL),
(17, 7, 1, '2026-11-05', '2026-11-08', 35.00, 31.50, 'Cash', 'approved', '2026-11-04 13:45:23', NULL),
(18, 7, 7, '2026-11-13', '2026-11-15', 15.00, 9.00, 'Cash', 'approved', '2026-11-04 13:47:12', NULL),
(19, 7, 4, '2026-11-04', '2026-11-06', 15.00, 9.00, 'Cash', 'returned', '2026-11-04 14:00:35', '2026-11-04 14:15:28'),
(20, 8, 1, '2026-11-04', '2026-11-05', 35.00, 10.50, 'Cash', 'rejected', '2026-11-04 14:12:53', NULL),
(21, 8, 1, '2026-11-04', '2026-11-05', 35.00, 10.50, 'Cash', 'returned', '2026-11-04 14:14:09', '2026-11-04 14:15:14');

-- --------------------------------------------------------

--
-- Table structure for table `rental_returns`
--

CREATE TABLE `rental_returns` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `rental_id` bigint(20) UNSIGNED NOT NULL,
  `processed_by` bigint(20) UNSIGNED NOT NULL,
  `condition_on_return` enum('Excellent','Good','Fair','Damaged') NOT NULL DEFAULT 'Good',
  `notes` text DEFAULT NULL,
  `returned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rental_returns`
--

INSERT INTO `rental_returns` (`id`, `rental_id`, `processed_by`, `condition_on_return`, `notes`, `returned_at`) VALUES
(1, 7, 2, 'Good', NULL, '2026-10-08 15:57:22'),
(2, 9, 1, 'Good', NULL, '2026-10-28 14:25:31'),
(3, 8, 1, 'Good', NULL, '2026-10-28 14:25:32'),
(4, 6, 1, 'Good', NULL, '2026-10-28 14:25:34'),
(5, 3, 1, 'Good', NULL, '2026-10-28 14:25:36'),
(6, 5, 1, 'Good', NULL, '2026-10-28 14:25:38'),
(7, 10, 1, 'Damaged', NULL, '2026-10-29 13:15:10'),
(8, 1, 1, 'Good', NULL, '2026-10-29 14:05:20'),
(9, 14, 1, 'Good', NULL, '2026-11-04 13:51:45'),
(10, 12, 1, 'Good', NULL, '2026-11-04 13:59:19'),
(11, 13, 1, 'Good', NULL, '2026-11-04 13:59:19'),
(12, 11, 1, 'Good', NULL, '2026-11-04 13:59:20'),
(13, 21, 1, 'Good', NULL, '2026-11-04 14:15:14'),
(14, 19, 1, 'Good', NULL, '2026-11-04 14:15:28');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(190) NOT NULL,
  `contact_name` varchar(140) NOT NULL,
  `email` varchar(190) DEFAULT NULL,
  `supplied_items` varchar(500) NOT NULL DEFAULT '',
  `rating` tinyint(3) UNSIGNED DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact_name`, `email`, `supplied_items`, `rating`, `status`, `created_by`, `created_at`) VALUES
(2, 'Ctu', 'Sherlyn', 'rohrerz090844339@gmail.com', 'ESP32 kit', 3, 'active', 1, '2026-10-29 13:24:04');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `overdue_rate` decimal(10,2) UNSIGNED NOT NULL DEFAULT 20.00,
  `max_duration_days` smallint(5) UNSIGNED NOT NULL DEFAULT 14,
  `deposit_percent` decimal(5,2) UNSIGNED NOT NULL DEFAULT 30.00,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `overdue_rate`, `max_duration_days`, `deposit_percent`, `updated_by`, `updated_at`) VALUES
(1, 20.00, 14, 30.00, 1, '2026-10-29 13:24:59');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` varchar(40) NOT NULL,
  `full_name` varchar(140) NOT NULL,
  `email` varchar(190) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `school` varchar(190) NOT NULL,
  `program` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','admin') NOT NULL DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `student_id`, `full_name`, `email`, `phone`, `school`, `program`, `password_hash`, `role`, `created_at`) VALUES
(1, '1386338', 'Vince Gabriel Mahilum', 'vincegabrielmahilum08@gmail.com', '09084480104', 'Cebu Technological University', 'Bachelor of Science in Information Technology', '$2y$10$/tPWKaa3NR20kA2Y2l2/kuxcPVNaUVWGVENWCREIBRVcY09lBjrsa', 'student', '2026-10-08 13:59:16'),
(3, '8240289', 'Sherlyn Rohrer', 'rohrerz090844339@gmail.com', '09755481431', 'Cebu Technological University', 'Bachelor of Science in Information Technology', '$2y$10$mbxjycAFtcC8B/3ZFsKDteKrLTQT2r3ducNZgVoR63/nlHqHkoRq.', 'student', '2026-10-08 15:17:54'),
(6, '1386339', 'donnabel beraces', 'donna@gmail.com', '09123456789', 'Cebu Technological University', 'Bachelor of Science in Information Technology', '$2y$10$leGaRJvEAX8sdU3OKQaeoOEtal9.iMSpDCnEmotZBRXowIqqu1iJG', 'student', '2026-11-04 13:19:23'),
(7, '13863309', 'Sherlyn Rohrer', 'rohrez@gmail.com', '09084480104', 'Cebu Technological University', 'Bachelor Information Technology', '$2y$10$gJjtGaIwFrTi3TprzC.Ueerhl7aucXxV2mOAisAucgqwD7Alb9cby', 'student', '2026-11-04 13:44:57'),
(8, '12345678', 'Janua', 'janua@gmail.com', '09084480103', 'Cebu Technological University', 'BEED', '$2y$10$LeHLi5uy/t9Q0qTYgOJyauDDMcODmv/UQWHa01kee2b4.Sd0E0pYm', 'student', '2026-11-04 14:12:44');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `damage_reports`
--
ALTER TABLE `damage_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `damage_reports_reporter_fk` (`reported_by`),
  ADD KEY `damage_reports_rental_idx` (`rental_id`),
  ADD KEY `damage_reports_created_idx` (`created_at`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_rental_fk` (`rental_id`),
  ADD KEY `notifications_admin_fk` (`created_by`),
  ADD KEY `notifications_user_created_idx` (`user_id`,`created_at`),
  ADD KEY `notifications_user_read_idx` (`user_id`,`read_at`);

--
-- Indexes for table `overdue_records`
--
ALTER TABLE `overdue_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rental_id` (`rental_id`),
  ADD KEY `overdue_records_status_days_idx` (`status`,`days_overdue`),
  ADD KEY `overdue_records_detected_idx` (`detected_at`);

--
-- Indexes for table `payment_records`
--
ALTER TABLE `payment_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_records_admin_fk` (`recorded_by`),
  ADD KEY `payment_records_rental_idx` (`rental_id`),
  ADD KEY `payment_records_type_idx` (`payment_type`),
  ADD KEY `payment_records_created_idx` (`created_at`);

--
-- Indexes for table `rentals`
--
ALTER TABLE `rentals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rentals_user_status_idx` (`user_id`,`status`),
  ADD KEY `rentals_inventory_status_idx` (`inventory_id`,`status`);

--
-- Indexes for table `rental_returns`
--
ALTER TABLE `rental_returns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rental_id` (`rental_id`),
  ADD KEY `rental_returns_staff_fk` (`processed_by`),
  ADD KEY `rental_returns_returned_at_idx` (`returned_at`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `suppliers_admin_fk` (`created_by`),
  ADD KEY `suppliers_status_idx` (`status`),
  ADD KEY `suppliers_name_idx` (`name`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `system_settings_admin_fk` (`updated_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `damage_reports`
--
ALTER TABLE `damage_reports`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `overdue_records`
--
ALTER TABLE `overdue_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=118;

--
-- AUTO_INCREMENT for table `payment_records`
--
ALTER TABLE `payment_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `rentals`
--
ALTER TABLE `rentals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `rental_returns`
--
ALTER TABLE `rental_returns`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `damage_reports`
--
ALTER TABLE `damage_reports`
  ADD CONSTRAINT `damage_reports_rental_fk` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`),
  ADD CONSTRAINT `damage_reports_reporter_fk` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_rental_fk` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`),
  ADD CONSTRAINT `notifications_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `overdue_records`
--
ALTER TABLE `overdue_records`
  ADD CONSTRAINT `overdue_records_rental_fk` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`);

--
-- Constraints for table `payment_records`
--
ALTER TABLE `payment_records`
  ADD CONSTRAINT `payment_records_rental_fk` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`);

--
-- Constraints for table `rentals`
--
ALTER TABLE `rentals`
  ADD CONSTRAINT `rentals_inventory_fk` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`),
  ADD CONSTRAINT `rentals_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `rental_returns`
--
ALTER TABLE `rental_returns`
  ADD CONSTRAINT `rental_returns_rental_fk` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 27, 2023 at 01:01 PM
-- Server version: 10.6.14-MariaDB-cll-lve
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u129841553_educ_room_util`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_register`
--

CREATE TABLE `admin_register` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_register`
--

INSERT INTO `admin_register` (`id`, `name`, `password`) VALUES
(5, 'admin', '$2y$10$OmPOoEnrQqswV7G6ddbgdeSkpjiFOVjn.nkGAxiaaB.oK/SCEIITO');

-- --------------------------------------------------------

--
-- Table structure for table `blocks_detail`
--

CREATE TABLE `blocks_detail` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `year_level` varchar(255) NOT NULL,
  `advisor` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blocks_detail`
--

INSERT INTO `blocks_detail` (`id`, `name`, `year_level`, `advisor`) VALUES
(1, 'BSED 3 ENGLISH', '3rd year', 'None'),
(2, 'BSED 3 SCIENCE', '3rd year', 'None'),
(3, 'BSED 3 MATHEMATICS', '3rd year', 'None'),
(4, 'BEED 3', '3rd year', 'None'),
(5, 'BTLED 3', '3rd year', 'None'),
(6, 'Combined BSED 3  SCIENCE and MATHEMATICS', '3rd year', 'None'),
(7, 'Combine BTLED and BEED 3', '3rd year', 'None');

-- --------------------------------------------------------

--
-- Table structure for table `exprimental_studentlist`
--

CREATE TABLE `exprimental_studentlist` (
  `id` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `block` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exprimental_studentlist`
--

INSERT INTO `exprimental_studentlist` (`id`, `Name`, `block`) VALUES
(1, 'Juan Dela Cruz', ''),
(3, 'Ako ay Student', ''),
(4, 'Mark Joshua Rance', ''),
(5, 'Rogen Ramilo', ''),
(6, 'Arth Roi Castillo', ''),
(7, 'Duane Jaynn Gaytano', ''),
(8, 'Alma Jean Modesto', ''),
(9, 'Jeressa Mae Valeros', ''),
(10, 'Kaye Rollo', ''),
(11, 'Darryl Rivas', ''),
(12, 'Via Rom', ''),
(13, 'Salvacion Ramo', ''),
(14, 'Brandon Rabino', ''),
(15, 'Ervin Rase', ''),
(16, 'Maricel Rollon', ''),
(17, 'Nikka Jane Vicente', ''),
(18, 'Shiela Rabino', ''),
(19, 'Rica Manes', ''),
(20, 'Jecel Mae Conde', '');

-- --------------------------------------------------------

--
-- Table structure for table `it_faculty`
--

CREATE TABLE `it_faculty` (
  `id` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Academic_Rank` varchar(255) NOT NULL,
  `Advisory` varchar(255) NOT NULL,
  `password` varchar(250) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `it_faculty`
--

INSERT INTO `it_faculty` (`id`, `Name`, `Academic_Rank`, `Advisory`, `password`, `timestamp`) VALUES
(1, 'Admin', 'Not specified', 'None', NULL, '2023-10-14 07:52:09'),
(2, 'Gerardo Ribon', 'Instructor III', 'None', '$2y$10$jKZ/bFkUDOPRPdjhSnMDa.COTxIzBMulQ1xNbfpeaEQqdlLXuzy/6', '2023-10-04 01:51:39'),
(3, 'Clara Jean Juanzo', 'Instructor I', 'None', '$2y$10$WXYGTLBKIuj.0c5/wHkqqetfi3Gr.Xg1lBeYo.Sh54KO1s3Ds2A4a', '2023-10-09 02:41:38'),
(4, 'Angelica Rico', 'Lecturer', 'None', '$2y$10$RdqiRRgxhx7zM3G3eKCaFud947hlJOnHgt553dGrQDu2ZboynRY8u', '2023-10-06 07:13:32'),
(5, 'Raymund Ipedro', 'Instructor I', 'None', '$2y$10$8HZ0aivzyDETDa2wQWSC3uG53Zc4GIz9paNnDRsFQymyNSceDFeKe', '2023-10-09 02:35:11'),
(6, 'Ma Lourdes Rivero', 'Lecturer', 'None', '$2y$10$BAv2Uikeak5miBBiH/Pj8u1n6BUWMQbB4g9Fa7qLlJgSvQba9Zf.G', '2023-10-06 06:38:42'),
(7, 'Ezekiel Roa', 'Lecturer', 'None', '$2y$10$q36BJbXRNMWk6kmLu4cH6ekZkUs93m73GrcbZ5l3qBF8cb./g4EXy', '2023-10-04 05:54:54'),
(8, 'Marco Rivas', 'Lecturer', 'None', NULL, '2023-09-25 09:00:21'),
(9, 'Reynaldo Catajay', 'Instructor I', 'None', '$2y$10$F0/CMRXnaVYaMPZ/0Ubj2e7vUg.3y6UdChKyWABwjgxC2mLCVMB5u', '2023-10-04 01:49:39'),
(10, 'Jasmin Rotoni', 'Lecturer', 'None', NULL, '2023-09-25 09:01:29'),
(11, 'Debbie Bacalso', 'Lecturer', 'None', '$2y$10$fxulhGTcUUU.0uLJSZQI2O9R5HGFMxHY3bypi50QQF01juTzez3km', '2023-10-04 01:35:31'),
(12, 'Abegail Rojo', 'Lecturer', 'None', '$2y$10$RxprZ64XZlomtmyl9Hms..JSztpSM2Kk02ON5sBaQ1nJJZ0IeqOzS', '2023-10-26 16:33:58'),
(13, 'Carren May Juanzo', 'Lecturer', 'None', '$2y$10$.lZwl5JTbWzvwylJ1eUq6.zPFHEK6h2YRqtIiFDmNTK3xIhvHDReu', '2023-10-09 03:39:18'),
(14, 'Cheliza Rabusa', 'Lecturer', 'None', NULL, '2023-09-25 15:59:03'),
(15, 'Romeylene Rabino', 'Lecturer', 'None', NULL, '2023-09-26 05:09:07'),
(16, 'Jodel Adremesin', 'Lecturer', 'None', NULL, '2023-09-26 09:53:29'),
(17, 'Jelmar Faalam', 'Lecturer', 'None', NULL, '2023-09-26 09:54:06');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `room` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `room`) VALUES
(2, '201'),
(3, 'Backstage'),
(4, 'Defense Room'),
(5, '205'),
(6, 'Canteen'),
(7, '203'),
(8, '202'),
(9, '103'),
(11, '102 - OSAS Office'),
(12, '206'),
(13, 'Covered Court'),
(14, 'Stage'),
(15, 'none');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `id` int(11) NOT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `blocks` varchar(255) DEFAULT NULL,
  `year_level` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`id`, `student_name`, `blocks`, `year_level`, `password`) VALUES
(1, 'Juan Dela Cruz', 'BEED', NULL, '$2y$10$nX8iuBoTIiW1psOyxKfJ7e4dWPRvvF1.zIiLP4624PTJ7orAQ.bU2'),
(2, 'Mark Joshua Rance', 'BSED 3 ENGLISH', NULL, '$2y$10$ODjxEMZChw1NUvjsL.rnL.jHw.QoFplZvRtSlb9h6zj6Q83hjyFD2'),
(3, 'Rogen Ramilo', 'BSED 3 MATHEMATICS', NULL, '$2y$10$h7lL4pXQqIE2WXOq6YCpyO8RRknrdM235oQ.t4m6rYCtjkVr/9hWS'),
(4, 'Arth Roi Castillo', 'BSED 3 SCIENCE', NULL, '$2y$10$HksIN3DTEoQgzJeE7xb85eI25jkOd/xp6Oxwj6EUxPnL2uWizw1.m'),
(5, 'Duane Jaynn Gaytano', 'BTLED 3', NULL, '$2y$10$8SP7uI/t3V04WghVbn0tje32aN6R6tUV/j4oKpuQvfxaWKyl8FWAq'),
(6, 'Salvacion Ramo', 'BTLED 3', NULL, '$2y$10$mruDkFYZ.jd.bO9UU6lQreW7jWaGDQnI27BCfCtipeLFiXFDIzq8m'),
(7, 'Via Rom', 'BSED 3 MATHEMATICS', NULL, '$2y$10$85O4s2FaPlaRlEPQ1YrFyOsSiXU1QLoV/IRGTAW54a4Lw9SaBz4Um'),
(8, 'Ervin Rase', 'BSED 3 MATHEMATICS', NULL, '$2y$10$oFohweHXSYSapP4tYwudjeobIn1wwNV5tly3gznira42YmaKVaITi'),
(9, 'Maricel Rollon', 'BSED 3 ENGLISH', NULL, '$2y$10$pYczoPN9JSsPISYY0p/wdOReV/0oNSszb9rSfO8sHTIN916hVC5S6'),
(10, 'Shiela Rabino', 'BSED 3 ENGLISH', NULL, '$2y$10$414tCj9fUqCDPiZSlg9eU.nTOxfQL8nStGdvaNVAqcyhLTNX2sooC'),
(11, 'Nikka Jane Vicente', 'BSED 3 ENGLISH', NULL, '$2y$10$JZCAR/Z07Z9V2khkYN5U4u8/EKZbh.IrSxjiYlp4EGducVZ6SLgoy'),
(12, 'Jecel Mae Conde', 'BSED 3 ENGLISH', NULL, '$2y$10$WipzylW1TpUEWOp2LytT5.Lz23fWcpoXWQbj6V9FfqRDmJva7X13K'),
(13, 'Rica Manes', 'BSED 3 ENGLISH', NULL, '$2y$10$UPrLBKhuezf5CrfRi5HQXO9hBwMb62oIb1YtmZP.mqJ1Md2dm7jWO');

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `subject_id` int(11) NOT NULL,
  `subject_code` varchar(250) NOT NULL,
  `subject_description` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`subject_id`, `subject_code`, `subject_description`) VALUES
(1, 'Prof Ed 5', 'Facilitating Learner Centered Teaching'),
(2, 'Prof Ed 6', 'Assessment in Learning 1'),
(3, 'Prof Ed 8', 'Technology for Teaching and Learning 1'),
(4, 'EL 106', 'Teaching and Assessment of Literature Studies'),
(5, 'EL 115', 'Survey of English and American Literature'),
(6, 'EL 116', 'Contemporary, Popular, and Emergent Literature'),
(7, 'EL 119', 'Campus Journalism'),
(9, 'Bio 3', 'Genetics'),
(10, 'Chem 3', 'Biochemistry'),
(11, 'Phys 3', 'Thermodynamics'),
(12, 'Phys 4', 'Waves and Optics'),
(13, 'EE 3', 'Environmental Science'),
(14, 'M108', 'Calculus 3'),
(15, 'M109', 'Modern Geometry'),
(16, 'M112', 'Linear Algebra'),
(17, 'M113', 'Advanced Statistics'),
(18, 'MTB-MLE', 'Content and Pedagogy for the Mother Tongue'),
(19, 'ENG 1', 'Teaching English in the Elementary Grades (Language)'),
(20, 'TTL', 'Technology for Teaching and Learning in the Elementary Grades'),
(21, 'ENG 2', 'Teaching in English in the Elementary Grades through Literature'),
(22, 'TLE 1', 'Edukasyong Pantahanan at Pangkabuhayan'),
(23, 'EL120', 'Technology in Language Education'),
(24, 'TLE 7', 'Agri-Fishery Part I'),
(25, 'TLE 9', 'Entrepreneurship'),
(26, 'HE 5', 'Fundamentals of Food Technology'),
(27, 'HE 9', 'Clothing Selection, Purchase and Care'),
(28, 'HE 11', 'Arts in Daily Living'),
(29, 'Research 1', 'Methods of Research');

-- --------------------------------------------------------

--
-- Table structure for table `table_sched`
--

CREATE TABLE `table_sched` (
  `id` int(11) NOT NULL,
  `faculty` varchar(250) NOT NULL,
  `blocks` varchar(250) NOT NULL,
  `subject` varchar(250) NOT NULL,
  `room` varchar(250) NOT NULL,
  `Monday` varchar(250) NOT NULL DEFAULT 'red',
  `Tuesday` varchar(250) NOT NULL DEFAULT 'red',
  `Wednesday` varchar(250) NOT NULL DEFAULT 'red',
  `Thursday` varchar(250) NOT NULL DEFAULT 'red',
  `Friday` varchar(250) NOT NULL DEFAULT 'red',
  `Saturday` varchar(250) NOT NULL DEFAULT 'red',
  `Sunday` varchar(250) NOT NULL DEFAULT 'red',
  `Start_Time` time NOT NULL,
  `End_Time` time NOT NULL,
  `Semester` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `table_sched`
--

INSERT INTO `table_sched` (`id`, `faculty`, `blocks`, `subject`, `room`, `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`, `Start_Time`, `End_Time`, `Semester`) VALUES
(1, 'Debbie Bacalso', 'BTLED', 'Arts in Daily Living', 'Canteen', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '09:01:00', '10:00:00', '1st Sem'),
(2, 'Debbie Bacalso', 'BTLED', 'Entrepreneurship', 'Canteen', 'red', 'green', 'red', 'green', 'red', 'red', 'red', '13:01:00', '14:30:00', '1st Sem'),
(3, 'Abegail Rojo', 'BTLED', 'Clothing Selection, Purchase and Care', '103', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '14:01:00', '15:00:00', '1st Sem'),
(4, 'Angelica Rico', 'Combine BTLED and BEED 3', 'Facilitating Learner Centered Teaching', '201', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '15:01:00', '16:00:00', '1st Sem'),
(5, 'Carren May Juanzo', 'BTLED', 'Fundamentals of Food Technology', 'Canteen', 'red', 'green', 'red', 'green', 'red', 'red', 'red', '10:31:00', '12:00:00', '1st Sem'),
(6, 'Cheliza Rabusa', 'Combine BTLED and BEED 3', 'Technology for Teaching and Learning 1', '201', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '16:01:00', '17:00:00', '1st Sem'),
(7, 'Clara Jean Juanzo', 'BTLED', 'Methods of Research', 'Defense Room', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '10:01:00', '11:00:00', '1st Sem'),
(8, 'Raymund Ipedro', 'Combine BTLED and BEED 3', 'Assessment in Learning 1', 'Canteen', 'red', 'green', 'red', 'green', 'red', 'red', 'red', '14:31:00', '16:00:00', '1st Sem'),
(9, 'Gerardo Ribon', 'BSED 3 MATHEMATICS', 'Advanced Statistics', 'Defense Room', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '09:01:00', '10:00:00', '1st Sem'),
(13, 'Angelica Rico', 'BSED 3 MATHEMATICS', 'Facilitating Learner Centered Teaching', 'Defense Room', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '13:01:00', '14:00:00', '1st Sem'),
(15, 'Gerardo Ribon', 'BSED 3 ENGLISH', 'Assessment in Learning 1', '203', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '13:01:00', '14:00:00', '1st Sem'),
(16, 'Angelica Rico', 'BSED 3 ENGLISH', 'Facilitating Learner Centered Teaching', '203', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '14:01:00', '15:00:00', '1st Sem'),
(18, 'Clara Jean Juanzo', 'BSED 3 ENGLISH', 'Technology in Language Education', '206', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '11:01:00', '12:00:00', '1st Sem'),
(19, 'Clara Jean Juanzo', 'BSED 3 ENGLISH', 'Survey of English and American Literature', '203', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '15:01:00', '16:00:00', '1st Sem'),
(21, 'Reynaldo Catajay', 'BSED 3 ENGLISH', 'Contemporary, Popular, and Emergent Literature', '203', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '16:01:00', '17:00:00', '1st Sem'),
(22, 'Cheliza Rabusa', 'BSED 3 ENGLISH', 'Technology for Teaching and Learning 1', '202', 'red', 'green', 'red', 'green', 'red', 'red', 'red', '09:01:00', '10:30:00', '1st Sem'),
(23, 'Cheliza Rabusa', 'BSED 3 MATHEMATICS', 'Technology for Teaching and Learning 1', '102 - OSAS Office', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '15:01:00', '16:00:00', '1st Sem'),
(24, 'Raymund Ipedro', 'BSED 3 MATHEMATICS', 'Linear Algebra', '102 - OSAS Office', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '10:01:00', '11:00:00', '1st Sem'),
(25, 'Raymund Ipedro', 'BSED 3 MATHEMATICS', 'Assessment in Learning 1', '102 - OSAS Office', 'red', 'green', 'red', 'green', 'red', 'red', 'red', '14:01:00', '15:00:00', '1st Sem'),
(26, 'Angelica Rico', 'BSED 3 SCIENCE', 'Facilitating Learner Centered Teaching', '202', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '13:01:00', '14:00:00', '1st Sem'),
(27, 'Raymund Ipedro', 'BSED 3 SCIENCE', 'Assessment in Learning 1', '202', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '14:01:00', '15:00:00', '1st Sem'),
(28, 'Gerardo Ribon', 'BSED 3 SCIENCE', 'Technology for Teaching and Learning 1', '202', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '15:01:00', '16:00:00', '1st Sem'),
(29, 'Jasmin Rotoni', 'BSED 3 SCIENCE', 'Genetics', '202', 'red', 'green', 'red', 'green', 'red', 'red', 'red', '13:01:00', '16:00:00', '1st Sem'),
(33, 'Reynaldo Catajay', 'BSED 3 SCIENCE', 'Thermodynamics', 'Backstage', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '08:01:00', '10:00:00', '1st Sem'),
(35, 'Jasmin Rotoni', 'BSED 3 SCIENCE', 'Biochemistry', '202', 'red', 'green', 'red', 'green', 'red', 'red', 'red', '07:31:00', '09:00:00', '1st Sem'),
(36, 'Reynaldo Catajay', 'BSED 3 SCIENCE', 'Environmental Science', 'Backstage', 'red', 'green', 'red', 'green', 'red', 'red', 'red', '10:31:00', '12:00:00', '1st Sem'),
(37, 'Jasmin Rotoni', 'BSED 3 SCIENCE', 'Waves and Optics', 'Backstage', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '10:01:00', '12:00:00', '1st Sem'),
(38, 'Romeylene Rabino', 'BSED 3 ENGLISH', 'Teaching and Assessment of Literature Studies', '203', 'red', 'green', 'red', 'green', 'red', 'red', 'red', '13:01:00', '15:00:00', '1st Sem'),
(39, 'Clara Jean Juanzo', 'BSED 3 ENGLISH', 'Campus Journalism', '203', 'red', 'green', 'red', 'green', 'red', 'red', 'red', '15:31:00', '17:00:00', '1st Sem'),
(40, 'Gerardo Ribon', 'BSED 3 MATHEMATICS', 'Calculus 3', 'Defense Room', 'red', 'green', 'red', 'red', 'red', 'red', 'red', '13:01:00', '16:00:00', '1st Sem'),
(41, 'Gerardo Ribon', 'BSED 3 MATHEMATICS', 'Modern Geometry', 'Defense Room', 'red', 'red', 'red', 'green', 'red', 'red', 'red', '13:01:00', '16:00:00', '1st Sem'),
(43, 'Ma Lourdes Rivero', 'BEED 3', 'Content and Pedagogy for the Mother Tongue', 'Stage', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '13:01:00', '14:00:00', '1st Sem'),
(44, 'Ezekiel Roa', 'BEED 3', 'Teaching English in the Elementary Grades (Language)', 'Backstage', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '14:01:00', '15:00:00', '1st Sem'),
(45, 'Ezekiel Roa', 'BEED 3', 'Technology for Teaching and Learning in the Elementary Grades', 'Backstage', 'red', 'green', 'red', 'green', 'red', 'red', 'red', '13:01:00', '14:30:00', '1st Sem'),
(48, 'Ma Lourdes Rivero', 'BEED 3', 'Teaching in English in the Elementary Grades through Literature', 'Backstage', 'red', 'green', 'red', 'green', 'red', 'red', 'red', '07:31:00', '09:00:00', '1st Sem'),
(49, 'None', 'BEED 3', 'Edukasyong Pantahanan at Pangkabuhayan', 'none', 'green', 'red', 'green', 'red', 'green', 'red', 'red', '12:01:00', '14:00:00', '1st Sem'),
(50, 'Debbie Bacalso', 'BTLED 3', 'Arts in Daily Living', 'Canteen', 'red', 'red', 'red', 'red', 'red', 'green', 'red', '08:01:00', '09:00:00', '1st Sem'),
(51, 'Angelica Rico', 'Combined BSED 3  SCIENCE and MATHEMATICS', 'Facilitating Learner Centered Teaching', '202', 'red', 'red', 'red', 'red', 'red', 'green', 'red', '08:01:00', '09:00:00', '1st Sem');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_register`
--
ALTER TABLE `admin_register`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `blocks_detail`
--
ALTER TABLE `blocks_detail`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exprimental_studentlist`
--
ALTER TABLE `exprimental_studentlist`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `it_faculty`
--
ALTER TABLE `it_faculty`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`subject_id`);

--
-- Indexes for table `table_sched`
--
ALTER TABLE `table_sched`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_register`
--
ALTER TABLE `admin_register`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `blocks_detail`
--
ALTER TABLE `blocks_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `exprimental_studentlist`
--
ALTER TABLE `exprimental_studentlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `it_faculty`
--
ALTER TABLE `it_faculty`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `subject`
--
ALTER TABLE `subject`
  MODIFY `subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `table_sched`
--
ALTER TABLE `table_sched`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

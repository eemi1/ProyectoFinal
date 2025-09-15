-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-07-2025 a las 16:49:23
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS fory_factory_db;
USE fory_factory_db;

-- ==========================================
-- Tablas de usuarios y roles
-- ==========================================
CREATE TABLE `rol` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `rol` (`nombre`) VALUES
('cliente'),
('administrador'),
('mozo'),
('cocinero'),
('gerente'),
('delivery');

CREATE TABLE `usuario` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombreCompleto` VARCHAR(255) NOT NULL,
  `mail` VARCHAR(255) NOT NULL UNIQUE,
  `contraseña` VARCHAR(255) NOT NULL,
  `telefono` INT NOT NULL,
  `id_rol` INT NOT NULL DEFAULT 1,
  `fechaNacimiento` DATE,
  `fechaRegistro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ==========================================
-- Tablas específicas por rol
-- ==========================================
CREATE TABLE `administrador` (
  `id_usuario` INT NOT NULL PRIMARY KEY,
  `sueldo` DECIMAL(10,2) DEFAULT NULL,
  `telefono` VARCHAR(50) DEFAULT NULL,
  CONSTRAINT `administrador_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE
);

CREATE TABLE `gerente` (
  `id_usuario` INT NOT NULL PRIMARY KEY,
  `sueldo` DECIMAL(10,2) DEFAULT NULL,
  `turno` VARCHAR(50) DEFAULT NULL,
  CONSTRAINT `gerente_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE
);

CREATE TABLE `cliente` (
  `id_usuario` INT NOT NULL PRIMARY KEY,
  `preferencias` TEXT DEFAULT NULL,
  `alergias` TEXT DEFAULT NULL,
  `favoritos` TEXT DEFAULT NULL,
  CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE
);

CREATE TABLE `direccion_cliente` (
  `id_direccion` INT AUTO_INCREMENT PRIMARY KEY,
  `id_cliente` INT NOT NULL,
  `direccion` VARCHAR(255) NOT NULL,
  `pisoApartamento` VARCHAR(100),
  `indicaciones` VARCHAR(255),
  FOREIGN KEY (`id_cliente`) REFERENCES `cliente`(`id_usuario`) ON DELETE CASCADE
);

CREATE TABLE `cocinero` (
  `id_usuario` INT NOT NULL PRIMARY KEY,
  `sueldo` DECIMAL(10,2) DEFAULT NULL,
  `turno` VARCHAR(50) DEFAULT NULL,
  `especialidad` VARCHAR(100) DEFAULT NULL,
  CONSTRAINT `cocinero_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE
);

CREATE TABLE `delivery` (
  `id_usuario` INT NOT NULL PRIMARY KEY,
  `sueldo` DECIMAL(10,2) DEFAULT NULL,
  `telefono` VARCHAR(20) DEFAULT NULL,
  `turno` VARCHAR(50) DEFAULT NULL,
  `disponibilidad` VARCHAR(100) DEFAULT NULL,
  CONSTRAINT `delivery_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE
);

CREATE TABLE `mozo` (
  `id_usuario` INT NOT NULL PRIMARY KEY,
  `sueldo` DECIMAL(10,2) DEFAULT NULL,
  `turno` VARCHAR(50) DEFAULT NULL,
  CONSTRAINT `mozo_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE
);

-- ==========================================
-- Tablas de Ingredientes
-- ==========================================
CREATE TABLE ingrediente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo ENUM('Verdura','Lácteo','Carne','Condimento','Otro') NOT NULL,
    fecha_vencimiento DATE,
    unidad ENUM('kg','g','l','ml','otro') NOT NULL,
    proveedor VARCHAR(255),
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ==========================================
-- Platos, productos y relaciones
-- ==========================================
CREATE TABLE `plato` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL,
  `precio` DECIMAL(10,2) NOT NULL
);

CREATE TABLE `plato_ingrediente` (
  `id_plato` INT NOT NULL,
  `id_ingrediente` INT NOT NULL,
  PRIMARY KEY (`id_plato`,`id_ingrediente`),
  FOREIGN KEY (`id_plato`) REFERENCES `plato` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`id_ingrediente`) REFERENCES `ingrediente` (`id`) ON DELETE CASCADE
);

CREATE TABLE `categoria_productos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO `categoria_productos` (`nombre`) VALUES
('Bebidas'),
('Entradas'),
('Platos Principales'),
('Postres'),
('Snacks');

CREATE TABLE `producto` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_categoria` INT NOT NULL,
  `nombre` VARCHAR(255) NOT NULL,
  `precio` DECIMAL(10,2) NOT NULL,
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_productos`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- ==========================================
-- Mesas, reservas, pedidos y puntos
-- ==========================================
CREATE TABLE `mesa` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `numero` INT NOT NULL UNIQUE,
  `capacidad` INT NOT NULL,
  `estado` VARCHAR(50) DEFAULT NULL
);

CREATE TABLE `reservas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_cliente` INT NOT NULL,
  `id_mesa` INT NOT NULL,
  `fechaReserva` DATETIME NOT NULL,
  `fechaActual` DATETIME DEFAULT current_timestamp(),
  `numeroPersonas` INT NOT NULL,
  `estado` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_usuario`),
  FOREIGN KEY (`id_mesa`) REFERENCES `mesa` (`id`)
);

CREATE TABLE `noshow` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_reserva` INT NOT NULL UNIQUE,
  `penalizacion` VARCHAR(255) DEFAULT NULL,
  CONSTRAINT `noshow_ibfk_1` FOREIGN KEY (`id_reserva`) REFERENCES `reservas` (`id`) ON DELETE CASCADE
);

CREATE TABLE `pedido` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_cliente` INT NOT NULL,
  `id_producto` INT DEFAULT NULL,
  `id_plato` INT DEFAULT NULL,
  `id_mesa` INT NOT NULL,
  `fecha` DATETIME DEFAULT current_timestamp(),
  `cantidad` INT DEFAULT 1,
  CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_usuario`),
  CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id`),
  CONSTRAINT `pedido_ibfk_3` FOREIGN KEY (`id_plato`) REFERENCES `plato` (`id`),
  CONSTRAINT `pedido_ibfk_4` FOREIGN KEY (`id_mesa`) REFERENCES `mesa` (`id`)
);

CREATE TABLE `puntos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_cliente` INT NOT NULL,
  `puntos_acumulados` INT NOT NULL,
  `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  CONSTRAINT `puntos_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_usuario`) ON DELETE CASCADE
);

-- Usuarios de prueba
INSERT INTO `usuario` 
(`nombreCompleto`, `mail`, `contraseña`, `telefono`, `id_rol`, `fechaNacimiento`) 
VALUES 
-- Passwords Admin: admin123, Cliente: cliente123, Mozo: mozo123
('Admin', 'admin@foryfactory.com', '$2y$10$4szsM5D7XvBEufIKWjUsUO1qnQ2PP/GkzMuULCfhHweDHTIkiwlRa', 123456789, 2, '1990-01-01'), 
('Cliente', 'cliente@foryfactory.com', '$2y$10$dF9ior/YFTNQUnDJ3Z.OPuYJaLOFN6hH4PjZCZj2s2HKYyN8BhhR2', 987654321, 1, '2000-05-15'),
('Mozo', 'mozo@foryfactory.com', '$2y$10$TFRYPLrBqkgpuhdpyTUMlODgGa600iTPkCzmga0RGf5kmH3/pC8p2', 456789123, 3, '1995-03-20');

COMMIT;

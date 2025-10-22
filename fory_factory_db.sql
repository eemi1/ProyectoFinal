-- phpMyAdmin SQL Dump
-- versión 5.2.1
-- https://www.phpmyadmin.net/

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

CREATE TABLE direccion_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    alias VARCHAR(50),              -- Ej: "Casa", "Trabajo"
    calle VARCHAR(100) NOT NULL,
    numero VARCHAR(10),
    ciudad VARCHAR(100),
    departamento VARCHAR(100),
    codigo_postal VARCHAR(10),
    referencia VARCHAR(255),        -- Ej: "Frente a la plaza" o "Apartamento 302"
    activo BOOLEAN DEFAULT 1,    -- Para marcar dirección actual o habilitada
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
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
    fecha_vencimiento DATE NULL,
    unidad ENUM('kg','g','l','ml','otro') NOT NULL,
    proveedor VARCHAR(255),
    stock_actual FLOAT NOT NULL DEFAULT 0,
    stock_minimo FLOAT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ==========================================
-- Categorías y Productos
-- ==========================================
CREATE TABLE `categoria_productos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO `categoria_productos` (`nombre`) VALUES
('Carne'),
('Vegetariana'),
('Vegana'),
('Acompañamiento'),
('Bebida'),
('Postre'),
('Combo');

CREATE TABLE `producto` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_categoria` INT NOT NULL,
  `nombre` VARCHAR(255) NOT NULL,
  `precio` DECIMAL(10,2) NOT NULL,
  `descripcion` VARCHAR(255),
  `tiempoPreparacion` VARCHAR(255) NOT NULL,
  `calorias` VARCHAR(255),
  `promocion` VARCHAR(255) NOT NULL,
  `destacado` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_productos`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `producto_ingrediente` (
    `id_producto` INT NOT NULL,
    `id_ingrediente` INT NOT NULL,
    `cantidad` FLOAT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id_producto`, `id_ingrediente`),
    CONSTRAINT `fk_producto_ingrediente_producto` FOREIGN KEY (`id_producto`) REFERENCES `producto`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_producto_ingrediente_ingrediente` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingrediente`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ==========================================
-- Productos página
-- ==========================================
-- Tabla principal de la factura
CREATE TABLE factura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    codigo VARCHAR(20) UNIQUE,
    id_direccion INT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    FOREIGN KEY (id_cliente) REFERENCES usuario(id)
);

-- Detalle de cada producto en la factura
CREATE TABLE detalle_factura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_factura INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_factura) REFERENCES factura(id) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES producto(id)
);

-- ==========================================
-- Mesas, reservas, pedidos y puntos
-- ==========================================

CREATE TABLE mesa (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `numero` INT NOT NULL UNIQUE,                -- número físico de la mesa en el restaurante
  `capacidad` INT NOT NULL,                    -- cantidad máxima de personas
  `estado` ENUM('disponible','reservada','ocupada','inactiva') DEFAULT 'disponible',
  `descripcion` VARCHAR(255) DEFAULT NULL,     -- detalles extra (ej: "cerca de la barra")
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `reservas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_usuario` INT NOT NULL,
  `id_mesa` INT NOT NULL,
  `fechaReserva` DATETIME NOT NULL,
  `fechaActual` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `numeroPersonas` INT NOT NULL,
  `estado` VARCHAR(50) DEFAULT 'pendiente',
  `codigoReserva` VARCHAR(20) UNIQUE,
  `nombreCliente` VARCHAR(255) NOT NULL,
  `telefonoCliente` VARCHAR(50) NOT NULL,
  `emailCliente` VARCHAR(255) NOT NULL,
  `notas` TEXT DEFAULT NULL,
  CONSTRAINT `fk_reserva_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reserva_mesa` FOREIGN KEY (`id_mesa`) REFERENCES `mesa`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `id_mesa` INT NOT NULL,
  `fecha` DATETIME DEFAULT current_timestamp(),
  `cantidad` INT DEFAULT 1,
  CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_usuario`),
  CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id`),
  CONSTRAINT `pedido_ibfk_3` FOREIGN KEY (`id_mesa`) REFERENCES `mesa` (`id`)
);

CREATE TABLE `puntos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_cliente` INT NOT NULL,
  `puntos_acumulados` INT NOT NULL,
  `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  CONSTRAINT `puntos_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_usuario`) ON DELETE CASCADE
);

-- Usuarios de prueba 
INSERT INTO usuario (nombreCompleto, mail, contraseña, telefono, id_rol, fechaNacimiento, fechaRegistro) 
VALUES -- Passwords Admin: admin123, Cliente: cliente123, Mozo: mozo123 
('Admin', 'admin@foryfactory.com', '$2y$10$4szsM5D7XvBEufIKWjUsUO1qnQ2PP/GkzMuULCfhHweDHTIkiwlRa', 123456789, 2,NULL, '1990-01-01'), 
('Cliente', 'cliente@foryfactory.com', '$2y$10$dF9ior/YFTNQUnDJ3Z.OPuYJaLOFN6hH4PjZCZj2s2HKYyN8BhhR2', 987654321, 1,NULL, '2000-05-15'), 
('Mozo', 'mozo@foryfactory.com', '$2y$10$TFRYPLrBqkgpuhdpyTUMlODgGa600iTPkCzmga0RGf5kmH3/pC8p2', 456789123, 3,NULL, '1995-03-20'), 
('asdd', 'asd@gmail.com', '$2y$10$RLqjZy1fZ/3/m.tPx.t6pefrAxw6vri5ykPQxKQS2nLHVwZ5ea/5u', 99, 3, NULL, '2025-08-11 16:47:21'), 
('asd', 'asdd@gmail.com', '$2y$10$hKqDSi/H.FXzT.wugRkxAOh0oUU/ieBuR/L32V5ziQnmCU46Cfdwm', 123, 4, NULL, '2025-08-11 16:47:21'), 
('asd', 'asddd@gmail.com', '$2y$10$78TWxYid7MeKBN6c/Y311ulq/L8pkXNYA9rqPA1qaO2DAuIoslp2e', 1233, 5, NULL, '2025-08-11 16:47:21'), 
('asd', 'ddd@gmail.com', '$2y$10$80131JdAlqEASIsB1dHoQeA3Ggmpnpg6tQ5efeDKKzpBbhjJWjmE6', 12333, 1, NULL, '2025-08-11 16:47:21'), 
('asd', 'dddd@gmail.com', '$2y$10$NV47C8pZGuFsKPCMu3uxn.BWubEgJhASc9AFQff378wWGQlV4xghm', 12333, 1, NULL, '2025-08-11 16:47:21'), 
('ddd', 'dddddd@gmail.com', '$2y$10$t0cxy.9YTCrJA7jzA021lu0OV5kFI4T6l3A1XPfCa4S5FuRCrUIKy', 0, 1, NULL, '2025-08-11 16:47:21'), 
('emiip1891', 'ssss@gmail.com', '$2y$10$zaUCDoUANeAx9YkdNtCywusQ1drOtt03bf.EqCR2x05KRBd6eaCpC', 133333, 1, NULL, '2025-08-11 16:47:21'), 
('asd', 'gg@gmail.com', '$2y$10$t1ZkSmBzB7rUb0qGnauR8ucHotVxtQFBBHF6IoKFuXjAJeHIvpdlS', 3333, 1, NULL, '2025-08-11 16:47:21'), 
('pepe', 'pepe@gmail.com', '$2y$10$frS0JwjN0LszR5UyVRPUMO0mILKNC1Tocg/1TFxIprdwiWFmRz7ri', 123, 1, NULL, '2025-08-11 16:47:21'), 
('d', 'd@gmail.com', '$2y$10$xpB2EDKglq9rLYJAuf6kMOiLcdQMer1uvmG/9dmneE8VHnwQisOr6', 123, 1, NULL, '2025-08-11 16:47:21'), 
('dd', 'dd@gmail.com', '$2y$10$7y6YU0mkdXDyu.rK2.1PLuZYYz3zWnxw55HJOjCIzZeoTwKLjFcuC', 9999, 1, NULL, '2025-08-11 16:47:21'), 
('dd', 'q@gmail.com', '$2y$10$JpeZElZ3Z.wQ2bp6fFyXoueQxMLz7obj2rbMixKkYbXkOE4YJirnm', 213, 1, NULL, '2025-08-11 16:47:21'), 
('dd', 'qd@gmail.com', '$2y$10$8c51Wr3s8r8rkEfeqkVwc.ULQUle8LO4Cp53R.PZ5BjGjRSeKgDtu', 213, 1, NULL, '2025-08-11 16:47:21'), 
('dd', 'qq@gmail.com', '$2y$10$gWiyzRe23sM45c1Cg8KXz.lnQnbAzuoXpX9JtMwLwQh4c8hNutYJi', 123, 1, NULL, '2025-08-11 16:47:21'), 
('sad', 'hola@gmail.com', '$2y$10$KxzS3HAgptNSMl1VaJUn.u/yvg4H0JMsRt8idDPjw8hdpMZBCeCyW', 123, 1, NULL, '2025-08-11 16:47:21'), 
('asdd', 'test@gmail.com', '$2y$10$WdSgRLyW2HQ6PSzoACM0LO98ZDYR6NIJChhi9RklM5dGyRkwYBozO', 123, 2, '1998-11-26', '2025-08-11 16:47:21'), 
('prueba', 'prueba@gmail.com', '$2y$10$Svv6gMQPxrcmuwpohS94D.vyGFa3es8ZLdsZvhnQ52YlRbO7.EvaS', 123456, 1, NULL, '2025-08-11 16:47:21'), 
('asd', 'dd213@gmail.com', '$2y$10$OjmipKTebiIggg0cE7RKuOXWTOewevhgZkOluXJki87.1IQdBQyFS', 44444, 1, NULL, '2025-08-11 16:47:21'), 
('dd1', 'dd1@gmail.com', '$2y$10$e82ORoatXCfNR10GsKZYz.YU3mF4RbDba6moRXh9hnEaEqr4Fi0U.', 123, 1, NULL, '2025-08-11 16:47:21'), 
('1234', '1234@gmail.com', '$2y$10$9JqW/wA0N37f5pnFiKFd2OqkD5..kdnh4xkHNjOW.YTe4HORezis.', 1234, 1, NULL, '2025-08-11 16:47:21'), 
('444', '444@gmail.com', '$2y$10$Tj.77TAQzRE6tOmRnN9n/OvQtWoG3752Q.rA7FQPB1V6Cba2f.Ol.', 444, 1, NULL, '2025-08-11 16:47:21'), 
('123', '123@gmail.com', '$2y$10$j.TMJmefvtje9QXlXc7aKuObNC5qK3PnaC.mzBrsxuvRdnsgQMzI2', 123, 1, NULL, '2025-08-11 16:47:21'), 
('321', '321@gmail.com', '$2y$10$JadSbR3KxoLtbFneQ3NAVOZpueGwH/97TI20r5Je64bsKOVC7bo8O', 321, 1, NULL, '2025-08-11 16:47:21'), 
('111', '111@gmail.com', '$2y$10$UEhYCtZbeT9tl25XCb393.XDwz9shLctn9EJ.RKEgwkHnSY/OudU6', 111, 1, NULL, '2025-08-11 16:47:21'), 
('222', '222@gmail.com', '$2y$10$cFsUr927ZQqY9Is3kFF2OuHRhLKvmRqSpdjfNGlik88yEJsoo4MBO', 222, 1, NULL, '2025-08-11 16:47:21'), 
('333', '333@gmail.com', '$2y$10$V.pu4o98CM01o8wm00wM1e56unEY225CZGsR0l7azxucuue5O3VL2', 333, 1, NULL, '2025-08-11 16:47:21'), 
('444', '4445@gmail.com', '$2y$10$KUNeLdI3WvM2dhmORHBS0.ZiemlrR3nVSXaSCryem6sopf.uFrQZW', 4445, 1, NULL, '2025-08-11 16:47:21'), 
('asd', 'as33@gmai.com', '$2y$10$NkYnlcCQ3ZnTkOqVR0XRhO7B2EveA.CWwHkaV4juWnx5O.8YmdLgS', 3444, 1, NULL, '2025-08-11 16:47:21'), 
('naza', 'naza@gmail.com', '$2y$10$w92PF583kj/rf3fnH0Pi/uGai0cqMoh47PqOagh2XNhjKeQ8rMV2S', 123, 1, NULL, '2025-08-11 16:47:21'), 
('final', 'final@gmail.com', '$2y$10$oQDt7pscUo6rQ/fZlHf0l..vjZhpz0jR8IL.zu8ouN3xTZFrMlekW', 1234, 1, NULL, '2025-08-11 16:47:21'), 
('fefe', 'fefe@gmail.com', '$2y$10$tugBR.lXopaImTdioKPWbOALu.Ov24FjwaWgWnHr.9tUmOzke2psa', 1234, 1, NULL, '2025-08-11 16:47:21'), 
('eee', 'eee@gmail.com', '$2y$10$WkLPmT9sRUEof0HQnrWfI.NNOQ9pazV3WqYOJ3.nsahwGvo3dkLWu', 123, 1, NULL, '2025-08-11 16:47:21'), 
('naza', 'naza2@gmail.com', '$2y$10$fo.OKSOzfV1iAEnRTcwYEO2glce56u4CijI8vxDEBMABtS9po0NgC', 123, 1, NULL, '2025-08-11 16:47:21'), 
('naza serra', 'naza.serra@gmail.com', '$2y$10$eQ6NoE34y5jj9SZ.SQcVIuYWnjGE1N4c5A8y501Uc0aAiDVJZPqTO', 1234, 1, NULL, '2025-08-11 16:47:21'), 
('ten', 'ten@gmail.com', '$2y$10$dHONg/OJJEnj1LrfDD/uJudY9p8UHd.nmKwLmVGuymnbWA/Te.4Qm', 1234, 1, NULL, '2025-08-11 16:47:21'), 
('gordo', 'gordo@gmail.com', '$2y$10$JwNYMTMFwjndM4Km7z3Fl.cdFDb9/GWDdqFz7se4rZJGwuH4EwrzG', 123, 1, NULL, '2025-08-11 16:47:21'), 
('negro', 'negro@gmail.com', '$2y$10$z8XnuRMwo7.44gE0Wu3SCe5ysn1/yg/08ds3jSPVZ1QbkBRvuRRja', 123, 1, NULL, '2025-08-11 16:47:21'), 
('tmp4', 'temp4@gmail.com', '$2y$10$oySHc.54ylLQxDpbKmYVLujz0SroWbup2GNt2yRJUwsOxzu.eaFQ.', 124, 3, NULL, '2025-09-05 21:02:54'), 
('temp4', 'tmp@gmail.com', '$2y$10$zgVO93Ym5rbr5inTDF2nFuqf6b4K9uCk1uJ5xJAb/JdqqYSwE646S', 123, 1, NULL, '2025-09-05 21:07:53'), 
('tmp5', 'tmp6@gmail.com', '$2y$10$SPG5ISgNVysbD.9crdFH9Oq1N4DQ3d0wu6oyKj.e0ScGqOiUGpJ9.', 123, 2, NULL, '2025-09-05 21:08:22'), 
('asdd', 'tmp8@gmai.com', '$2y$10$.scN9sQ9LHUrwnNhTa2y0.IanDvi7xucakb3SuZYiql0LmPLgcaLS', 123, 1, NULL, '2025-09-05 21:17:53'), 
('tasd', 'tmp8@gmail.com', '$2y$10$ib3Z1E8e6gkxPNRZWKjqfuZhYQ89BTiueaZUb8bmwlNX2.6WSwegq', 123, 1, NULL, '2025-09-05 21:18:19'), 
('tmp9', 'tmp9@gmail.com', '$2y$10$9s.2NTwUJV2IgfDaR/wD9.6fr5vV2VnT3KBzaTnkgDGQ10ZtiSlfW', 99, 4, NULL, '2025-09-05 21:22:01'), 
('pepinho', 'tmp88@gmail.com', '$2y$10$g9Dh6JUfa6nfcqZoe7Lr8.wycUomzaXmkN.wHHpNfVTr9BbiQbcyi', 123, 6, NULL, '2025-09-08 20:55:27'), 
('123', 'asoldklas@gmail.com', '$2y$10$BHyK83RDQGqMAYsXJULGGumgWS4XLqEjCrp9M5QHOAHK7vjKqtcEW', 123, 2, NULL, '2025-09-08 21:25:23'), 
('tmp99', 'tmp99@gmail.com', '$2y$10$u6gSRVQr580w2OC1tDkjDexN6Pz6t8CPik6zyQs76H7e98rNKepIC', 123, 1, NULL, '2025-09-10 02:33:43');


-- Ingredientes de prueba adicionales 
INSERT INTO ingrediente (nombre, descripcion, tipo, fecha_vencimiento, unidad, proveedor, stock_actual, stock_minimo) 
VALUES 
('Papa', 'Papa blanca 1Kg', 'Verdura', NULL, 'kg', 'Verduleria El Pinar', 60, 15), 
('Cebolla', 'Cebolla morada 500g', 'Verdura', NULL, 'kg', 'Verduleria El Pinar', 30, 10), 
('Tomate', 'Tomate perita fresco', 'Verdura', NULL, 'kg', 'Verduleria El Sol', 25, 10), 
('Pollo', 'Pechuga de pollo sin hueso', 'Carne', '2025-10-10', 'kg', 'Carnicería Don José', 50, 20), 
('Carne vacuna', 'Carne molida especial', 'Carne', '2025-10-05', 'kg', 'Carnicería Don José', 40, 15), 
('Arroz', 'Arroz largo fino 1Kg', 'Otro', '2026-01-01', 'kg', 'Distribuidora Granos SA', 100, 30), 
('Aceite', 'Aceite de girasol 1L', 'Otro', '2026-03-15', 'l', 'Aceites del Sur', 80, 25), 
('Sal', 'Sal fina de mesa', 'Condimento', NULL, 'kg', 'Distribuidora CondiPlus', 50, 10), 
('Pimienta', 'Pimienta negra molida', 'Condimento', NULL, 'g', 'Distribuidora CondiPlus', 300, 100), 
('Leche', 'Leche entera larga vida', 'Lácteo', '2025-12-15', 'l', 'Lácteos Santa Clara', 60, 20), 
('Queso', 'Queso cremoso x500g', 'Lácteo', '2025-10-20', 'g', 'Lácteos Santa Clara', 25, 10);

INSERT INTO producto (id_categoria, nombre, precio, descripcion, tiempoPreparacion, calorias, promocion, destacado) 
VALUES
(1, 'HOLY', 1200, 'Doble smash burger, cheddar y cebolla morada, con salsa barbacoa y kétchup, acompañado en pan artesanal.', 15, 800, '10%', 1),
(1, 'ORIGINALS', 1100, 'Doble smash burger, cheddar y cebolla morada.', 12, 750, 'sinDescuento', 0),
(1, 'DELI', 1150, 'Doble smash burger, cheddar y cebolla morada.', 13, 770, '2x1', 0),
(2, 'ORIGINALS BEYOND', 1300, 'Beyond burger, muzzarella, pepinillos, huevo, morrón, cebolla, lechuga y tomate.', 14, 680, '15%', 0),
(2, 'CHEESE BEYOND', 1350, 'Beyond burger, doble cheddar, doble muzzarella, huevo y tomate.', 14, 700, 'sinDescuento', 0),
(3, 'HOLY VEGAN', 1400, 'Beyond burger, cheddar vegano, pepinillos, champiñones, cebolla, lechuga y tomate.', 15, 650, '20%', 0),
(3, 'EPIC HOT', 1450, 'Bife de seitán, cheddar vegano, nueces, pepinillos, morrón, cebolla, lechuga y tomate.', 16, 670, 'sinDescuento', 0),
(4, 'Papas', 400, 'Crujientes papas fritas.', 10, 300, '2x1', 0),
(4, 'Papas + Cheddar', 500, 'Papas fritas con cheddar fundido.', 12, 400, '10%', 0),
(5, 'Coca Cola 1L', 250, 'Refresco de cola.', 0, 150, 'sinDescuento', 0),
(5, 'Sprite 1L', 250, 'Refresco de limón.', 0, 150, 'sinDescuento', 0),
(6, 'Helado', 350, 'Helado artesanal.', 0, 200, '15%', 0),
(6, 'Brownie', 400, 'Brownie con chocolate.', 0, 450, '2x1', 0),
(7, 'Combo 1', 2000, 'Hamburguesa + Papas + Bebida.', 15, 1200, '25%', 1),
(7, 'Combo 2', 2500, 'Doble hamburguesa + Papas + Bebida.', 20, 1500, 'sinDescuento', 1);

INSERT INTO producto_ingrediente (id_producto, id_ingrediente, cantidad) VALUES
-- HOLY: doble carne vacuna, queso, tomate, cebolla, sal, pimienta
(1, 5, 0.3), (1, 11, 0.1), (1, 3, 0.05), (1, 2, 0.05), (1, 8, 0.01), (1, 9, 0.005),
-- ORIGINALS: carne vacuna, tomate, cebolla, sal
(2, 5, 0.25), (2, 11, 0.1), (2, 2, 0.05), (2, 8, 0.01),
-- DELI: carne vacuna, queso, cebolla, tomate
(3, 5, 0.3), (3, 11, 0.1), (3, 2, 0.05), (3, 8, 0.01),
-- ORIGINALS BEYOND: arroz, tomate, pimienta, aceite, sal
(4, 6, 0.2), (4, 3, 0.1), (4, 11, 0.1), (4, 9, 0.005), (4, 7, 0.01),
-- CHEESE BEYOND: arroz, queso, leche, aceite
(5, 6, 0.2), (5, 11, 0.15), (5, 10, 0.1), (5, 7, 0.01),
-- HOLY VEGAN: arroz, tomate, aceite, sal, pimienta
(6, 6, 0.25), (6, 11, 0.1), (6, 7, 0.02), (6, 8, 0.01), (6, 9, 0.005),
-- EPIC HOT: arroz, cebolla, pimienta, aceite, sal
(7, 6, 0.25), (7, 2, 0.05), (7, 9, 0.005), (7, 7, 0.01), (7, 8, 0.01),
-- Papas: papa + sal
(8, 1, 0.3), (8, 8, 0.01),
-- Papas + Cheddar: papa + queso + sal
(9, 1, 0.3), (9, 11, 0.05), (9, 8, 0.01),
-- Coca Cola 1L: (sin ingredientes compuestos, ejemplo simbólico)
(10, 7, 0.01),
-- Sprite 1L:
(11, 7, 0.01),
-- Helado: leche, azúcar (sal en lugar de azúcar por simplificación)
(12, 10, 0.25), (12, 8, 0.01),
-- Brownie: leche, sal, aceite
(13, 10, 0.2), (13, 8, 0.01), (13, 7, 0.02),
-- Combo 1: HOLY + Papas + Coca Cola
(14, 5, 0.3), (14, 11, 0.1), (14, 3, 0.05), (14, 2, 0.05), (14, 1, 0.2), (14, 7, 0.01),
-- Combo 2: doble burger + Papas + Sprite
(15, 5, 0.4), (15, 11, 0.1), (15, 1, 0.2), (15, 7, 0.01);

INSERT INTO mesa (numero, capacidad, estado, descripcion) VALUES
(1, 2, 'disponible', 'Mesa pequeña junto a la ventana'),
(2, 4, 'disponible', 'Mesa familiar'),
(3, 6, 'disponible', 'Mesa grande'),
(4, 4, 'disponible', 'Mesa junto al pasillo'),
(5, 8, 'disponible', 'Mesa para grupos grandes'),
(6, 2, 'disponible', 'Mesa íntima en esquina'),
(7, 2, 'disponible', 'Mesa cerca de la barra'),
(8, 4, 'disponible', 'Mesa central'),
(9, 4, 'disponible', 'Mesa con vista al jardín'),
(10, 6, 'disponible', 'Mesa grande cerca de la cocina'),
(11, 6, 'disponible', 'Mesa junto a la ventana panorámica'),
(12, 8, 'disponible', 'Mesa para eventos o grupos grandes'),
(13, 2, 'disponible', 'Mesa pequeña detrás de la barra'),
(14, 4, 'disponible', 'Mesa familiar al lado del pasillo'),
(15, 6, 'disponible', 'Mesa grande en área VIP');

INSERT INTO direccion_usuario (id_usuario, alias, calle, numero, ciudad, departamento, codigo_postal, referencia, activo
) VALUES
(2, '', 'Av. pepe Esq Rio Azul', 12, 'Canelones', 'Apartamento 2', 11300, 'Casa de rejas rojas', 0),
(2, 'Casa', 'av papaeya', 1337, 'Montevideo', '', 11300, 'Casa de pared amarilla en la esquina', 0),
(2, 'Trabajo', 'Av Giannatassio Esq Jose Rondou', 1337, 'Montevideo', 'Apartamento 2', 11300, 'Edificio ', 1),
(2, 'Amor', 'Av centenario', 1337, 'Montevideo', '', 11300, 'Casa roja', 0),
(2, '', 'test', 1234, 'test', 'test', 11300, 'test', 0);

COMMIT;

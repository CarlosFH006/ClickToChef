CREATE DATABASE IF NOT EXISTS clicktochef;
USE clicktochef;

-- 1. ESTRUCTURA DE TABLAS

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    categoria_id INT,
    imagen_url VARCHAR(255),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE TABLE mesas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL UNIQUE,
    capacidad INT DEFAULT 4,
    estado ENUM('libre', 'ocupada', 'reservada') DEFAULT 'libre'
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    rol ENUM('camarero', 'cocinero', 'admin') NOT NULL
);

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mesa_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('abierta', 'cerrada', 'cancelada') DEFAULT 'abierta',
    FOREIGN KEY (mesa_id) REFERENCES mesas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE detalles_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    notas_especiales VARCHAR(255),
    estado ENUM('pendiente', 'en preparacion', 'listo', 'servido') DEFAULT 'pendiente',
    hora_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE ingredientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    stock_actual DECIMAL(10, 2) NOT NULL,
    stock_reservado DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unidad_medida VARCHAR(20) DEFAULT 'unidades',
    odoo_product_id INT
);

CREATE TABLE recetas (
    producto_id INT NOT NULL,
    ingrediente_id INT NOT NULL,
    cantidad_necesaria DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (producto_id, ingrediente_id),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id)
);

CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL UNIQUE,
    total_importe DECIMAL(10, 2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    referencia_factura_odoo VARCHAR(100),
    metodo_pago ENUM('efectivo', 'tarjeta') DEFAULT 'tarjeta',
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

-- 2. INSERCIÓN DE DATOS

-- Categorías
INSERT INTO categorias (nombre) VALUES ('Entrantes'), ('Hamburguesas'), ('Bebidas'), ('Postres'), ('Vinos');

-- Productos
INSERT INTO productos (id, nombre, descripcion, precio, categoria_id, imagen_url) VALUES 
(1, 'Nachos Click', 'Nachos con queso y guacamole', 8.50, 1, 'nachos.png'),
(2, 'Alitas BBQ', '6 alitas con salsa barbacoa', 7.00, 1, 'alitas.png'),
(3, 'Burger Tech', 'Ternera 200g y cheddar', 12.50, 2, 'burger_tech.png'),
(4, 'Veggie Byte', 'Hamburguesa de garbanzos', 11.00, 2, 'burger_veggie.png'),
(5, 'Coca Cola 33cl', 'Refresco original', 2.50, 3, 'cola.png'),
(6, 'Cerveza Artesana', 'IPA local 500ml', 4.50, 3, 'beer.png'),
(7, 'Tarta de Queso', 'Casera con arándanos', 5.50, 4, 'cheesecake.png'),
(8, 'Vino Tinto Rioja', 'Copa crianza', 3.80, 5, 'vino.png');

-- Mesas
INSERT INTO mesas (numero, capacidad, estado) VALUES (1, 2, 'ocupada'), (2, 4, 'libre'), (3, 4, 'libre'), (4, 6, 'ocupada'), (5, 2, 'libre');

-- Usuarios
INSERT INTO usuarios (username, password_hash, nombre_completo, rol) VALUES 
('admin', 'admin123', 'Super Administrador', 'admin'),
('pepe_sala', 'camarero1', 'Pepe García', 'camarero'),
('ana_sala', 'camarero2', 'Ana López', 'camarero'),
('carlos_chef', 'cocina1', 'Carlos Martínez', 'cocinero');

-- Ingredientes (Inventario Físico)
INSERT INTO ingredientes (id, nombre, stock_actual, unidad_medida, odoo_product_id) VALUES 
(1, 'Carne Ternera', 10.50, 'kg', 101),
(2, 'Queso Cheddar', 5.00, 'kg', 102),
(3, 'Pan Burger', 50.00, 'unidades', 104),
(4, 'Patatas', 30.00, 'kg', 105),
(5, 'Lata Coca Cola 33cl', 100.00, 'unidades', 201),
(6, 'Barril Cerveza IPA', 50.00, 'litros', 202),
(7, 'Botella Vino Rioja', 20.00, 'unidades', 203),
(8, 'Nachos Bolsa', 20.00, 'unidades', 301),
(9, 'Alitas Congeladas', 100.00, 'unidades', 302),
(10, 'Tarta de Queso Entera', 5.00, 'unidades', 303),
(11, 'Hamburguesa Vegana', 15.00, 'unidades', 304);

-- Recetas (Lógica de descuento de stock)
INSERT INTO recetas (producto_id, ingrediente_id, cantidad_necesaria) VALUES 
(1, 8, 1.00),   -- Nachos -> 1 Bolsa
(2, 9, 6.00),   -- Alitas -> 6 unidades
(3, 1, 0.200),  -- Burger Tech -> 200g Carne
(3, 2, 0.050),  -- Burger Tech -> 50g Queso
(3, 3, 1.00),   -- Burger Tech -> 1 Pan
(4, 11, 1.00),  -- Veggie Byte -> 1 Patty Vegana
(4, 3, 1.00),   -- Veggie Byte -> 1 Pan
(5, 5, 1.00),   -- Coca Cola -> 1 Lata
(6, 6, 0.50),   -- Cerveza -> 0.5 Litros
(7, 10, 0.125), -- Tarta -> 1 ración (1/8 de tarta)
(8, 7, 0.15);   -- Vino -> 0.15 Litros (una copa)

-- Pedidos de prueba
INSERT INTO pedidos (id, mesa_id, usuario_id, estado) VALUES (1, 1, 2, 'abierta');
INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, estado, notas_especiales) VALUES 
(1, 3, 2, 'en preparacion', 'Carne muy hecha'),
(1, 5, 2, 'listo', 'Con hielo');

INSERT INTO pedidos (id, mesa_id, usuario_id, estado) VALUES (2, 4, 3, 'abierta');
INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, estado) VALUES 
(2, 1, 1, 'pendiente'),
(2, 6, 3, 'pendiente');

-- Ticket de prueba
INSERT INTO tickets (pedido_id, total_importe, referencia_factura_odoo, metodo_pago) VALUES 
(1, 30.00, 'INV-2026-001', 'tarjeta');
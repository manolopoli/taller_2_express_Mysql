CREATE DATABASE IF NOT EXISTS tienda_perecederos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tienda_perecederos;

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria ENUM('Lácteos', 'Cárnicos', 'Frutas y Verduras', 'Panadería') NOT NULL,
    lote VARCHAR(50) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    fecha_vencimiento DATE NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de prueba iniciales (Ajustar fechas según el mes de la clase para ver el semáforo en acción)
INSERT INTO productos (nombre, categoria, lote, precio, stock, fecha_vencimiento) VALUES
('Leche Entera Pasteurizada 1L', 'Lácteos', 'LT-2026-01', 4200.00, 35, DATE_ADD(CURDATE(), INTERVAL 12 DAY)),
('Queso Campesino Fresco 500g', 'Lácteos', 'LT-2026-02', 11500.00, 15, DATE_ADD(CURDATE(), INTERVAL 2 DAY)),
('Pechuga de Pollo Bandeja 1kg', 'Cárnicos', 'CR-2026-88', 18900.00, 20, DATE_ADD(CURDATE(), INTERVAL 4 DAY)),
('Fresas Seleccionadas 500g', 'Frutas y Verduras', 'FV-2026-10', 6800.00, 10, DATE_ADD(CURDATE(), INTERVAL 1 DAY)),
('Pan Artesanal de Masa Madre', 'Panadería', 'PN-2026-05', 8500.00, 8, DATE_SUB(CURDATE(), INTERVAL 1 DAY));

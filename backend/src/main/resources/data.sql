INSERT INTO usuarios (nombre, apellido, email, telefono) VALUES
('Juan', 'Pérez', 'juan.perez@example.com', '+34 600 123 456'),
('María', 'Gómez', 'maria.gomez@example.com', '+34 611 234 567'),
('Carlos', 'Ruiz', 'carlos.ruiz@example.com', '+34 622 345 678'),
('Ana', 'Sánchez', 'ana.sanchez@example.com', '+34 633 456 789'),
('Felipe', 'Cubillos', 'felipecubillos13@gmail.com', '+56 9 7890 7299'),
('Luis', 'Fernández', 'luis.fernandez@example.com', '+34 644 567 890');

-- Updated INSERT for reservas
-- Updated INSERT for reservas (added tiporeserva)
INSERT INTO reservas (
    inicio_reserva,
    fin_reserva,
    fecha,
    emailarrendatario,
    duracion,
    numero_personas,
    cumpleanios,
    cantidadcumple,
    precio_inicial,
    descuento_grupo,
    descuento_frecuente,
    descuento_cumple,
    iva,
    total_con_iva,
    tiporeserva -- Added column
) VALUES
      ('2025-05-01 11:00:00', '2025-05-01 12:00:00', '2025-05-01', 'juan.perez@example.com', 2, 4, '1990-05-15', 1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1),
      ('2025-05-02 15:00:00', '2023-05-02 16:00:00', '2025-05-02', 'maria.gomez@example.com', 2, 2, '1985-08-22', 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1),
      ('2025-05-03 16:00:00', '2025-05-03 17:00:00', '2025-05-03', 'carlos.ruiz@example.com', 2, 3, NULL, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2),
      ('2025-05-04 15:30:00', '2025-05-04 16:30:00', '2025-05-04', 'ana.sanchez@example.com', 2, 5, '2000-02-10', 1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3),
      ('2025-05-05 16:00:00', '2025-05-05 17:00:00', '2025-05-05', 'luis.fernandez@example.com', 2, 2, '1999-12-05', 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1),
      ('2023-10-10 15:00:00', '2023-10-10 16:00:00', '2023-10-10', 'juan.perez@example.com', 2, 4, '1990-05-15', 1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1),
      ('2023-10-10 15:00:00', '2023-10-10 16:00:00', '2023-10-10', 'maria.gomez@example.com', 2, 2, '1985-08-22', 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1),
      ('2023-10-11 17:00:00', '2023-10-11 18:00:00', '2023-10-11', 'carlos.ruiz@example.com', 2, 3, NULL, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2),
      ('2023-10-11 20:30:00', '2023-10-11 21:30:00', '2023-10-11', 'ana.sanchez@example.com', 2, 5, '2000-02-10', 1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3),
      ('2023-10-10 16:00:00', '2023-10-10 17:00:00', '2023-10-10', 'luis.fernandez@example.com', 2, 2, '1999-12-05', 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1);
-- Insert Karts (K001-K015)
INSERT INTO karts (model, codificacion, estado) VALUES
('Model X', 'K001', 'PERFECTO'),
('Model X', 'K002', 'PERFECTO'),
('Model Y', 'K003', 'EN_MANTENIMIENTO'),
('Model Y', 'K004', 'FUERA_DE_SERVICIO'),
('Model Z', 'K005', 'PERFECTO'),
('Model Z', 'K006', 'PERFECTO'),
('Model A', 'K007', 'EN_MANTENIMIENTO'),
('Model B', 'K008', 'PERFECTO'),
('Model C', 'K009', 'FUERA_DE_SERVICIO'),
('Model A', 'K010', 'PERFECTO'),
('Model B', 'K011', 'PERFECTO'),
('Model C', 'K012', 'PERFECTO'),
('Model X', 'K013', 'PERFECTO'),
('Model Y', 'K014', 'PERFECTO'),
('Model Z', 'K015', 'PERFECTO');

-- Tarifas para días especiales
INSERT INTO tarifas_dia_especial (fecha, porcentaje_aumento, descripcion) VALUES
('2025-07-16', 15.0, 'Día de la virgen del carmen - 15% de aumento'),
('2025-12-25', 25.0, 'Navidad - 25% de aumento'),
('2026-01-01', 30.0, 'Año Nuevo - 30% de aumento');

-- Descuentos por persona
INSERT INTO descuentos_persona (min_personas, max_personas, porcentaje_descuento) VALUES
(3, 5, 10.0),
(6, 10, 20.0),
(11, 15, 30.0);

INSERT INTO comprobantes (reserva_id, codigo, email, nombre_usuario, tarifa_base, descuento_grupo, descuento_frecuente, descuento_cumple, precio_sin_iva, iva, total, metodo_pago, estado_pago, fecha_emision) VALUES
(1, 'KRM-ABC12345', 'juan.perez@example.com', 'Juan Pérez', 100.0, 0.0, 0.0, 0.0, 100.0, 19.0, 119.0, 'TARJETA', 'PAGADO', '2025-05-01 12:00:00'),
(2, 'KRM-DEF67890', 'maria.gomez@example.com', 'María Gómez', 100.0, 0.0, 0.0, 0.0, 100.0, 19.0, 119.0, 'TARJETA', 'PAGADO', '2025-05-02 16:00:00'),
(3, 'KRM-GHI11223', 'carlos.ruiz@example.com', 'Carlos Ruiz', 150.0, 15.0, 0.0, 0.0, 135.0, 25.65, 160.65, 'EFECTIVO', 'PAGADO', '2025-05-03 17:00:00'),
(4, 'KRM-JKL44556', 'ana.sanchez@example.com', 'Ana Sánchez', 200.0, 20.0, 0.0, 0.0, 180.0, 34.2, 214.2, 'TARJETA', 'PAGADO', '2025-05-04 16:30:00'),
(5, 'KRM-MNO77889', 'luis.fernandez@example.com', 'Luis Fernández', 100.0, 0.0, 10.0, 0.0, 90.0, 17.1, 107.1, 'TARJETA', 'PAGADO', '2025-05-05 17:00:00');
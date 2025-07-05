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
('Model C', 'K012', 'EN_MANTENIMIENTO'),
('Model X', 'K013', 'PERFECTO'),
('Model Y', 'K014', 'FUERA_DE_SERVICIO'),
('Model Z', 'K015', 'PERFECTO');

-- Update this insert statement to include all required fields:
INSERT INTO comprobantes (email, tarifa_base, descuento_cumple, descuento_frecuente, descuento_grupo, iva, precio_sin_iva, total) VALUES
  ('juan.perez@example.com', 100, 0.0, 0.0, 0.0, 19.0, 100.0, 119.0),
  ('maria.gomez@example.com', 100, 0.0, 0.0, 0.0, 19.0, 100.0, 119.0),
  ('carlos.ruiz@example.com', 150, 0.0, 0.0, 0.0, 28.5, 150.0, 178.5),
  ('ana.sanchez@example.com', 200, 0.0, 0.0, 0.0, 38.0, 200.0, 238.0),
  ('luis.fernandez@example.com', 100, 0.0, 0.0, 0.0, 19.0, 100.0, 119.0);
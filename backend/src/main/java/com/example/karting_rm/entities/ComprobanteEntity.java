package com.example.karting_rm.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "comprobantes")
@Data
@NoArgsConstructor
@AllArgsConstructor

// Idea de record, clase inmutable que extiende de reserva.
public class ComprobanteEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    // ID de la reserva asociada
    private Long reservaId;

    private String codigo; // Código único del comprobante
    private String email; // Email del usuario
    private String nombreUsuario; // Nombre del usuario

    private float tarifaBase;
    private float descuentoGrupo;
    private float descuentoFrecuente;
    private float descuentoCumple;
    private float precioSinIva;
    private float iva;
    private float total;

    private String metodoPago; // TARJETA, EFECTIVO, etc
    private String estadoPago; // PAGADO, PENDIENTE, etc

    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date fechaEmision;
}



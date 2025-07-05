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
    private String email;
    // ID de la reserva asociada
    private Long reservaId;

    private float tarifaBase;
    private float descuentoGrupo;
    private float descuentoFrecuente;
    private float descuentoCumple;
    private float precioSinIva;
    private float iva;
    private float total;

    private String codigo;
}



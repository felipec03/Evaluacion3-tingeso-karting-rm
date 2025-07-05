package com.example.karting_rm.entities;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Date;

@Entity
@Table(name = "reservas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    private LocalDateTime inicio_reserva;
    private LocalDateTime fin_reserva;
    private LocalDate fecha;
    public int duracion;

    private Date cumpleanios;
    private String emailarrendatario;
    private int numero_personas;

    private int tiporeserva;
    private int cantidadcumple;
    private float precioInicial;
    private float descuentoGrupo;
    private float descuentoFrecuente;
    private float descuentoCumple;
    private float iva;
    private float totalConIva;
}
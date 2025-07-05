package com.example.karting_rm.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "tarifas_dia_especial")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarifasDiaEspecialEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    private LocalDate fecha;
    private double porcentajeAumento;
    private String descripcion;
}

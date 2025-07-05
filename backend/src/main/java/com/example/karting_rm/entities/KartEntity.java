package com.example.karting_rm.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "karts")
@Data

@NoArgsConstructor
@AllArgsConstructor
public class KartEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    private String model;
    private String codificacion;
    @Enumerated(EnumType.STRING)
    private Estado estado;
    public enum Estado{
        PERFECTO,
        EN_MANTENIMIENTO,
        FUERA_DE_SERVICIO
    }
}

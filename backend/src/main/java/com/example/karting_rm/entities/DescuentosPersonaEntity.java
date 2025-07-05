
package com.example.karting_rm.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "descuentos_persona")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DescuentosPersonaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    private int minPersonas;
    private int maxPersonas;
    private double porcentajeDescuento;
}

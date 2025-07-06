package com.example.karting_rm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteFilaDTO {
    private String categoria;
    private Map<String, Double> ingresosPorMes;
    private double totalIngresosCategoria;
}

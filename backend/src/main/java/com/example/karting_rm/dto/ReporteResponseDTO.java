package com.example.karting_rm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteResponseDTO {
    private List<String> mesesDelRango;
    private List<ReporteFilaDTO> filasReporte;
    private Map<String, Double> totalesPorMes;
    private double granTotal;
}

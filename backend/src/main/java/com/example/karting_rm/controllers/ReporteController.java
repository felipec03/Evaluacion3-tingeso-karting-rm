package com.example.karting_rm.controllers;

import com.example.karting_rm.dto.ReporteResponseDTO;
import com.example.karting_rm.services.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.YearMonth;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    @GetMapping("/ingresos-por-tarifa")
    public ResponseEntity<ReporteResponseDTO> getReporteIngresosPorTarifa(
            @RequestParam int anioInicio,
            @RequestParam int mesInicio,
            @RequestParam int anioFin,
            @RequestParam int mesFin) {

        // Basic date validation
        if (!isValidMonth(mesInicio) || !isValidMonth(mesFin) ||
                !isValidYear(anioInicio) || !isValidYear(anioFin) ||
                YearMonth.of(anioInicio, mesInicio).isAfter(YearMonth.of(anioFin, mesFin))) {
            return ResponseEntity.badRequest().build();
        }

        try {
            ReporteResponseDTO reporte = reporteService.generarReporteIngresosPorTarifa(anioInicio, mesInicio, anioFin, mesFin);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/ingresos-por-personas")
    public ResponseEntity<ReporteResponseDTO> getReporteIngresosPorNumeroPersonas(
            @RequestParam int anioInicio,
            @RequestParam int mesInicio,
            @RequestParam int anioFin,
            @RequestParam int mesFin) {

        // Basic date validation
        if (!isValidMonth(mesInicio) || !isValidMonth(mesFin) ||
                !isValidYear(anioInicio) || !isValidYear(anioFin) ||
                YearMonth.of(anioInicio, mesInicio).isAfter(YearMonth.of(anioFin, mesFin))) {
            return ResponseEntity.badRequest().build();
        }

        try {
            ReporteResponseDTO reporte = reporteService.generarReporteIngresosPorNumeroPersonas(anioInicio, mesInicio, anioFin, mesFin);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private boolean isValidMonth(int mes) {
        return mes >= 1 && mes <= 12;
    }

    private boolean isValidYear(int anio) {
        // Adjust as needed, e.g., don't allow very old or future years
        return anio >= 2000 && anio <= LocalDate.now().getYear() + 5;
    }
}
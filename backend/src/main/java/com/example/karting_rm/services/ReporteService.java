package com.example.karting_rm.services;

import com.example.karting_rm.dto.ReporteFilaDTO;
import com.example.karting_rm.dto.ReporteResponseDTO;
import com.example.karting_rm.entities.ComprobanteEntity;
import com.example.karting_rm.entities.ReservaEntity;
import com.example.karting_rm.repositories.ComprobanteRepository;
import com.example.karting_rm.repositories.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReporteService {

    @Autowired
    private ComprobanteRepository comprobanteRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final List<String> RANGOS_PERSONAS_DEFINIDOS = List.of("1-2 Personas", "3-5 Personas", "6-10 Personas", "11-15 Personas");
    private static final List<String> PREDEFINED_VUELTA_TARIFAS_DESCRIPTIONS = List.of("10 Vueltas", "15 Vueltas", "20 Vueltas");

    /**
     * Derives the tariff category string from a ReservaEntity.
     * Maps tipoReserva to descriptive vuelta counts based on your business rules.
     */
    private String getReportTariffCategory(ReservaEntity reserva) {
        return switch (reserva.getTiporeserva()) {
            case 1 -> "10 Vueltas"; // Normal (10 vueltas - 30 min)
            case 2 -> "15 Vueltas"; // Extendida (15 vueltas - 35 min)
            case 3 -> "20 Vueltas"; // Premium (20 vueltas - 40 min)
            default -> "Tarifa por Vueltas (Otro)";
        };
    }

    public ReporteResponseDTO generarReporteIngresosPorTarifa(int anioInicio, int mesInicio, int anioFin, int mesFin) {
        LocalDate fechaInicioReporte = LocalDate.of(anioInicio, mesInicio, 1);
        LocalDate fechaFinReporte = LocalDate.of(anioFin, mesFin, 1).withDayOfMonth(LocalDate.of(anioFin, mesFin, 1).lengthOfMonth());

        // Get all paid comprobantes in the date range
        List<ComprobanteEntity> comprobantesPagados = comprobanteRepository.findAll().stream()
                .filter(c -> "PAGADO".equalsIgnoreCase(c.getEstadoPago()))
                .filter(c -> c.getFechaEmision() != null && c.getTotal() > 0)
                .filter(c -> {
                    LocalDate fechaComprobante = c.getFechaEmision().toInstant()
                            .atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                    return !fechaComprobante.isBefore(fechaInicioReporte) && !fechaComprobante.isAfter(fechaFinReporte);
                })
                .toList();

        // Get corresponding reservas for tariff categorization
        Map<Long, ReservaEntity> reservasMap = new HashMap<>();
        for (ComprobanteEntity comprobante : comprobantesPagados) {
            reservaRepository.findById(comprobante.getReservaId()).ifPresent(reserva ->
                    reservasMap.put(comprobante.getReservaId(), reserva));
        }

        List<String> mesesDelRango = obtenerMesesEnRango(fechaInicioReporte, fechaFinReporte);

        Map<String, Map<String, Double>> ingresosPorTarifaYMes = comprobantesPagados.stream()
                .filter(c -> reservasMap.containsKey(c.getReservaId()))
                .collect(Collectors.groupingBy(
                        c -> getReportTariffCategory(reservasMap.get(c.getReservaId())),
                        Collectors.groupingBy(
                                c -> YearMonth.from(c.getFechaEmision().toInstant()
                                        .atZone(java.time.ZoneId.systemDefault()).toLocalDate()).format(MONTH_FORMATTER),
                                Collectors.summingDouble(c -> (double) c.getTotal())
                        )
                ));

        // Start with predefined vuelta-based tariffs
        Set<String> categoriasTarifaParaReporte = new LinkedHashSet<>(PREDEFINED_VUELTA_TARIFAS_DESCRIPTIONS);

        // Add any dynamically found categories from actual data
        comprobantesPagados.stream()
                .filter(c -> reservasMap.containsKey(c.getReservaId()))
                .map(c -> getReportTariffCategory(reservasMap.get(c.getReservaId())))
                .filter(Objects::nonNull)
                .forEach(categoriasTarifaParaReporte::add);

        List<ReporteFilaDTO> filasReporte = new ArrayList<>();
        List<String> sortedCategorias = categoriasTarifaParaReporte.stream().sorted().toList();

        for (String tipoTarifa : sortedCategorias) {
            Map<String, Double> ingresosMes = new LinkedHashMap<>();
            double totalCategoria = 0.0;
            for (String mes : mesesDelRango) {
                double ingresoMes = ingresosPorTarifaYMes.getOrDefault(tipoTarifa, Collections.emptyMap()).getOrDefault(mes, 0.0);
                ingresosMes.put(mes, ingresoMes);
                totalCategoria += ingresoMes;
            }
            filasReporte.add(new ReporteFilaDTO(tipoTarifa, ingresosMes, totalCategoria));
        }

        return construirReporteResponse(filasReporte, mesesDelRango);
    }

    public ReporteResponseDTO generarReporteIngresosPorNumeroPersonas(int anioInicio, int mesInicio, int anioFin, int mesFin) {
        LocalDate fechaInicioReporte = LocalDate.of(anioInicio, mesInicio, 1);
        LocalDate fechaFinReporte = LocalDate.of(anioFin, mesFin, 1).withDayOfMonth(LocalDate.of(anioFin, mesFin, 1).lengthOfMonth());

        // Get all paid comprobantes in the date range
        List<ComprobanteEntity> comprobantesPagados = comprobanteRepository.findAll().stream()
                .filter(c -> "PAGADO".equalsIgnoreCase(c.getEstadoPago()))
                .filter(c -> c.getFechaEmision() != null && c.getTotal() > 0)
                .filter(c -> {
                    LocalDate fechaComprobante = c.getFechaEmision().toInstant()
                            .atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                    return !fechaComprobante.isBefore(fechaInicioReporte) && !fechaComprobante.isAfter(fechaFinReporte);
                })
                .toList();

        // Get corresponding reservas for person count categorization
        Map<Long, ReservaEntity> reservasMap = new HashMap<>();
        for (ComprobanteEntity comprobante : comprobantesPagados) {
            reservaRepository.findById(comprobante.getReservaId()).ifPresent(reserva ->
                    reservasMap.put(comprobante.getReservaId(), reserva));
        }

        List<String> mesesDelRango = obtenerMesesEnRango(fechaInicioReporte, fechaFinReporte);

        Map<String, Map<String, Double>> ingresosPorRangoPersonasYMes = comprobantesPagados.stream()
                .filter(c -> reservasMap.containsKey(c.getReservaId()))
                .filter(c -> getRangoPersonas(reservasMap.get(c.getReservaId()).getNumero_personas()) != null)
                .collect(Collectors.groupingBy(
                        c -> getRangoPersonas(reservasMap.get(c.getReservaId()).getNumero_personas()),
                        Collectors.groupingBy(
                                c -> YearMonth.from(c.getFechaEmision().toInstant()
                                        .atZone(java.time.ZoneId.systemDefault()).toLocalDate()).format(MONTH_FORMATTER),
                                Collectors.summingDouble(c -> (double) c.getTotal())
                        )
                ));

        List<ReporteFilaDTO> filasReporte = new ArrayList<>();
        for (String rangoPersonas : RANGOS_PERSONAS_DEFINIDOS) {
            Map<String, Double> ingresosMes = new LinkedHashMap<>();
            double totalCategoria = 0.0;
            for (String mes : mesesDelRango) {
                double ingresoMes = ingresosPorRangoPersonasYMes.getOrDefault(rangoPersonas, Collections.emptyMap()).getOrDefault(mes, 0.0);
                ingresosMes.put(mes, ingresoMes);
                totalCategoria += ingresoMes;
            }
            filasReporte.add(new ReporteFilaDTO(rangoPersonas, ingresosMes, totalCategoria));
        }
        return construirReporteResponse(filasReporte, mesesDelRango);
    }

    private ReporteResponseDTO construirReporteResponse(List<ReporteFilaDTO> filasReporte, List<String> mesesDelRango) {
        Map<String, Double> totalesPorMes = new LinkedHashMap<>();
        double granTotal = 0.0;

        for (String mes : mesesDelRango) {
            double totalMesColumna = 0.0;
            for (ReporteFilaDTO fila : filasReporte) {
                totalMesColumna += fila.getIngresosPorMes().getOrDefault(mes, 0.0);
            }
            totalesPorMes.put(mes, totalMesColumna);
        }

        // Calculate grand total from the sum of category totals for accuracy
        granTotal = filasReporte.stream().mapToDouble(ReporteFilaDTO::getTotalIngresosCategoria).sum();

        return new ReporteResponseDTO(mesesDelRango, filasReporte, totalesPorMes, granTotal);
    }

    private List<String> obtenerMesesEnRango(LocalDate fechaInicio, LocalDate fechaFin) {
        List<String> meses = new ArrayList<>();
        YearMonth mesIterador = YearMonth.from(fechaInicio);
        YearMonth mesFinal = YearMonth.from(fechaFin);

        while (!mesIterador.isAfter(mesFinal)) {
            meses.add(mesIterador.format(MONTH_FORMATTER));
            mesIterador = mesIterador.plusMonths(1);
        }
        return meses;
    }

    private String getRangoPersonas(int cantidadPersonas) {
        if (cantidadPersonas >= 1 && cantidadPersonas <= 2) {
            return "1-2 Personas";
        } else if (cantidadPersonas >= 3 && cantidadPersonas <= 5) {
            return "3-5 Personas";
        } else if (cantidadPersonas >= 6 && cantidadPersonas <= 10) {
            return "6-10 Personas";
        } else if (cantidadPersonas >= 11 && cantidadPersonas <= 15) {
            return "11-15 Personas";
        }
        return null;
    }
}

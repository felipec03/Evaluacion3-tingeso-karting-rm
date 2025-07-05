package com.example.karting_rm.services;

import com.example.karting_rm.entities.ReservaEntity;
import com.example.karting_rm.repositories.ReservaRepository;
import jakarta.transaction.Transactional;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ReservaService {
    @Autowired
    private ReservaRepository reservaRepository;


    public boolean checkDisponibilidad(ReservaEntity reserva) {
        LocalDateTime inicio = reserva.getInicio_reserva();
        LocalDateTime fin = reserva.getFin_reserva();
        LocalDate fecha = reserva.getFecha();

        List<ReservaEntity> reservasEnFecha = reservaRepository.findByFecha(fecha);

        for (ReservaEntity existente : reservasEnFecha) {
            LocalDateTime existenteInicio = existente.getInicio_reserva();
            LocalDateTime existenteFin = existente.getFin_reserva();

            if (inicio.isBefore(existenteFin) && fin.isAfter(existenteInicio)) {
                return false; // Overlap found
            }
        }
        return true; // No overlap
    }

    public float calcularPrecioInicial(ReservaEntity reserva) {
        int tipoReserva = reserva.getTiporeserva();
        int cantidadPersonas = reserva.getNumero_personas();
        float precioInicial = switch (tipoReserva) {
            case 1 -> 25000 * cantidadPersonas; // 10 vueltas (30 min)
            case 2 -> 23000 * cantidadPersonas; // 15 vueltas (35 min) 
            case 3 -> 17250 * cantidadPersonas; // 20 vueltas (40 min)
            default -> throw new IllegalArgumentException("Tipo de reserva inválido");
        };

        // Check for holidays/weekends
        LocalDateTime fechaInicio = reserva.getInicio_reserva();
        String fechaMesDia = fechaInicio.format(DateTimeFormatter.ofPattern("MM-dd"));
        List<String> feriados = List.of("01-01", "05-01", "09-18", "09-19", "12-25");
        boolean esFeriado = feriados.contains(fechaMesDia);
        boolean esFinDeSemana = fechaInicio.getDayOfWeek() == DayOfWeek.SATURDAY ||
                fechaInicio.getDayOfWeek() == DayOfWeek.SUNDAY;

        // Apply surcharges (25% for holidays, 15% for weekends)
        if (esFeriado) precioInicial *= 1.25f;
        if (esFinDeSemana) precioInicial *= 1.15f;

        return precioInicial;
    }

    public float calcularDescuentoGrupo(ReservaEntity reserva, float precioInicial) {
        int personas = reserva.getNumero_personas();
        if (personas <= 2) return 0;
        else if (personas <= 5) return precioInicial * 0.1f;
        else if (personas <= 10) return precioInicial * 0.2f;
        else if (personas <= 15) return precioInicial * 0.3f;
        return 0;
    }

    public float calcularDescuentoEspecial(String email, float precioInicial) {
        List<ReservaEntity> reservas = reservaRepository.findByemailarrendatario(email);
        int mesActual = LocalDateTime.now().getMonthValue();
        long reservasEsteMes = reservas.stream()
                .filter(r -> r.getInicio_reserva().getMonthValue() == mesActual)
                .count();

        if (reservasEsteMes >= 7) return precioInicial * 0.3f;
        else if (reservasEsteMes >= 5) return precioInicial * 0.2f;
        else if (reservasEsteMes >= 2) return precioInicial * 0.1f;
        return 0;
    }

    public float descuentoPorCumpleanos(ReservaEntity reserva, float precioInicial) {
        int personas = reserva.getNumero_personas();
        int cumpleanios = reserva.getCantidadcumple();
        if (cumpleanios == 0) return 0;

        float tarifaIndividual = precioInicial / personas;
        if (personas >= 3 && personas <= 5) return tarifaIndividual * 0.5f;
        else if (personas >= 6 && personas <= 10) return tarifaIndividual * 0.5f * 2;
        return 0;
    }

    public void borrarReserva(@NotNull ReservaEntity reserva) {
        if (!reservaRepository.existsById(reserva.getId())) {
            throw new RuntimeException("Reserva no encontrada");
        }
        reservaRepository.delete(reserva);
    }

    // ...existing code...

    public boolean checkDisponibilidadExcluding(ReservaEntity reserva) {
        LocalDateTime inicio = reserva.getInicio_reserva();
        LocalDateTime fin = reserva.getFin_reserva();
        LocalDate fecha = reserva.getFecha();
        Long reservaId = reserva.getId();

        List<ReservaEntity> reservasEnFecha = reservaRepository.findByFecha(fecha);

        for (ReservaEntity existente : reservasEnFecha) {
            // Skip the current reservation being updated
            if (existente.getId().equals(reservaId)) {
                continue;
            }

            LocalDateTime existenteInicio = existente.getInicio_reserva();
            LocalDateTime existenteFin = existente.getFin_reserva();

            if (inicio.isBefore(existenteFin) && fin.isAfter(existenteInicio)) {
                return false; // Overlap found
            }
        }
        return true; // No overlap
    }

    // ...existing code...

    @Transactional
    public ReservaEntity crearReserva(ReservaEntity reserva) {
        // Validate input
        if (reserva.getEmailarrendatario() == null) {
            throw new RuntimeException("El email no puede ser nulo");
        }
        if (reserva.getInicio_reserva() == null || reserva.getFin_reserva() == null) {
            throw new RuntimeException("Las fechas de inicio y fin son obligatorias");
        }
        if (reserva.getFin_reserva().isBefore(reserva.getInicio_reserva())) {
            throw new RuntimeException("El fin de la reserva debe ser después del inicio");
        }

        // Set fecha based on inicioReserva
        reserva.setFecha(reserva.getInicio_reserva().toLocalDate());

        // Check availability
        if (!checkDisponibilidad(reserva)) {
            throw new RuntimeException("Horario no disponible");
        }

        // Calculate duration in minutes, then convert to hours for storage
        Duration duration = Duration.between(reserva.getInicio_reserva(), reserva.getFin_reserva());
        long durationMinutes = duration.toMinutes();
        
        // Validate duration based on reservation type
        long expectedMinutes = switch (reserva.getTiporeserva()) {
            case 1 -> 30; // 10 vueltas = 30 minutos
            case 2 -> 35; // 15 vueltas = 35 minutos  
            case 3 -> 40; // 20 vueltas = 40 minutos
            default -> throw new IllegalArgumentException("Tipo de reserva inválido");
        };
        
        // Allow some tolerance (±5 minutes)
        if (Math.abs(durationMinutes - expectedMinutes) > 5) {
            throw new RuntimeException("La duración no coincide con el tipo de reserva. " +
                "Esperado: " + expectedMinutes + " minutos, Recibido: " + durationMinutes + " minutos");
        }
        
        // Store duration in hours (for backward compatibility)
        reserva.setDuracion((int) Math.ceil(durationMinutes / 60.0));

        // Calculate and update all prices
        calcularYActualizarPrecios(reserva);

        return reservaRepository.save(reserva);
    }

    @Transactional
    public ReservaEntity updateReserva(ReservaEntity reserva) {
        if (!reservaRepository.existsById(reserva.getId())) {
            throw new RuntimeException("Reserva no encontrada");
        }

        // Validate input
        if (reserva.getEmailarrendatario() == null) {
            throw new IllegalArgumentException("El email no puede ser nulo");
        }
        if (reserva.getInicio_reserva() == null || reserva.getFin_reserva() == null) {
            throw new IllegalArgumentException("Las fechas de inicio y fin son obligatorias");
        }
        if (reserva.getFin_reserva().isBefore(reserva.getInicio_reserva())) {
            throw new IllegalArgumentException("El fin de la reserva debe ser después del inicio");
        }

        // Set fecha based on inicioReserva
        reserva.setFecha(reserva.getInicio_reserva().toLocalDate());

        // Check availability excluding this reservation
        if (!checkDisponibilidadExcluding(reserva)) {
            throw new IllegalArgumentException("Horario no disponible");
        }

        // Calculate duration in minutes, then convert to hours for storage
        Duration duration = Duration.between(reserva.getInicio_reserva(), reserva.getFin_reserva());
        long durationMinutes = duration.toMinutes();
        
        // Validate duration based on reservation type
        long expectedMinutes = switch (reserva.getTiporeserva()) {
            case 1 -> 30; // 10 vueltas = 30 minutos
            case 2 -> 35; // 15 vueltas = 35 minutos  
            case 3 -> 40; // 20 vueltas = 40 minutos
            default -> throw new IllegalArgumentException("Tipo de reserva inválido");
        };
        
        // Allow some tolerance (±5 minutes)
        if (Math.abs(durationMinutes - expectedMinutes) > 5) {
            throw new RuntimeException("La duración no coincide con el tipo de reserva. " +
                "Esperado: " + expectedMinutes + " minutos, Recibido: " + durationMinutes + " minutos");
        }
        
        // Store duration in hours (for backward compatibility)
        reserva.setDuracion((int) Math.ceil(durationMinutes / 60.0));

        // Calculate and update all prices
        calcularYActualizarPrecios(reserva);

        return reservaRepository.save(reserva);
    }

    // ...existing code...

    /**
     * Calculates all prices and updates the reservation entity with them
     */
    public void calcularYActualizarPrecios(ReservaEntity reserva) {
        float precioInicial = calcularPrecioInicial(reserva);
        float descGrupo = calcularDescuentoGrupo(reserva, precioInicial);
        float descFrecuente = calcularDescuentoEspecial(reserva.getEmailarrendatario(), precioInicial);
        float descCumple = descuentoPorCumpleanos(reserva, precioInicial);

        // Apply discounts and calculate total
        float totalSinIva = precioInicial - descGrupo - descFrecuente - descCumple;
        float iva = totalSinIva * 0.19f;
        float totalConIva = totalSinIva + iva;

        // Update reservation entity
        reserva.setPrecioInicial(precioInicial);
        reserva.setDescuentoGrupo(descGrupo);
        reserva.setDescuentoFrecuente(descFrecuente);
        reserva.setDescuentoCumple(descCumple);
        reserva.setIva(iva);
        reserva.setTotalConIva(totalConIva);
    }

    public boolean existsById(Long id) {
        return reservaRepository.existsById(id);
    }

    public ArrayList<ReservaEntity> getReservas() {
        ArrayList<ReservaEntity> reservas = (ArrayList<ReservaEntity>) reservaRepository.findAll();

        // Calculate and save prices for each reservation
        reservas.forEach(reserva -> {
            calcularYActualizarPrecios(reserva);
            reservaRepository.save(reserva); // Save the updated values
        });

        return reservas;
    }

    public Optional<ReservaEntity> getReservaById(Long reservaId) {
        Optional<ReservaEntity> reservaOpt = reservaRepository.findById(reservaId);
        // Calculate prices if the reservation exists
        reservaOpt.ifPresent(this::calcularYActualizarPrecios);
        return reservaOpt;
    }

    public List<ReservaEntity> getReservasByEmail(String email) {
        List<ReservaEntity> reservas = reservaRepository.findByemailarrendatario(email);
        // Calculate prices for each reservation
        reservas.forEach(this::calcularYActualizarPrecios);
        return reservas;
    }

    public List<ReservaEntity> getReservasByFecha(LocalDate fecha) {
        List<ReservaEntity> reservas = reservaRepository.findByFecha(fecha);
        // Calculate prices for each reservation
        reservas.forEach(this::calcularYActualizarPrecios);
        return reservas;
    }

}
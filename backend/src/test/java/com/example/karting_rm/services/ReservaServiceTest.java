package com.example.karting_rm.services;

import com.example.karting_rm.entities.ReservaEntity;
import com.example.karting_rm.repositories.ReservaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @InjectMocks
    private ReservaService reservaService;

    @Test
    void crearReserva_InvalidDates_ThrowsException() {
        ReservaEntity reserva = new ReservaEntity();
        reserva.setInicio_reserva(LocalDateTime.now().plusHours(2));
        reserva.setFin_reserva(LocalDateTime.now());
        assertThrows(RuntimeException.class, () -> reservaService.crearReserva(reserva));
    }

    @Test
    void calcularPrecioInicial_Holiday_AppliesSurcharge() {
        ReservaEntity reserva = new ReservaEntity();
        reserva.setTiporeserva(1);
        reserva.setNumero_personas(1);
        reserva.setInicio_reserva(LocalDateTime.of(2023, 12, 25, 10, 0)); // Christmas

        float price = reservaService.calcularPrecioInicial(reserva);
        assertEquals(25000 * 1.25f, price); // Base price + 25%
    }

    @Test
    void checkDisponibilidad_OverlappingReserva_ReturnsFalse() {
        ReservaEntity existing = new ReservaEntity();
        existing.setInicio_reserva(LocalDateTime.now());
        existing.setFin_reserva(LocalDateTime.now().plusHours(2));

        when(reservaRepository.findByFecha(any())).thenReturn(Collections.singletonList(existing));

        ReservaEntity newReserva = new ReservaEntity();
        newReserva.setInicio_reserva(LocalDateTime.now().plusHours(1));
        newReserva.setFin_reserva(LocalDateTime.now().plusHours(3));

        assertFalse(reservaService.checkDisponibilidad(newReserva));
    }

    @Test
    void calcularDescuentoGrupo_BoundaryValues() {
        ReservaEntity res = new ReservaEntity();
        res.setNumero_personas(15);
        res.setPrecioInicial(10000);

        float discount = reservaService.calcularDescuentoGrupo(res, 10000);
        assertEquals(10000 * 0.3f, discount);
    }

    @Test
    void descuentoPorCumpleanos_MultiplePeople() {
        ReservaEntity res = new ReservaEntity();
        res.setNumero_personas(6);
        res.setCantidadcumple(2);
        res.setPrecioInicial(15000);

        float discount = reservaService.descuentoPorCumpleanos(res, 15000);
        assertEquals((15000/6f) * 0.5f * 2, discount);
    }

    @Test
    void getReservas_RecalculatesPrices() {
        ReservaEntity res = new ReservaEntity();
        when(reservaRepository.findAll()).thenReturn(List.of(res));

        List<ReservaEntity> results = reservaService.getReservas();
        verify(reservaRepository, atLeastOnce()).save(res);
    }
}
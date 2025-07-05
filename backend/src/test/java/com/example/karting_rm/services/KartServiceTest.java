package com.example.karting_rm.services;

import com.example.karting_rm.entities.KartEntity;
import com.example.karting_rm.repositories.KartRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KartServiceTest {

    @Mock
    private KartRepository kartRepository;

    @InjectMocks
    private KartService kartService;

    @Test
    void getKartById_NotFound_ThrowsException() {
        when(kartRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> kartService.getKartById(1L));
    }

    @Test
    void saveKart_ValidKart_ReturnsSaved() {
        KartEntity kart = new KartEntity();
        when(kartRepository.save(kart)).thenReturn(kart);
        assertEquals(kart, kartService.saveKart(kart));
    }

    @Test
    void cambiarEstadoKart_ValidId_UpdatesEstado() {
        KartEntity kart = new KartEntity();
        when(kartRepository.findById(1L)).thenReturn(Optional.of(kart));
        when(kartRepository.save(kart)).thenReturn(kart);

        // Fix: Use the correct enum value "EN_MANTENIMIENTO" instead of "MANTENCION"
        KartEntity result = kartService.cambiarEstadoKart(1L, KartEntity.Estado.EN_MANTENIMIENTO);
        assertEquals(KartEntity.Estado.EN_MANTENIMIENTO, result.getEstado());
    }

    @Test
    void deleteKart_ValidId_DeletesKart() {
        when(kartRepository.existsById(1L)).thenReturn(true);
        kartService.deleteKart(1L);
        verify(kartRepository).deleteById(1L);
    }

    @Test
    void getKartsByEstado_ValidEstado_ReturnsFiltered() {
        when(kartRepository.findByEstado(KartEntity.Estado.PERFECTO))
                .thenReturn(List.of(new KartEntity()));
        assertEquals(1, kartService.getKartsByEstado(KartEntity.Estado.PERFECTO).size());
    }

    @Test
    void updateKart_NonExistentId_ThrowsException() {
        KartEntity kart = new KartEntity();
        kart.setId(99L);
        when(kartRepository.existsById(99L)).thenReturn(false);
        assertThrows(RuntimeException.class, () -> kartService.updateKart(kart));
    }

    @Test
    void getKarts_ReturnsAllKarts() {
        when(kartRepository.findAll()).thenReturn(List.of(new KartEntity(), new KartEntity()));
        assertEquals(2, kartService.getKarts().size());
    }

    @Test
    void cambiarEstadoKart_InvalidEstado_StillUpdates() {
        KartEntity kart = new KartEntity();
        when(kartRepository.findById(1L)).thenReturn(Optional.of(kart));
        when(kartRepository.save(kart)).thenReturn(kart);

        // Testing enum case coverage
        KartEntity result = kartService.cambiarEstadoKart(1L, KartEntity.Estado.FUERA_DE_SERVICIO);
        assertEquals(KartEntity.Estado.FUERA_DE_SERVICIO, result.getEstado());
    }
}
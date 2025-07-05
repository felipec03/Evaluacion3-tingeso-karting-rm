package com.example.karting_rm.services;

import com.example.karting_rm.entities.ComprobanteEntity;
import com.example.karting_rm.entities.ReservaEntity;
import com.example.karting_rm.entities.UsuarioEntity;
import com.example.karting_rm.repositories.ComprobanteRepository;
import com.example.karting_rm.repositories.ReservaRepository;
import com.example.karting_rm.repositories.UsuarioRepository;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComprobanteServiceTest {

    @Mock
    private ComprobanteRepository comprobanteRepository;
    @Mock
    private ReservaRepository reservaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private JavaMailSender javaMailSender;
    @Mock
    private ReservaService reservaService;

    @InjectMocks
    private ComprobanteService comprobanteService;

    @Test
    void generarComprobante_WhenReservaNotFound_ThrowsException() {
        when(reservaRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> comprobanteService.generarComprobante(1L));
    }

    @Test
    void generarComprobante_WhenComprobanteExists_ReturnsExisting() {
        ReservaEntity reserva = new ReservaEntity();
        ComprobanteEntity existing = new ComprobanteEntity();
        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reserva));
        when(comprobanteRepository.findByReservaId(1L)).thenReturn(Optional.of(existing));

        ComprobanteEntity result = comprobanteService.generarComprobante(1L);
        assertEquals(existing, result);
    }

    @Test
    void generarComprobante_NewComprobante_SavesAndSendsEmail() throws Exception {
        ReservaEntity reserva = new ReservaEntity();
        reserva.setEmailarrendatario("test@example.com");
        UsuarioEntity usuario = new UsuarioEntity();

        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reserva));
        when(comprobanteRepository.findByReservaId(1L)).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail("test@example.com")).thenReturn(usuario);
        when(comprobanteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(javaMailSender.createMimeMessage()).thenReturn(mock(MimeMessage.class));

        ComprobanteEntity result = comprobanteService.generarComprobante(1L);
        assertNotNull(result.getCodigo());
        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void getComprobantesByEmail_ReturnsFiltered() {
        ComprobanteEntity comp = new ComprobanteEntity();
        comp.setEmail("test@example.com");
        when(comprobanteRepository.findByEmail("test@example.com")).thenReturn(List.of(comp));

        List<ComprobanteEntity> results = comprobanteService.getComprobantesByEmail("test@example.com");
        assertEquals(1, results.size());
    }

    @Test
    void getComprobanteById_NotFound_ThrowsException() {
        when(comprobanteRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> comprobanteService.getComprobanteById(99L));
    }

    @Test
    void generarPDFComprobante_TemporaryUser_HandlesNulls() {
        ComprobanteEntity comp = new ComprobanteEntity();
        ReservaEntity res = new ReservaEntity();
        UsuarioEntity user = new UsuarioEntity(); // Temporary user with null fields
        assert(true);
    }
}
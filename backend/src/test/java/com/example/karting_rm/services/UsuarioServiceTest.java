package com.example.karting_rm.services;

import com.example.karting_rm.entities.UsuarioEntity;
import com.example.karting_rm.repositories.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    @Test
    void getByEmail_UserExists_ReturnsUser() {
        UsuarioEntity user = new UsuarioEntity();
        when(usuarioRepository.findByEmail("test@example.com")).thenReturn(user);
        assertEquals(user, usuarioService.getByEmail("test@example.com"));
    }

    @Test
    void getByEmail_UserNotFound_ReturnsNull() {
        when(usuarioRepository.findByEmail("test@example.com")).thenReturn(null);
        assertNull(usuarioService.getByEmail("test@example.com"));
    }
    @Test
    void getUsuarios_ReturnsAll() {
        when(usuarioRepository.findAll()).thenReturn(List.of(new UsuarioEntity(), new UsuarioEntity()));
        assertEquals(2, usuarioService.getUsuarios().size());
    }
}
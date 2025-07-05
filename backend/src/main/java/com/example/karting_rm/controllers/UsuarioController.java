package com.example.karting_rm.controllers;

import com.example.karting_rm.entities.UsuarioEntity;
import com.example.karting_rm.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    @Autowired
    UsuarioService usuarioService;

    @GetMapping("/")
    public ResponseEntity<ArrayList<UsuarioEntity>> listUsers() {
        ArrayList<UsuarioEntity> usuarios = usuarioService.getUsuarios();
        return ResponseEntity.ok(usuarios);
    }
}

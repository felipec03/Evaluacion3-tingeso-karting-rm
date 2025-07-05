package com.example.karting_rm.controllers;

import com.example.karting_rm.entities.DescuentosPersonaEntity;
import com.example.karting_rm.services.DescuentosPersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/descuentos-persona")
public class DescuentosPersonaController {

    @Autowired
    private DescuentosPersonaService descuentosPersonaService;

    @GetMapping({"/", ""})
    public ResponseEntity<List<DescuentosPersonaEntity>> getAllDescuentos() {
        List<DescuentosPersonaEntity> descuentos = descuentosPersonaService.getAllDescuentos();
        if (descuentos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(descuentos);
    }
}

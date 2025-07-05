package com.example.karting_rm.controllers;

import com.example.karting_rm.entities.TarifasDiaEspecialEntity;
import com.example.karting_rm.services.TarifasDiaEspecialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tarifas-especiales")
public class TarifasDiaEspecialController {

    @Autowired
    private TarifasDiaEspecialService tarifasDiaEspecialService;

    @GetMapping({"/", ""})
    public ResponseEntity<List<TarifasDiaEspecialEntity>> getAllTarifasEspeciales() {
        List<TarifasDiaEspecialEntity> tarifas = tarifasDiaEspecialService.getAllTarifasEspeciales();
        if (tarifas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(tarifas);
    }
}

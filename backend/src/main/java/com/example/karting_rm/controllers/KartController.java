package com.example.karting_rm.controllers;

import com.example.karting_rm.entities.KartEntity;
import com.example.karting_rm.services.KartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/karts")
public class KartController {
    @Autowired
    private KartService kartService;

    @GetMapping("/")
    public ResponseEntity<ArrayList<KartEntity>> listarKarts() {
        ArrayList<KartEntity> karts = kartService.getKarts();
        return ResponseEntity.ok(karts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getKartById(@PathVariable Long id) {
        try {
            KartEntity kart = kartService.getKartById(id);
            return ResponseEntity.ok(kart);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping()
    public ResponseEntity<?> createKart(@RequestBody KartEntity kart) {
        KartEntity created = kartService.saveKart(kart);
        return ResponseEntity.ok(created);
    }

    @PutMapping()
    public ResponseEntity<?> updateKart(@RequestBody KartEntity kart) {
        try {
            KartEntity updated = kartService.updateKart(kart);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteKart(@PathVariable Long id) {
        try {
            kartService.deleteKart(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<KartEntity>> getKartsByEstado(@PathVariable KartEntity.Estado estado) {
        return ResponseEntity.ok(kartService.getKartsByEstado(estado));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam KartEntity.Estado estado) {
        try {
            KartEntity updated = kartService.cambiarEstadoKart(id, estado);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

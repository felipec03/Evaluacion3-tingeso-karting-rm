package com.example.karting_rm.controllers;

import com.example.karting_rm.entities.ReservaEntity;
import com.example.karting_rm.services.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {
    @Autowired
    ReservaService reservaService;

    @GetMapping({"/", ""})
    public ResponseEntity<ArrayList<ReservaEntity>> listReservas(){
        ArrayList<ReservaEntity> reservas = reservaService.getReservas();
        return ResponseEntity.ok(reservas);
    }

    @PostMapping({"/", ""})
    public ResponseEntity<?> createReserva(@RequestBody ReservaEntity reserva) {
        try {
            ReservaEntity created = reservaService.crearReserva(reserva);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReservaById(@PathVariable Long id) {
        try {
            Optional<ReservaEntity> reserva = reservaService.getReservaById(id);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReserva(@PathVariable Long id, @RequestBody ReservaEntity reserva) {
        try {
            if (!reservaService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            // Ensure the ID in the path matches the ID in the body
            reserva.setId(id);

            ReservaEntity updated = reservaService.updateReserva(reserva);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarReserva(@PathVariable Long id) {
        try {
            Optional<ReservaEntity> reserva = reservaService.getReservaById(id);
            assert reserva.orElse(null) != null;
            reservaService.borrarReserva(reserva.orElse(null));
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getReservasByEmail(@PathVariable String email) {
        List<ReservaEntity> reservas = reservaService.getReservasByEmail(email);
        return ResponseEntity.ok(reservas);
    }

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<?> getReservasByFecha(@PathVariable String fecha) {
        try {
            LocalDate date = LocalDate.parse(fecha);
            List<ReservaEntity> reservas = reservaService.getReservasByFecha(date);
            return ResponseEntity.ok(reservas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/calcular-total")
    public ResponseEntity<?> calcularTotal(@RequestBody ReservaEntity reserva) {
        try {
            // Use a temporary copy of the reservation
            ReservaEntity tempReserva = new ReservaEntity();
            tempReserva.setTiporeserva(reserva.getTiporeserva());
            tempReserva.setNumero_personas(reserva.getNumero_personas());
            tempReserva.setInicio_reserva(reserva.getInicio_reserva());
            tempReserva.setFin_reserva(reserva.getFin_reserva());
            tempReserva.setEmailarrendatario(reserva.getEmailarrendatario());
            tempReserva.setCumpleanios(reserva.getCumpleanios());
            tempReserva.setCantidadcumple(reserva.getCantidadcumple());

            // Calculate prices
            reservaService.calcularYActualizarPrecios(tempReserva);

            Map<String, Object> response = new HashMap<>();
            response.put("precioBase", tempReserva.getPrecioInicial());
            response.put("descuentoGrupo", tempReserva.getDescuentoGrupo());
            response.put("descuentoFrecuente", tempReserva.getDescuentoFrecuente());
            response.put("descuentoCumple", tempReserva.getDescuentoCumple());
            response.put("totalSinIva", tempReserva.getPrecioInicial() - tempReserva.getDescuentoGrupo() -
                    tempReserva.getDescuentoFrecuente() - tempReserva.getDescuentoCumple());
            response.put("iva", tempReserva.getIva());
            response.put("totalConIva", tempReserva.getTotalConIva());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
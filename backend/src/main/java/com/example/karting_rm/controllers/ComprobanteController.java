package com.example.karting_rm.controllers;

import com.example.karting_rm.entities.ComprobanteEntity;
import com.example.karting_rm.services.ComprobanteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/comprobantes")
public class ComprobanteController {
    @Autowired
    private ComprobanteService comprobanteService;

    @GetMapping("/")
    public ResponseEntity<ArrayList<ComprobanteEntity>> listarComprobantes() {
        ArrayList<ComprobanteEntity> comprobantes = comprobanteService.getComprobantes();
        return ResponseEntity.ok(comprobantes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getComprobanteById(@PathVariable Long id) {
        try {
            ComprobanteEntity comprobante = comprobanteService.getComprobanteById(id);
            return ResponseEntity.ok(comprobante);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @RequestMapping(value = "/generar/{reservaId}", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<?> generarComprobante(@PathVariable Long reservaId) {
        try {
            ComprobanteEntity comprobante = comprobanteService.generarComprobante(reservaId);
            return ResponseEntity.ok(comprobante);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<List<ComprobanteEntity>> getComprobantesByEmail(@PathVariable String email) {
        List<ComprobanteEntity> comprobantes = comprobanteService.getComprobantesByEmail(email);
        return ResponseEntity.ok(comprobantes);
    }

    @GetMapping("/download/reserva/{reservaId}")
    public ResponseEntity<byte[]> descargarComprobantePdf(@PathVariable Long reservaId) {
        try {
            byte[] pdfBytes = comprobanteService.obtenerPdfPorReservaId(reservaId);

            // Get the comprobante for the filename
            ComprobanteEntity comprobante = comprobanteService.comprobanteRepository.findByReservaId(reservaId)
                    .orElseThrow(() -> new RuntimeException("Comprobante no encontrado"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Comprobante-" + comprobante.getCodigo() + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Log the error and return a meaningful status and message
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("Error: " + e.getMessage()).getBytes());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("Error interno: " + e.getMessage()).getBytes());
        }
    }
}
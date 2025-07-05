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

    // 1. Solo genera y guarda el comprobante (no PDF, no email)
    @PostMapping("/generar/{reservaId}")
    public ResponseEntity<?> generarComprobante(@PathVariable Long reservaId, @RequestParam(value = "metodoPago", required = false) String metodoPago) {
        try {
            ComprobanteEntity comprobante = comprobanteService.generarComprobanteOnly(reservaId, metodoPago);
            return ResponseEntity.ok(mapComprobanteToDto(comprobante));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Genera y retorna el PDF del comprobante (no email)
    @GetMapping("/generar-pdf/{reservaId}")
    public ResponseEntity<byte[]> generarPdfComprobante(@PathVariable Long reservaId) {
        try {
            byte[] pdfBytes = comprobanteService.generarPdfComprobantePorReservaId(reservaId);
            ComprobanteEntity comprobante = comprobanteService.getComprobanteByReservaId(reservaId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Comprobante-" + comprobante.getCodigo() + ".pdf");
            headers.setContentLength(pdfBytes.length);
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("Error: " + e.getMessage()).getBytes());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("Error interno: " + e.getMessage()).getBytes());
        }
    }

    // 3. Envía el comprobante PDF por email (no retorna PDF)
    @PostMapping("/enviar-pdf-email/{reservaId}")
    public ResponseEntity<?> enviarComprobantePdfPorEmail(@PathVariable Long reservaId) {
        try {
            comprobanteService.enviarComprobantePdfPorEmail(reservaId);
            return ResponseEntity.ok("Comprobante enviado por email correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Utilidad para mapear a DTO compatible con frontend
    private Object mapComprobanteToDto(ComprobanteEntity c) {
        return new java.util.HashMap<String, Object>() {{
            put("idComprobante", c.getId());
            put("codigoComprobante", c.getCodigo());
            put("idReserva", c.getReservaId());
            put("nombreUsuario", c.getNombreUsuario());
            put("emailUsuario", c.getEmail());
            put("fechaEmision", c.getFechaEmision());
            put("montoBase", c.getTarifaBase());
            put("montoDescuentoTotal", Math.max(Math.max(c.getDescuentoGrupo(), c.getDescuentoFrecuente()), c.getDescuentoCumple()));
            put("porcentajeDescuentoAplicado", c.getTarifaBase() > 0 ? (100.0 * Math.max(Math.max(c.getDescuentoGrupo(), c.getDescuentoFrecuente()), c.getDescuentoCumple()) / c.getTarifaBase()) : 0);
            put("subtotalSinIva", c.getPrecioSinIva());
            put("iva", c.getIva());
            put("montoPagadoTotal", c.getTotal());
            put("metodoPago", c.getMetodoPago());
            put("estadoPago", c.getEstadoPago());
        }};
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
            ComprobanteEntity comprobante = comprobanteService.getComprobanteByReservaId(reservaId);

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
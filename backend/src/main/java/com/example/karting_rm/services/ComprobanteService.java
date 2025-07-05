package com.example.karting_rm.services;

import com.example.karting_rm.entities.ComprobanteEntity;
import com.example.karting_rm.entities.ReservaEntity;
import com.example.karting_rm.entities.UsuarioEntity;
import com.example.karting_rm.repositories.ComprobanteRepository;
import com.example.karting_rm.repositories.ReservaRepository;
import com.example.karting_rm.repositories.UsuarioRepository;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ByteArrayResource;

import jakarta.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Locale;

// PDF generation imports
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ComprobanteService {
    private static final Logger logger = LoggerFactory.getLogger(ComprobanteService.class);

    @Autowired
    public ComprobanteRepository comprobanteRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private ReservaService reservaService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JavaMailSender javaMailSender;

    public ArrayList<ComprobanteEntity> getComprobantes() {
        return (ArrayList<ComprobanteEntity>) comprobanteRepository.findAll();
    }

    public ComprobanteEntity getComprobanteById(Long id) {
        return comprobanteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comprobante no encontrado"));
    }

    @Transactional
    public ComprobanteEntity generarComprobante(Long reservaId) {
        Optional<ReservaEntity> reservaOpt = reservaRepository.findById(reservaId);
        if (reservaOpt.isEmpty()) {
            throw new RuntimeException("Reserva no encontrada con ID: " + reservaId);
        }

        ReservaEntity reserva = reservaOpt.get();

        // Verificar si ya existe un comprobante para esta reserva
        Optional<ComprobanteEntity> comprobanteExistente = comprobanteRepository.findByReservaId(reservaId);
        if (comprobanteExistente.isPresent()) {
            return comprobanteExistente.get(); // Retorna el comprobante existente
        }

        // Generar código único para el comprobante
        String codigo = "KRM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Obtener información de usuario
        UsuarioEntity usuario = usuarioRepository.findByEmail(reserva.getEmailarrendatario());
        if (usuario == null) {
            // Crear un usuario temporal con la información mínima necesaria
            usuario = new UsuarioEntity();
            usuario.setEmail(reserva.getEmailarrendatario());
            usuario.setNombre("Cliente");
            usuario.setApellido("Temporal");
            usuario.setTelefono("No registrado");
            // No guardamos el usuario temporal en la base de datos
        }

        // Crear el comprobante
        ComprobanteEntity comprobante = new ComprobanteEntity();
        comprobante.setReservaId(reservaId);
        comprobante.setEmail(reserva.getEmailarrendatario());
        comprobante.setCodigo(codigo);

        // Calcular precios y descuentos
        float tarifaBase = reserva.getPrecioInicial();
        float descuentoGrupo = reserva.getDescuentoGrupo();
        float descuentoFrecuente = reserva.getDescuentoFrecuente();
        float descuentoCumple = reserva.getDescuentoCumple();

        // Aplicar el mayor descuento (basado en la lógica de negocio)
        float descuentoAplicado = Math.max(Math.max(descuentoGrupo, descuentoFrecuente), descuentoCumple);
        float precioSinIva = tarifaBase - descuentoAplicado;
        float iva = reserva.getIva();
        float total = reserva.getTotalConIva();

        // Establecer los valores en el comprobante
        comprobante.setTarifaBase(tarifaBase);
        comprobante.setDescuentoGrupo(descuentoGrupo);
        comprobante.setDescuentoFrecuente(descuentoFrecuente);
        comprobante.setDescuentoCumple(descuentoCumple);
        comprobante.setPrecioSinIva(precioSinIva);
        comprobante.setIva(iva);
        comprobante.setTotal(total);

        // Guardar el comprobante
        ComprobanteEntity comprobanteGuardado = comprobanteRepository.save(comprobante);

        // Generar y enviar PDF
        try {
            byte[] pdfBytes = generarPDFComprobante(comprobante, reserva, usuario);
            enviarComprobantePorEmail(reserva.getEmailarrendatario(), pdfBytes, codigo);
        } catch (Exception e) {
            logger.error("Error al generar o enviar el comprobante: {}", e.getMessage());
            // Continuar guardando el comprobante aunque falle el envío
        }

        return comprobanteGuardado;
    }

    public byte[] generarPDFComprobante(ComprobanteEntity comprobante, ReservaEntity reserva, UsuarioEntity usuario) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(36, 36, 36, 36); // top, right, bottom, left

            // Configuración para formato chileno
            Locale localeChile = new Locale("es", "CL");

            // ENCABEZADO
            Paragraph header = new Paragraph()
                    .add(new Text("🏁 Comprobante de Reserva - KartingRM 🏁").setBold().setFontSize(16))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(header);

            // CÓDIGO DE RESERVA
            Paragraph codigoReserva = new Paragraph()
                    .add(new Text("Código de Reserva: " + comprobante.getCodigo()).setBold().setFontSize(14))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(15);
            document.add(codigoReserva);

            // TABLA DE INFORMACIÓN DE RESERVA
            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(15);

            // Agregar datos de la reserva
            addInfoRow(infoTable, "Nombre Cliente:", usuario.getNombre() + " " + usuario.getApellido());
            addInfoRow(infoTable, "Email:", usuario.getEmail());
            addInfoRow(infoTable, "Teléfono:", usuario.getTelefono());

            // Formatear fecha y hora
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            String fechaInicio = reserva.getInicio_reserva().format(formatter);
            String fechaFin = reserva.getFin_reserva().format(formatter);

            addInfoRow(infoTable, "Fecha y Hora:", fechaInicio + " a " + fechaFin);
            addInfoRow(infoTable, "Duración:", reserva.getDuracion() + " horas");
            addInfoRow(infoTable, "Número de Personas:", String.valueOf(reserva.getNumero_personas()));

            // Tipo de reserva
            String tipoReserva = switch (reserva.getTiporeserva()) {
                case 1 -> "Normal (10 vueltas)";
                case 2 -> "Extendida (15 vueltas)";
                case 3 -> "Premium (20 vueltas)";
                default -> "Desconocido";
            };
            addInfoRow(infoTable, "Tipo de Reserva:", tipoReserva);

            if (reserva.getCantidadcumple() > 0) {
                addInfoRow(infoTable, "Personas de Cumpleaños:", String.valueOf(reserva.getCantidadcumple()));
            }

            document.add(infoTable);

            // NOTA SOBRE DESCUENTOS
            if (Math.max(Math.max(comprobante.getDescuentoGrupo(), comprobante.getDescuentoFrecuente()),
                    comprobante.getDescuentoCumple()) > 0) {
                Paragraph notaDescuento = new Paragraph()
                        .add(new Text("Se ha aplicado el descuento más favorable para usted.").setItalic())
                        .setMarginBottom(10);
                document.add(notaDescuento);
            }

            // TABLA DE PRECIOS
            document.add(new Paragraph("Detalle de Precios:").setBold().setMarginBottom(5));

            Table pricingTable = new Table(UnitValue.createPercentArray(new float[]{70, 30}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(20);

            // Encabezados
            pricingTable.addHeaderCell(createHeaderCell("Concepto"));
            pricingTable.addHeaderCell(createHeaderCell("Valor (CLP)"));

            // Filas de precios
            addPricingRow(pricingTable, "Precio Base", comprobante.getTarifaBase(), localeChile);

            // Mostrar descuentos solo si se aplicaron
            float mayorDescuento = 0;
            String tipoDescuento = "";

            if (comprobante.getDescuentoGrupo() > 0) {
                mayorDescuento = comprobante.getDescuentoGrupo();
                tipoDescuento = "Grupo";
            }
            if (comprobante.getDescuentoFrecuente() > 0 && comprobante.getDescuentoFrecuente() > mayorDescuento) {
                mayorDescuento = comprobante.getDescuentoFrecuente();
                tipoDescuento = "Cliente Frecuente";
            }
            if (comprobante.getDescuentoCumple() > 0 && comprobante.getDescuentoCumple() > mayorDescuento) {
                mayorDescuento = comprobante.getDescuentoCumple();
                tipoDescuento = "Cumpleaños";
            }

            if (mayorDescuento > 0) {
                addPricingRow(pricingTable, "Descuento " + tipoDescuento, -mayorDescuento, localeChile);
            }

            // Subtotal
            addPricingRow(pricingTable, "Subtotal", comprobante.getPrecioSinIva(), localeChile);

            // IVA
            addPricingRow(pricingTable, "IVA (19%)", comprobante.getIva(), localeChile);

            // Total (como footer)
            Cell totalLabelCell = new Cell(1, 1)
                    .add(new Paragraph("TOTAL A PAGAR").setBold())
                    .setBorderTop(new SolidBorder(ColorConstants.BLACK, 1))
                    .setBorderBottom(Border.NO_BORDER)
                    .setBorderLeft(Border.NO_BORDER)
                    .setBorderRight(Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setPaddingTop(5);
            pricingTable.addFooterCell(totalLabelCell);

            Cell totalValueCell = new Cell(1, 1)
                    .add(new Paragraph(String.format(localeChile, "$%,.0f", comprobante.getTotal())).setBold())
                    .setBorderTop(new SolidBorder(ColorConstants.BLACK, 1))
                    .setBorderBottom(Border.NO_BORDER)
                    .setBorderLeft(Border.NO_BORDER)
                    .setBorderRight(Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setPaddingTop(5);
            pricingTable.addFooterCell(totalValueCell);

            document.add(pricingTable);

            // PIE DE PÁGINA
            Paragraph footer = new Paragraph()
                    .add(new Text("Este comprobante debe ser presentado el día de su reserva en el Kartódromo.\n").setItalic())
                    .add(new Text("¡Gracias por preferir KartingRM! Te esperamos.").setItalic())
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(10)
                    .setMarginTop(20);
            document.add(footer);

            document.close();
            logger.info("PDF generado con éxito para la reserva ID: {}", reserva.getId());
            return outputStream.toByteArray();

        } catch (Exception e) {
            logger.error("Error al generar el PDF: {}", e.getMessage());
            throw new RuntimeException("Error al generar el PDF: " + e.getMessage(), e);
        }
    }

    public byte[] obtenerPdfPorReservaId(Long reservaId) {
        Optional<ReservaEntity> reservaOpt = reservaRepository.findById(reservaId);
        if (reservaOpt.isEmpty()) {
            throw new RuntimeException("Reserva no encontrada con ID: " + reservaId);
        }
        ReservaEntity reserva = reservaOpt.get();

        // Check if comprobante exists, if not generate one
        ComprobanteEntity comprobante;
        Optional<ComprobanteEntity> comprobanteOpt = comprobanteRepository.findByReservaId(reservaId);

        if (comprobanteOpt.isEmpty()) {
            // Generate a new comprobante
            comprobante = generarComprobante(reservaId);
        } else {
            comprobante = comprobanteOpt.get();
        }

        UsuarioEntity usuario = usuarioRepository.findByEmail(reserva.getEmailarrendatario());
        if (usuario == null) {
            // Estrategia usuario temporal
            usuario = new UsuarioEntity();
            usuario.setEmail(reserva.getEmailarrendatario());
            usuario.setNombre("Cliente");
            usuario.setApellido("Temporal");
            usuario.setTelefono("No registrado");
        }

        try {
            return generarPDFComprobante(comprobante, reserva, usuario);
        } catch (Exception e) {
            logger.error("Error al generar PDF para descarga para reserva ID {}: {}", reservaId, e.getMessage());
            throw new RuntimeException("Error al generar el PDF para descarga: " + e.getMessage(), e);
        }
    }

    private void enviarComprobantePorEmail(String email, byte[] pdfBytes, String codigo) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(email);
            helper.setSubject("🏎️ Comprobante de Reserva - KartingRM [" + codigo + "]");
            helper.setText(
                    "Estimado cliente,\n\n" +
                            "Adjunto encontrará el comprobante de su reserva en KartingRM con el código " + codigo + ".\n\n" +
                            "Recuerde presentar este comprobante el día de su visita al Kartódromo.\n\n" +
                            "Muchas gracias por su preferencia.\n\n" +
                            "Atentamente,\n" +
                            "El equipo de KartingRM"
            );

            helper.addAttachment("Comprobante-" + codigo + ".pdf", new ByteArrayResource(pdfBytes));

            javaMailSender.send(message);
            logger.info("Email enviado con éxito a: {}", email);

        } catch (Exception e) {
            logger.error("Error al enviar el email: {}", e.getMessage());
            throw new RuntimeException("Error al enviar el email: " + e.getMessage(), e);
        }
    }

    // Método para agregar filas a la tabla de información
    private void addInfoRow(Table table, String label, String value) {
        Cell labelCell = new Cell()
                .add(new Paragraph(new Text(label).setBold()))
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.LEFT)
                .setPaddingRight(10);
        table.addCell(labelCell);

        Cell valueCell = new Cell()
                .add(new Paragraph(value != null ? value : "-"))
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.LEFT);
        table.addCell(valueCell);
    }

    // Método para agregar filas a la tabla de precios
    private void addPricingRow(Table table, String description, float value, Locale locale) {
        Cell descCell = new Cell()
                .add(new Paragraph(description))
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.LEFT);
        table.addCell(descCell);

        String formattedValue = String.format(locale, "$%,.0f", value);
        Cell valueCell = new Cell()
                .add(new Paragraph(formattedValue))
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT);
        table.addCell(valueCell);
    }

    // Método para crear encabezados de tabla
    private Cell createHeaderCell(String text) {
        return new Cell()
                .add(new Paragraph(text).setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setBorderBottom(new SolidBorder(ColorConstants.BLACK, 1));
    }

    public List<ComprobanteEntity> getComprobantesByEmail(String email) {
        return comprobanteRepository.findByEmail(email);
    }
}
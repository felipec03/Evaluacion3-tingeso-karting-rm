import React, { useState, useEffect } from 'react';
import ComprobanteService from '../services/ComprobanteService';
import { useLocation } from 'react-router-dom';

const ComprobanteForm = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialReservaId = queryParams.get('reservaId') || '';

    const [reservaId, setReservaId] = useState(initialReservaId);
    const [metodoPago, setMetodoPago] = useState('TARJETA'); // Default payment method
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [comprobanteDetails, setComprobanteDetails] = useState(null);

    useEffect(() => {
        // This auto-submit logic might need re-evaluation if metodoPago is also required from query params.
        // For now, it will use the default metodoPago if initialReservaId is present.
        if (initialReservaId && !success && !loading && metodoPago) {
            // Create a synthetic event or call a different handler
            // handleSubmit(new Event('submit')); // This might not be ideal
            // Consider a dedicated function if auto-submission is complex
        }
    }, [initialReservaId, metodoPago, success, loading]);

    const handleReservaIdChange = (e) => {
        setReservaId(e.target.value);
    };

    const handleMetodoPagoChange = (e) => {
        setMetodoPago(e.target.value);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reservaId || isNaN(reservaId) || Number(reservaId) <= 0) {
            setError('Por favor ingrese un ID de reserva válido.');
            return;
        }
        if (!metodoPago) {
            setError('Por favor seleccione un método de pago.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);
        setComprobanteDetails(null);
        
        ComprobanteService.generarComprobante(reservaId, metodoPago)
            .then(response => {
                setComprobanteDetails(response.data);
                setSuccess(true);
                setLoading(false);
            })
            .catch(err => {
                setError('Error al generar el comprobante: ' + (err.response?.data?.message || err.response?.data || err.message));
                setLoading(false);
            });
    };
    
    // Descargar PDF usando el endpoint desacoplado
    const downloadPdf = () => {
        if (!comprobanteDetails || !comprobanteDetails.idReserva) {
            setError('No hay detalles del comprobante para descargar o falta el ID de la reserva.');
            return;
        }
        setLoading(true);
        setError('');
        ComprobanteService.generarPdfComprobante(comprobanteDetails.idReserva)
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                let filename = `Comprobante-${comprobanteDetails.idReserva}.pdf`;
                const contentDisposition = response.headers['content-disposition'];
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="?([^";]+)"?/);
                    if (match) filename = match[1];
                }
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch(err => {
                setError('Error al descargar PDF: ' + (err.response?.data || err.message));
            })
            .finally(() => setLoading(false));
    };

    // Enviar comprobante PDF por email usando el endpoint desacoplado
    const handleEnviarEmail = () => {
        if (!comprobanteDetails || !comprobanteDetails.idReserva) {
            setError('No hay comprobante para enviar por email.');
            return;
        }
        setLoading(true);
        setError('');
        ComprobanteService.enviarComprobantePdfPorEmail(comprobanteDetails.idReserva)
            .then(res => {
                setSuccess(true);
            })
            .catch(err => {
                setError('Error al enviar email: ' + (err.response?.data || err.message));
            })
            .finally(() => setLoading(false));
    };

    const resetForm = () => {
        setReservaId(initialReservaId); // Reset to initial if provided, else empty
        setMetodoPago('TARJETA');
        setSuccess(false);
        setError('');
        setComprobanteDetails(null);
    };
    
    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h3 className="card-title mb-4">Generar Comprobante de Pago</h3>
                    
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    
                    {!success ? (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="reservaId" className="form-label">
                                    ID de la Reserva
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="reservaId"
                                    value={reservaId}
                                    onChange={handleReservaIdChange}
                                    min="1"
                                    required
                                    placeholder="Ingrese el ID de la reserva"
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="metodoPago" className="form-label">
                                    Método de Pago
                                </label>
                                <select
                                    className="form-select"
                                    id="metodoPago"
                                    value={metodoPago}
                                    onChange={handleMetodoPagoChange}
                                    required
                                >
                                    <option value="TARJETA">Tarjeta</option>
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TRANSFERENCIA">Transferencia</option>
                                </select>
                            </div>
                            
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Generando...' : 'Generar Comprobante'}
                            </button>
                        </form>
                    ) : (
                        <div>
                            <div className="alert alert-success" role="alert">
                                <h4 className="alert-heading">¡Comprobante generado correctamente!</h4>
                                <p>Se ha generado el comprobante para la reserva #{comprobanteDetails?.idReserva}</p>
                            </div>
                            
                            {comprobanteDetails && (
                                <div className="card mb-3 bg-light">
                                    <div className="card-body">
                                        <h5 className="card-title">Detalles del Comprobante</h5>
                                        <p><strong>Código Comprobante:</strong> {comprobanteDetails.codigoComprobante}</p>
                                        <p><strong>ID Reserva:</strong> {comprobanteDetails.idReserva}</p>
                                        <p><strong>Cliente:</strong> {comprobanteDetails.nombreUsuario}</p>
                                        <p><strong>Email:</strong> {comprobanteDetails.emailUsuario}</p>
                                        <p><strong>Fecha Emisión:</strong> {new Date(comprobanteDetails.fechaEmision).toLocaleString()}</p>
                                        <p><strong>Monto Base:</strong> ${comprobanteDetails.montoBase?.toLocaleString('es-CL')}</p>
                                        {comprobanteDetails.montoDescuentoTotal > 0 && (
                                            <p><strong>Descuento Aplicado ({comprobanteDetails.porcentajeDescuentoAplicado?.toFixed(2)}%):</strong> -${comprobanteDetails.montoDescuentoTotal?.toLocaleString('es-CL')}</p>
                                        )}
                                        <p><strong>Subtotal sin IVA:</strong> ${comprobanteDetails.subtotalSinIva?.toLocaleString('es-CL')}</p>
                                        <p><strong>IVA (19%):</strong> ${comprobanteDetails.iva?.toLocaleString('es-CL')}</p>
                                        <p><strong>Total Pagado:</strong> ${comprobanteDetails.montoPagadoTotal?.toLocaleString('es-CL')}</p>
                                        <p><strong>Método de Pago:</strong> {comprobanteDetails.metodoPago}</p>
                                        <p><strong>Estado Pago:</strong> {comprobanteDetails.estadoPago}</p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="d-flex flex-wrap gap-2">
                                <button 
                                    className="btn btn-success" 
                                    onClick={downloadPdf}
                                    disabled={loading || !comprobanteDetails}
                                >
                                    {loading ? 'Descargando...' : 'Descargar PDF'}
                                </button>
                                <button
                                    className="btn btn-info"
                                    onClick={handleEnviarEmail}
                                    disabled={loading || !comprobanteDetails}
                                >
                                    {loading ? 'Enviando...' : 'Enviar por Email'}
                                </button>
                                <button 
                                    className="btn btn-outline-secondary" 
                                    onClick={resetForm}
                                >
                                    Generar otro comprobante
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComprobanteForm;
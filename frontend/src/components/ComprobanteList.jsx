import React, { useState, useEffect } from 'react';
import ComprobanteService from '../services/ComprobanteService';
import { Table, Alert, Spinner, Button } from 'react-bootstrap';

const ComprobanteList = () => {
    const [comprobantes, setComprobantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [loadingPdfId, setLoadingPdfId] = useState(null);
    const [loadingEmailCodigo, setLoadingEmailCodigo] = useState(null);


    useEffect(() => {
        fetchComprobantes();
    }, []);

    const fetchComprobantes = () => {
        setLoading(true);
        setError('');
        ComprobanteService.getAllComprobantes()
            .then(response => {
                setComprobantes(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Error al cargar los comprobantes: ' + (err.response?.data?.message || err.response?.data || err.message));
                setLoading(false);
            });
    };

    const handleDownloadPdf = (idComprobante) => {
        setLoadingPdfId(idComprobante);
        ComprobanteService.downloadComprobantePdfById(idComprobante)
            .then(response => {
                const contentType = response.headers['content-type'];
                if (contentType && contentType.includes('application/pdf')) {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    const contentDisposition = response.headers['content-disposition'];
                    let filename = `Comprobante-${idComprobante}.pdf`;
                    if (contentDisposition) {
                        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                        if (filenameMatch && filenameMatch.length > 1) {
                            filename = filenameMatch[1].replace(/"/g, '');
                        }
                    }
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    setTimeout(() => window.URL.revokeObjectURL(url), 100);
                } else {
                    const reader = new FileReader();
                    reader.onload = () => { setError(`Error al descargar PDF para ${idComprobante}: ` + reader.result); };
                    reader.readAsText(new Blob([response.data]));
                }
            })
            .catch(err => {
                console.error(`Error downloading PDF for ${idComprobante}:`, err);
                let errorMessage = `Error al descargar el PDF para ${idComprobante}`;
                if (err.response && err.response.data instanceof Blob) {
                    const reader = new FileReader();
                    reader.onload = () => { setError(errorMessage + ': ' + reader.result); };
                    reader.readAsText(err.response.data);
                } else {
                    setError(errorMessage + ': ' + (err.response?.data || err.message));
                }
            })
            .finally(() => {
                setLoadingPdfId(null);
            });
    };

    const handleEnviarEmail = (codigoComprobante) => {
        setLoadingEmailCodigo(codigoComprobante);
        ComprobanteService.enviarEmailComprobante(codigoComprobante)
            .then(response => {
                alert(response.data || `Solicitud de envío de email para ${codigoComprobante} procesada.`);
            })
            .catch(err => {
                setError(`Error al enviar email para ${codigoComprobante}: ` + (err.response?.data || err.message));
            })
            .finally(() => {
                setLoadingEmailCodigo(null);
            });
    };


    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando comprobantes...</span>
                </Spinner>
                <p className="ms-2 mb-0">Cargando comprobantes...</p>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (comprobantes.length === 0) {
        return <Alert variant="info">No hay comprobantes para mostrar.</Alert>;
    }

    return (
        <div className="card shadow-sm">
            <div className="card-header bg-light py-3">
                <h4 className="mb-0">Listado de Comprobantes Emitidos</h4>
            </div>
            <div className="card-body">
                <Table striped bordered hover responsive className="align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Código</th>
                            <th>ID Reserva</th>
                            <th>Cliente</th>
                            <th>Email</th>
                            <th>Fecha Emisión</th>
                            <th>Total Pagado</th>
                            <th>Método Pago</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comprobantes.map(c => (
                            <tr key={c.idComprobante}>
                                <td>{c.idComprobante}</td>
                                <td>{c.codigoComprobante}</td>
                                <td>{c.idReserva}</td>
                                <td>{c.nombreUsuario}</td>
                                <td>{c.emailUsuario}</td>
                                <td>{new Date(c.fechaEmision).toLocaleString()}</td>
                                <td className="text-end">{Number(c.montoPagadoTotal).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                                <td>{c.metodoPago}</td>
                                <td>
                                    <span className={`badge bg-${c.estadoPago === 'PAGADO' ? 'success' : 'warning'}`}>
                                        {c.estadoPago}
                                    </span>
                                </td>
                                <td>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm" 
                                        className="me-2 mb-1 mb-md-0"
                                        onClick={() => handleDownloadPdf(c.idComprobante)}
                                        disabled={loadingPdfId === c.idComprobante}
                                    >
                                        {loadingPdfId === c.idComprobante ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'PDF'}
                                    </Button>
                                    <Button 
                                        variant="outline-info" 
                                        size="sm"
                                        onClick={() => handleEnviarEmail(c.codigoComprobante)}
                                        disabled={loadingEmailCodigo === c.codigoComprobante}
                                    >
                                        {loadingEmailCodigo === c.codigoComprobante ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Email'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default ComprobanteList;
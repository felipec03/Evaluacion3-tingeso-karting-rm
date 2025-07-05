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

    // Descargar PDF usando el endpoint desacoplado
    const handleDownloadPdf = (idComprobante) => {
        setLoadingPdfId(idComprobante);
        ComprobanteService.generarPdfComprobante(idComprobante)
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                let filename = `Comprobante-${idComprobante}.pdf`;
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
                setError(`Error al descargar PDF para ${idComprobante}: ` + (err.response?.data || err.message));
            })
            .finally(() => {
                setLoadingPdfId(null);
            });
    };

    // Enviar comprobante PDF por email usando el endpoint desacoplado
    const handleEnviarEmail = (idComprobante) => {
        setLoadingEmailCodigo(idComprobante);
        ComprobanteService.enviarComprobantePdfPorEmail(idComprobante)
            .then(() => {
                alert(`Comprobante enviado por email correctamente para ${idComprobante}`);
            })
            .catch(err => {
                setError(`Error al enviar email para ${idComprobante}: ` + (err.response?.data || err.message));
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
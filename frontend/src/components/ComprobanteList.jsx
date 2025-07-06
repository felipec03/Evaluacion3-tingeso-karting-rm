import React, { useState, useEffect } from 'react';
import ComprobanteService from '../services/ComprobanteService';
import { Table, Alert, Spinner, Button, Modal, Toast, ToastContainer } from 'react-bootstrap';

const ComprobanteList = () => {
    const [comprobantes, setComprobantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [loadingPdfId, setLoadingPdfId] = useState(null);
    const [loadingEmailCodigo, setLoadingEmailCodigo] = useState(null);

    // State for confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', body: '', onConfirm: () => {} });

    // State for toast notifications
    const [showToast, setShowToast] = useState(false);
    const [toastConfig, setToastConfig] = useState({ message: '', variant: 'success' });

    useEffect(() => {
        fetchComprobantes();
    }, []);

    const showToastNotification = (message, variant = 'success') => {
        setToastConfig({ message, variant });
        setShowToast(true);
    };

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

    // --- PDF Download Logic ---
    const handleDownloadPdf = (reservaId) => {
        setModalConfig({
            title: 'Confirmar Descarga de PDF',
            body: `¿Está seguro de que desea descargar el PDF para la reserva ${reservaId}?`,
            onConfirm: () => executeDownloadPdf(reservaId)
        });
        setShowConfirmModal(true);
    };

    const executeDownloadPdf = (reservaId) => {
        setLoadingPdfId(reservaId);
        ComprobanteService.generarPdfComprobante(reservaId)
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Comprobante-Reserva-${reservaId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                showToastNotification(`La descarga del PDF para la reserva ${reservaId} ha comenzado.`);
            })
            .catch(err => {
                const errorMessage = `Error al descargar PDF: ` + (err.response?.data || err.message);
                showToastNotification(errorMessage, 'danger');
            })
            .finally(() => {
                setLoadingPdfId(null);
            });
    };

    // --- Email Sending Logic ---
    const handleEnviarEmail = (reservaId) => {
        setModalConfig({
            title: 'Confirmar Envío de Email',
            body: `¿Está seguro de que desea enviar el comprobante por email para la reserva ${reservaId}?`,
            onConfirm: () => executeEnviarEmail(reservaId)
        });
        setShowConfirmModal(true);
    };

    const executeEnviarEmail = (reservaId) => {
        setLoadingEmailCodigo(reservaId);
        ComprobanteService.enviarComprobantePdfPorEmail(reservaId)
            .then(() => {
                showToastNotification(`Comprobante para reserva ${reservaId} enviado por email correctamente.`);
            })
            .catch(err => {
                const errorMessage = `Error al enviar email: ` + (err.response?.data || err.message);
                showToastNotification(errorMessage, 'danger');
            })
            .finally(() => {
                setLoadingEmailCodigo(null);
            });
    };

    const handleCloseModal = () => setShowConfirmModal(false);
    const handleConfirmModal = () => {
        modalConfig.onConfirm();
        handleCloseModal();
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
        <>
            <div className="card shadow-sm">
                <div className="card-header bg-light py-3">
                    <h4 className="mb-0">Listado de Comprobantes Emitidos</h4>
                </div>
                <div className="card-body">
                    <Table striped bordered hover responsive className="align-middle">
                        {/* ... Table Head ... */}
                        <tbody>
                            {comprobantes.map(c => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.codigo}</td>
                                    <td>{c.reservaId}</td>
                                    <td>{c.nombreUsuario}</td>
                                    <td>{c.email}</td>
                                    <td>{new Date(c.fechaEmision).toLocaleString()}</td>
                                    <td className="text-end">{Number(c.total).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
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
                                            onClick={() => handleDownloadPdf(c.reservaId)}
                                            disabled={loadingPdfId === c.reservaId}
                                        >
                                            {loadingPdfId === c.reservaId ? <Spinner as="span" animation="border" size="sm" /> : 'PDF'}
                                        </Button>
                                        <Button 
                                            variant="outline-info" 
                                            size="sm"
                                            onClick={() => handleEnviarEmail(c.reservaId)}
                                            disabled={loadingEmailCodigo === c.reservaId}
                                        >
                                            {loadingEmailCodigo === c.reservaId ? <Spinner as="span" animation="border" size="sm" /> : 'Email'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modalConfig.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalConfig.body}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleConfirmModal}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Toast Notifications */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1055 }}>
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide bg={toastConfig.variant}>
                    <Toast.Header>
                        <strong className="me-auto">Notificación</strong>
                    </Toast.Header>
                    <Toast.Body className={toastConfig.variant === 'danger' ? 'text-white' : ''}>{toastConfig.message}</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
};

export default ComprobanteList;
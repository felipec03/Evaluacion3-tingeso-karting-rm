import React, { useState, useEffect, useCallback } from 'react';
import { Table, Alert, Spinner, Card, Button, Form, Col, Row, Modal, Badge } from 'react-bootstrap'; // Added Badge here

import TarifasService from '../services/TarifasService';
import DescuentoPersonaService from '../services/DescuentoPersonaService';
import TarifaDiaEspecialService from '../services/TarifaDiaEspecialService';

const NuestraOferta = () => {
    const [tarifasState, setTarifasState] = useState({ data: [], loading: true, error: null });
    const [descuentosState, setDescuentosState] = useState({ data: [], loading: true, error: null });
    const [especialesState, setEspecialesState] = useState({ data: [], loading: true, error: null });

    // State for new Tarifa General form
    const [showNewTarifaModal, setShowNewTarifaModal] = useState(false);
    const [newTarifa, setNewTarifa] = useState({
        descripcion: '',
        tipoReserva: 1, // Default to 1
        precioBasePorPersona: '',
        activa: true
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // State for confirmation modal for delete
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [tarifaToDelete, setTarifaToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);


    const fetchTarifasGenerales = useCallback(() => {
        setTarifasState(prevState => ({ ...prevState, loading: true, error: null }));
        TarifasService.getAllTarifas() // Fetch all, including inactive ones for management
            .then(response => {
                setTarifasState({ data: response.data, loading: false, error: null });
            })
            .catch(error => {
                console.error("Error fetching tarifas:", error);
                setTarifasState({ data: [], loading: false, error: 'Error al cargar las tarifas generales.' });
            });
    }, []);

    useEffect(() => {
        fetchTarifasGenerales();

        DescuentoPersonaService.getAllDescuentosPersona()
            .then(response => {
                const activeDescuentos = response.data.filter(descuento => descuento.activo !== false);
                setDescuentosState({ data: activeDescuentos, loading: false, error: null });
            })
            .catch(error => {
                console.error("Error fetching descuentos persona:", error);
                setDescuentosState({ data: [], loading: false, error: 'Error al cargar los descuentos por persona.' });
            });

        TarifaDiaEspecialService.getAllTarifasDiaEspecial()
            .then(response => {
                setEspecialesState({ data: response.data, loading: false, error: null });
            })
            .catch(error => {
                console.error("Error fetching tarifas dias especiales:", error);
                setEspecialesState({ data: [], loading: false, error: 'Error al cargar las tarifas de días especiales.' });
            });
    }, [fetchTarifasGenerales]);

    const handleNewTarifaChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewTarifa(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'tipoReserva' || name === 'precioBasePorPersona' ? Number(value) : value)
        }));
    };

    const handleCreateTarifaSubmit = (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        setFormSuccess('');

        if (!newTarifa.descripcion.trim()) {
            setFormError('La descripción es obligatoria.');
            setFormLoading(false);
            return;
        }
        if (newTarifa.tipoReserva < 1 || newTarifa.tipoReserva > 3) {
            setFormError('El tipo de reserva debe ser 1, 2 o 3.');
            setFormLoading(false);
            return;
        }
        if (newTarifa.precioBasePorPersona <= 0) {
            setFormError('El precio base debe ser un número positivo.');
            setFormLoading(false);
            return;
        }
        
        const tarifaToCreate = {
            ...newTarifa,
            // Ensure precioBasePorPersona is a double
            precioBasePorPersona: parseFloat(newTarifa.precioBasePorPersona) 
        };


        TarifasService.createTarifa(tarifaToCreate)
            .then(() => {
                setFormSuccess('Tarifa general creada exitosamente.');
                fetchTarifasGenerales(); // Refresh the list
                setShowNewTarifaModal(false); // Close modal
                setNewTarifa({ descripcion: '', tipoReserva: 1, precioBasePorPersona: '', activa: true }); // Reset form
            })
            .catch(error => {
                console.error("Error creating tarifa:", error);
                setFormError(error.response?.data?.message || error.response?.data || 'Error al crear la tarifa.');
            })
            .finally(() => {
                setFormLoading(false);
            });
    };

    const openDeleteConfirmModal = (tarifa) => {
        setTarifaToDelete(tarifa);
        setShowDeleteConfirmModal(true);
    };

    const closeDeleteConfirmModal = () => {
        setTarifaToDelete(null);
        setShowDeleteConfirmModal(false);
    };

    const handleDeleteTarifa = () => {
        if (!tarifaToDelete) return;
        setDeleteLoading(true);
        setFormError(''); // Clear previous errors
        setFormSuccess('');

        TarifasService.deleteTarifa(tarifaToDelete.id)
            .then(() => {
                setFormSuccess(`Tarifa "${tarifaToDelete.descripcion}" eliminada exitosamente.`);
                fetchTarifasGenerales(); // Refresh the list
                closeDeleteConfirmModal();
            })
            .catch(error => {
                console.error("Error deleting tarifa:", error);
                setFormError(error.response?.data?.message || error.response?.data || 'Error al eliminar la tarifa.');
            })
            .finally(() => {
                setDeleteLoading(false);
            });
    };


    const renderTable = (title, state, columns, dataKeyMap, actions = null) => {
        return (
            <Card className="mb-4 shadow-sm">
                <Card.Header as="h4" className="d-flex justify-content-between align-items-center bg-light">
                    {title}
                    {title === "Tarifas Generales" && (
                        <Button variant="primary" size="sm" onClick={() => setShowNewTarifaModal(true)}>
                            <i className="bi bi-plus-circle-fill me-2"></i>Agregar Tarifa
                        </Button>
                    )}
                </Card.Header>
                <Card.Body>
                    {state.loading && (
                        <div className="text-center py-3">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </Spinner>
                            <p className="mt-2 mb-0">Cargando {title.toLowerCase()}...</p>
                        </div>
                    )}
                    {state.error && <Alert variant="danger">{state.error}</Alert>}
                    {!state.loading && !state.error && state.data.length === 0 && (
                        <Alert variant="info">No hay {title.toLowerCase()} disponibles en este momento.</Alert>
                    )}
                    {!state.loading && !state.error && state.data.length > 0 && (
                        <Table striped bordered hover responsive className="align-middle">
                            <thead className="table-dark">
                                <tr>
                                    {columns.map(col => <th key={col}>{col}</th>)}
                                    {actions && <th>Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {state.data.map((item, index) => (
                                    <tr key={item.id || index}>
                                        {dataKeyMap.map(keyItem => (
                                            <td key={keyItem.key}>
                                                {typeof keyItem.render === 'function' ? keyItem.render(item) : item[keyItem.key]}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td>
                                                {actions.map(action => (
                                                    <Button
                                                        key={action.label}
                                                        variant={action.variant}
                                                        size="sm"
                                                        onClick={() => action.onClick(item)}
                                                        className="me-2"
                                                        disabled={action.label === 'Eliminar' && deleteLoading && tarifaToDelete?.id === item.id}
                                                    >
                                                        {action.label === 'Eliminar' && deleteLoading && tarifaToDelete?.id === item.id 
                                                            ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                            : <i className={`bi ${action.icon} me-1`}></i>}
                                                        {action.label}
                                                    </Button>
                                                ))}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        );
    };

    const tarifasGeneralesActions = [
        // { label: "Editar", variant: "outline-warning", onClick: (item) => console.log("Edit:", item), icon: "bi-pencil-square" }, // Placeholder for Edit
        { label: "Eliminar", variant: "outline-danger", onClick: (item) => openDeleteConfirmModal(item), icon: "bi-trash3-fill" }
    ];

    const tarifasColumns = ["ID", "Descripción", "Tipo Reserva", "Precio Base por Persona", "Activa"];
    const tarifasDataKeyMap = [
        { key: "id" },
        { key: "descripcion" },
        { key: "tipoReserva" },
        { key: "precioBasePorPersona", render: (item) => `$${Number(item.precioBasePorPersona).toLocaleString('es-CL')}` },
        { key: "activa", render: (item) => <Badge bg={item.activa ? 'success' : 'danger'}>{item.activa ? 'Sí' : 'No'}</Badge> }
    ];

    const descuentosColumns = ["ID", "Rango de Personas", "Porcentaje Descuento", "Activo"];
    const descuentosDataKeyMap = [
        { key: "id" },
        { key: "rangoPersonas", render: (item) => `${item.personasMin} - ${item.personasMax}` },
        { key: "porcentajeDescuento", render: (item) => `${item.porcentajeDescuento}%` },
        { key: "activo", render: (item) => <Badge bg={item.activo ? 'success' : 'danger'}>{item.activo ? 'Sí' : 'No'}</Badge> }
    ];

    const especialesColumns = ["Descripción", "Fecha", "Recargo (%)", "Es Feriado"];
    const especialesDataKeyMap = [
        { key: "descripcion" },
        { key: "fecha", render: (item) => item.fecha ? new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-CL', { timeZone: 'UTC' }) : 'Fin de semana' },
        { key: "recargoPorcentaje", render: (item) => `${item.recargoPorcentaje}%` },
        { key: "esFeriado", render: (item) => <Badge bg={item.esFeriado ? 'info' : 'secondary'}>{item.esFeriado ? 'Sí' : 'No'}</Badge> }
    ];

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-center">Nuestras Ofertas y Tarifas</h2>

            {formSuccess && <Alert variant="success" onClose={() => setFormSuccess('')} dismissible>{formSuccess}</Alert>}
            {formError && <Alert variant="danger" onClose={() => setFormError('')} dismissible>{formError}</Alert>}
            
            {renderTable("Tarifas Generales", tarifasState, tarifasColumns, tarifasDataKeyMap, tarifasGeneralesActions)}
            {renderTable("Descuentos por Persona", descuentosState, descuentosColumns, descuentosDataKeyMap)}
            {renderTable("Tarifas de Días Especiales", especialesState, especialesColumns, especialesDataKeyMap)}

            {/* Modal for New Tarifa General */}
            <Modal show={showNewTarifaModal} onHide={() => setShowNewTarifaModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Agregar Nueva Tarifa General</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateTarifaSubmit}>
                    <Modal.Body>
                        {formError && <Alert variant="danger">{formError}</Alert>}
                        <Form.Group as={Row} className="mb-3" controlId="formDescripcion">
                            <Form.Label column sm="4">Descripción:</Form.Label>
                            <Col sm="8">
                                <Form.Control
                                    type="text"
                                    name="descripcion"
                                    value={newTarifa.descripcion}
                                    onChange={handleNewTarifaChange}
                                    required
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="formTipoReserva">
                            <Form.Label column sm="4">Tipo Reserva (1-3):</Form.Label>
                            <Col sm="8">
                                <Form.Control
                                    type="number"
                                    name="tipoReserva"
                                    value={newTarifa.tipoReserva}
                                    onChange={handleNewTarifaChange}
                                    min="1"
                                    max="3"
                                    required
                                />
                                <Form.Text muted>1: Normal, 2: Extendida, 3: Premium</Form.Text>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="formPrecio">
                            <Form.Label column sm="4">Precio Base ($):</Form.Label>
                            <Col sm="8">
                                <Form.Control
                                    type="number"
                                    name="precioBasePorPersona"
                                    value={newTarifa.precioBasePorPersona}
                                    onChange={handleNewTarifaChange}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="formActiva">
                            <Form.Label column sm="4">Activa:</Form.Label>
                            <Col sm="8">
                                <Form.Check
                                    type="switch"
                                    name="activa"
                                    checked={newTarifa.activa}
                                    onChange={handleNewTarifaChange}
                                />
                            </Col>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowNewTarifaModal(false)} disabled={formLoading}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={formLoading}>
                            {formLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Crear Tarifa'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal for Delete Confirmation */}
            <Modal show={showDeleteConfirmModal} onHide={closeDeleteConfirmModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {tarifaToDelete && `¿Está seguro que desea eliminar la tarifa "${tarifaToDelete.descripcion}" (ID: ${tarifaToDelete.id})?`}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeDeleteConfirmModal} disabled={deleteLoading}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDeleteTarifa} disabled={deleteLoading}>
                        {deleteLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Eliminar'}
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default NuestraOferta;
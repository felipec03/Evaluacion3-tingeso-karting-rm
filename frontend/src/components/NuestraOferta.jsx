import React, { useState, useEffect } from 'react';
import { Table, Alert, Spinner, Card, Badge } from 'react-bootstrap';

import DescuentoPersonaService from '../services/DescuentoPersonaService';
import TarifaDiaEspecialService from '../services/TarifaDiaEspecialService';

const NuestraOferta = () => {
    const [descuentosState, setDescuentosState] = useState({ data: [], loading: true, error: null });
    const [especialesState, setEspecialesState] = useState({ data: [], loading: true, error: null });

    useEffect(() => {
        DescuentoPersonaService.getAllDescuentosPersona()
            .then(response => {
                setDescuentosState({ data: response.data, loading: false, error: null });
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
    }, []);

    const renderTable = (title, state, columns, dataKeyMap) => {
        return (
            <Card className="mb-4 shadow-sm">
                <Card.Header as="h4" className="bg-light">
                    {title}
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
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        );
    };

    const descuentosColumns = ["ID", "Rango de Personas", "Porcentaje Descuento"];
    const descuentosDataKeyMap = [
        { key: "id" },
        { key: "rangoPersonas", render: (item) => `${item.minPersonas} - ${item.maxPersonas}` },
        { key: "porcentajeDescuento", render: (item) => `${item.porcentajeDescuento}%` },
    ];

    const especialesColumns = ["Descripción", "Fecha", "Aumento (%)"];
    const especialesDataKeyMap = [
        { key: "descripcion" },
        { key: "fecha", render: (item) => item.fecha ? new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-CL', { timeZone: 'UTC' }) : 'N/A' },
        { key: "porcentajeAumento", render: (item) => `${item.porcentajeAumento}%` },
    ];

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-center">Nuestras Ofertas y Tarifas</h2>
            
            {renderTable("Descuentos por Persona", descuentosState, descuentosColumns, descuentosDataKeyMap)}
            {renderTable("Tarifas de Días Especiales", especialesState, especialesColumns, especialesDataKeyMap)}
        </div>
    );
};

export default NuestraOferta;
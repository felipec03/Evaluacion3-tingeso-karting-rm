import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// Remove ComprobanteForm import if it's no longer directly used here for generation
// import ComprobanteForm from './ComprobanteForm'; 
import ComprobanteList from './ComprobanteList'; // Import the new list component
import ReporteService from '../services/ReporteService';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ReportView = () => {
    const [searchParams] = useSearchParams();
    // Default activeTab can be 'listaComprobantes' or 'reports'
    const [activeTab, setActiveTab] = useState('listaComprobantes'); 
    // reservaId might not be needed here anymore if ComprobanteForm is separate
    // const [reservaId, setReservaId] = useState(''); 

    const [reportData, setReportData] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);
    const [reportError, setReportError] = useState(null);
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    const [fechaInicio, setFechaInicio] = useState(`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`);
    const [fechaFin, setFechaFin] = useState(new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]);


    const [currentReportType, setCurrentReportType] = useState('');

    useEffect(() => {
        // This logic might change or be removed if 'reservaId' is handled elsewhere
        const urlReservaId = searchParams.get('reservaId');
        if (urlReservaId) {
            // setReservaId(urlReservaId); 
            // If you want to default to a specific tab when reservaId is present, adjust here.
            // For now, we'll let the default activeTab take precedence or handle it in ComprobanteForm if it's still used.
            // setActiveTab('listaComprobantes'); // Or whatever tab is relevant
        }
    }, [searchParams]);

    const handleFetchReport = async (reportType) => {
        // ... (existing code for fetching reports)
        setLoadingReport(true);
        setReportError(null);
        setReportData(null);
        setCurrentReportType(reportType);

        try {
            const startDate = new Date(fechaInicio);
            const endDate = new Date(fechaFin);

            const anioInicio = startDate.getFullYear();
            const mesInicio = startDate.getMonth() + 1; // JS months are 0-indexed
            const anioFin = endDate.getFullYear();
            const mesFin = endDate.getMonth() + 1;

            if (endDate < startDate) {
                setReportError("La fecha de fin no puede ser anterior a la fecha de inicio.");
                setLoadingReport(false);
                return;
            }

            let response;
            if (reportType === 'ingresos-por-tarifa') {
                response = await ReporteService.getIngresosPorTarifa(anioInicio, mesInicio, anioFin, mesFin);
            } else if (reportType === 'ingresos-por-numero-personas') {
                response = await ReporteService.getIngresosPorNumeroPersonas(anioInicio, mesInicio, anioFin, mesFin);
            }
            setReportData(response.data); 
        } catch (error) {
            console.error(`Error fetching ${reportType}:`, error);
            let errorMessage = "No se pudo cargar el reporte. ";
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage += error.response.data;
                } else if (error.response.data.message) {
                    errorMessage += error.response.data.message;
                } else {
                     errorMessage += "Verifique los parámetros e intente nuevamente.";
                }
            } else {
                errorMessage += "Error de red o el servidor no responde.";
            }
            setReportError(errorMessage);
        } finally {
            setLoadingReport(false);
        }
    };

    const getChartData = () => {
        // ... (existing code for chart data)
        if (!reportData || !reportData.filasReporte || reportData.filasReporte.length === 0) {
            return { labels: [], datasets: [] };
        }

        const labels = reportData.mesesColumnas || []; 

        const datasets = reportData.filasReporte.map((fila, index) => {
            const colors = [
                'rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
                'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
                'rgba(255, 99, 71, 0.6)', 'rgba(60, 179, 113, 0.6)'
            ];
            return {
                label: fila.categoria,
                data: labels.map(mes => fila.ingresosPorMes[mes] || 0),
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length].replace('0.6', '1'),
                borderWidth: 1,
            };
        });

        return {
            labels: labels,
            datasets: datasets,
        };
    };
    
    const chartTitleText = () => {
        // ... (existing code for chart title)
        if (!currentReportType) return "Reporte de Ingresos";
        const type = currentReportType === 'ingresos-por-tarifa' ? "Ingresos por Tarifa" : "Ingresos por Número de Personas";
        return `${type}`;
    }

    const chartOptions = {
        // ... (existing chart options)
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: chartTitleText(),
                font: {
                    size: 18,
                    weight: 'bold',
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Ingresos (CLP)'
                },
                ticks: {
                    callback: function(value) {
                        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value);
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Meses'
                }
            }
        },
    };
    
    const renderReportTable = () => {
        // ... (existing code for rendering report table)
        if (!reportData || !reportData.filasReporte || reportData.filasReporte.length === 0) {
            return <p className="text-muted text-center mt-3">No hay datos para mostrar para el rango seleccionado.</p>;
        }

        const { mesesColumnas, filasReporte, totalesPorMes, granTotal } = reportData;

        return (
            <div className="table-responsive mt-4">
                <table className="table table-striped table-hover table-bordered caption-top">
                    <caption>{chartTitleText()}</caption>
                    <thead className="table-dark">
                        <tr>
                            <th scope="col">Categoría</th>
                            {mesesColumnas.map(month => <th scope="col" key={month} className="text-end">{month}</th>)}
                            <th scope="col" className="text-end table-info">Total Categoría</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filasReporte.map((fila, index) => (
                            <tr key={index}>
                                <td className="fw-medium">{fila.categoria}</td>
                                {mesesColumnas.map(month => (
                                    <td key={`${fila.categoria}-${month}`} className="text-end">
                                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(fila.ingresosPorMes[month] || 0)}
                                    </td>
                                ))}
                                <td className="text-end fw-bold table-info">
                                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(fila.totalIngresosCategoria || 0)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="table-group-divider">
                        <tr className="table-light fw-bold">
                            <td>Total Mensual</td>
                            {mesesColumnas.map(month => (
                                <td key={`total-${month}`} className="text-end">
                                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalesPorMes[month] || 0)}
                                </td>
                            ))}
                            <td className="text-end table-success fw-bolder">
                                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(granTotal || 0)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    };


    return (
        <div className="container-fluid mt-4 mb-5">
            <h2 className="mb-4">Documentos y Reportes</h2> {/* Updated title */}
            
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'listaComprobantes' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('listaComprobantes'); setReportData(null); setReportError(null); setCurrentReportType('');}}
                    >
                        Listado de Comprobantes
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('reports'); /* Keep reportData if switching back and forth, or clear if preferred */ }}
                    >
                        Reportes Estadísticos
                    </button>
                </li>
            </ul>
            
            {activeTab === 'listaComprobantes' ? (
                <ComprobanteList /> // Render the new list component
            ) : (
                // ... (existing code for rendering reports tab)
                <div className="card shadow-sm">
                    <div className="card-header bg-light py-3">
                        <h4 className="mb-0">Filtros para Reportes Estadísticos</h4>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 align-items-end mb-4 p-3 border rounded bg-white">
                            <div className="col-md-3 col-sm-6">
                                <label htmlFor="fechaInicio" className="form-label">Fecha Inicio:</label>
                                <input 
                                    type="date" 
                                    id="fechaInicio"
                                    className="form-control" 
                                    value={fechaInicio} 
                                    onChange={(e) => setFechaInicio(e.target.value)} 
                                />
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label htmlFor="fechaFin" className="form-label">Fecha Fin:</label>
                                <input 
                                    type="date" 
                                    id="fechaFin"
                                    className="form-control" 
                                    value={fechaFin} 
                                    onChange={(e) => setFechaFin(e.target.value)} 
                                />
                            </div>
                            <div className="col-md-3 col-sm-6 mt-3 mt-md-0">
                                <button 
                                    className="btn btn-primary w-100" 
                                    onClick={() => handleFetchReport('ingresos-por-tarifa')}
                                    disabled={loadingReport}
                                >
                                    {loadingReport && currentReportType === 'ingresos-por-tarifa' ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : null}
                                    Ingresos por Tarifa
                                </button>
                            </div>
                            <div className="col-md-3 col-sm-6 mt-3 mt-md-0">
                                <button 
                                    className="btn btn-success w-100" 
                                    onClick={() => handleFetchReport('ingresos-por-numero-personas')}
                                    disabled={loadingReport}
                                >
                                    {loadingReport && currentReportType === 'ingresos-por-numero-personas' ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : null}
                                    Ingresos por Nº Personas
                                </button>
                            </div>
                        </div>

                        {loadingReport && (
                            <div className="d-flex flex-column align-items-center my-5">
                                <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                                    <span className="visually-hidden">Cargando reporte...</span>
                                </div>
                                <p className="ms-2 mt-2 fs-5">Cargando reporte, por favor espere...</p>
                            </div>
                        )}
                        {reportError && <div className="alert alert-danger mt-3">{reportError}</div>}
                        
                        {reportData && !loadingReport && !reportError && (
                            <>
                                <div className="mt-4 p-3 border rounded bg-white shadow-sm">
                                    <h5 className="mb-3">{chartTitleText()} - Gráfico</h5>
                                    <div style={{ height: '450px', width: '100%' }}>
                                        <Bar data={getChartData()} options={chartOptions} />
                                    </div>
                                </div>
                                <div className="mt-4 p-3 border rounded bg-white shadow-sm">
                                     <h5 className="mb-3">{chartTitleText()} - Tabla de Datos</h5>
                                    {renderReportTable()}
                                </div>
                            </>
                        )}
                         {!reportData && !loadingReport && !reportError && currentReportType && (
                             <div className="alert alert-warning mt-3 text-center">
                                No se encontraron datos para el reporte de '{currentReportType.replace(/-/g, ' ')}' con los filtros seleccionados.
                            </div>
                         )}
                         {!reportData && !loadingReport && !reportError && !currentReportType && (
                            <div className="alert alert-info mt-3 text-center">
                                Seleccione un rango de fechas y un tipo de reporte para visualizar los datos.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportView;
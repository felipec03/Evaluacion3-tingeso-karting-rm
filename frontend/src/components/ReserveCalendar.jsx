import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ReserveService from '../services/ReserveService';
import axios from 'axios';

moment.locale('es');
const localizer = momentLocalizer(moment);

const generateSampleEvents = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  
  return [
    {
      id: 901,
      title: 'juan.perez - 10:00-12:00',
      start: new Date(year, month, day, 10, 0),
      end: new Date(year, month, day, 12, 0),
      resource: {
        emailarrendatario: 'juan.perez@example.com',
        tiporeserva: 1,
        numeroPersonas: 4,
        tipoReservaLabel: 'Normal (10 vueltas)'
      }
    },
    {
      id: 902,
      title: 'maria.gomez - 14:00-16:00',
      start: new Date(year, month, day, 14, 0),
      end: new Date(year, month, day, 16, 0),
      resource: {
        emailarrendatario: 'maria.gomez@example.com',
        tiporeserva: 2,
        numeroPersonas: 6,
        tipoReservaLabel: 'Extendida (15 vueltas)'
      }
    },
    {
      id: 903,
      title: 'carlos.ruiz - 09:00-11:00',
      start: new Date(year, month, day + 1, 9, 0),
      end: new Date(year, month, day + 1, 11, 0),
      resource: {
        emailarrendatario: 'carlos.ruiz@example.com',
        tiporeserva: 3,
        numeroPersonas: 8,
        tipoReservaLabel: 'Premium (20 vueltas)'
      }
    }
  ];
};

const ReserveCalendar = () => {
    const [reserves, setReserves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [backendStatus, setBackendStatus] = useState({ connected: false, checked: false });
    const [usingSampleData, setUsingSampleData] = useState(false);

    useEffect(() => {
        checkBackendAndFetchData();
    }, []);

    const checkBackendAndFetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = '/api'; // Use relative path since we have NGINX proxy
            await axios.get(`${apiUrl}/reservas`, { timeout: 5000 });
            setBackendStatus({ connected: true, checked: true });
            fetchReservations();
        } catch (error) {
            console.error('Error de conexión con el backend:', error);
            setBackendStatus({ connected: false, checked: true });
            setError('No se pudo conectar al servidor backend. Usando datos de muestra.');
            setReserves(generateSampleEvents());
            setUsingSampleData(true);
            setLoading(false);
        }
    };

    const fetchReservations = async () => {
        try {
            const response = await ReserveService.getAllReserves();
            console.log('Respuesta API Reservas:', response.data);
            
            if (!response.data || response.data.length === 0) {
                console.warn('No se devolvieron datos de reservas de la API');
                const sampleEvents = generateSampleEvents();
                setReserves(sampleEvents);
                setUsingSampleData(true);
                setLoading(false);
                return;
            }
            
            const calendarEvents = response.data.map(reserve => {
                console.log('Procesando reserva:', reserve);
                
                const startStr = String(reserve.inicio_reserva);
                const endStr = String(reserve.fin_reserva);
                
                let startTime, endTime;
                try {
                    startTime = moment(startStr);
                    if (!startTime.isValid()) {
                        console.error(`Fecha de inicio inválida: ${startStr}`);
                        startTime = moment(startStr, "YYYY-MM-DDTHH:mm:ss");
                    }
                } catch (e) {
                    console.error(`Error parseando fecha de inicio: ${startStr}`, e);
                    startTime = moment(startStr, "YYYY-MM-DDTHH:mm:ss");
                }

                try {
                    endTime = moment(endStr);
                    if (!endTime.isValid()) {
                        console.error(`Fecha de fin inválida: ${endStr}`);
                        endTime = moment().add(1, 'hour');
                    }
                } catch (e) {
                    console.error(`Error parseando fecha de fin: ${endStr}`, e);
                    endTime = moment().add(1, 'hour');
                }
                
                const tipoReserva = typeof reserve.tiporeserva === 'string' 
                    ? parseInt(reserve.tiporeserva, 10) 
                    : reserve.tiporeserva;
                
                const tipoReservaLabel = getTipoReservaLabel(tipoReserva);
                
                const userName = reserve.emailarrendatario ? reserve.emailarrendatario.split('@')[0] : 'Cliente';
                
                const event = {
                    id: reserve.id,
                    title: `${userName} - ${startTime.format('HH:mm')}-${endTime.format('HH:mm')}`,
                    start: startTime.toDate(),
                    end: endTime.toDate(),
                    resource: {
                        emailarrendatario: reserve.emailarrendatario,
                        tiporeserva: tipoReserva,
                        numeroPersonas: reserve.numero_personas,
                        tipoReservaLabel: tipoReservaLabel
                    }
                };
                
                return event;
            });
            
            console.log('Eventos de calendario finales:', calendarEvents);
            setUsingSampleData(false);
            setReserves(calendarEvents);
            setLoading(false);
            
        } catch (error) {
            console.error('Error obteniendo datos del calendario:', error);
            setError(`Error al cargar datos: ${error.message}`);
            
            setReserves(generateSampleEvents());
            setUsingSampleData(true);
            setLoading(false);
        }
    };

    const getTipoReservaLabel = (tipo) => {
        switch(tipo) {
            case 1: return "Normal (10 vueltas)";
            case 2: return "Extendida (15 vueltas)";
            case 3: return "Premium (20 vueltas)";
            default: return "Desconocido";
        }
    };

    const eventStyleGetter = (event) => {
        let backgroundColor = '#3174ad';
        let borderColor = '#2a5f8f';
        
        switch(event.resource?.tiporeserva) {
            case 1: 
                backgroundColor = '#3174ad';
                borderColor = '#2a5f8f';
                break;
            case 2: 
                backgroundColor = '#5cb85c';
                borderColor = '#4cae4c';
                break;
            case 3: 
                backgroundColor = '#f0ad4e';
                borderColor = '#eea236';
                break;
            default:
                break;
        }

        return {
            style: {
                backgroundColor,
                borderColor,
                borderRadius: '5px',
                opacity: 0.9,
                color: 'white',
                border: '1px solid ' + borderColor,
                display: 'block',
                fontWeight: 'bold',
                fontSize: '0.9em',
                padding: '2px 5px'
            }
        };
    };

    const EventComponent = ({ event }) => {
        return (
            <div>
                <strong>{event.title}</strong>
                <div style={{ fontSize: '0.85em', marginTop: '2px' }}>
                    {event.resource?.numeroPersonas} personas 
                    <br />
                    {event.resource?.tipoReservaLabel}
                </div>
            </div>
        );
    };

    return (
        <div className="container mt-4">
            <h2>Calendario de Reservas</h2>
            
            {backendStatus.checked && !backendStatus.connected && (
                <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    No se pudo conectar al servidor backend. Mostrando datos de ejemplo.
                </div>
            )}
            
            {usingSampleData && backendStatus.connected && (
                <div className="alert alert-info">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    No hay reservas disponibles. Mostrando datos de ejemplo.
                </div>
            )}
            
            {error && !usingSampleData && (
                <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-circle-fill me-2"></i>
                    {error}
                </div>
            )}
            
            {loading ? (
                <div className="d-flex justify-content-center mt-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : (
                <div style={{ height: '80vh' }}>
                    <div className="mb-3">
                        <div className="d-flex flex-wrap">
                            <div className="me-4 mb-2">
                                <span className="badge bg-primary me-1">&nbsp;</span>
                                Normal (10 vueltas)
                            </div>
                            <div className="me-4 mb-2">
                                <span className="badge bg-success me-1">&nbsp;</span>
                                Extendida (15 vueltas)
                            </div>
                            <div className="me-4 mb-2">
                                <span className="badge bg-warning me-1">&nbsp;</span>
                                Premium (20 vueltas)
                            </div>
                        </div>
                    </div>
                    
                    <Calendar
                        localizer={localizer}
                        events={reserves}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 'calc(100% - 50px)' }}
                        views={['month', 'week', 'day', 'agenda']}
                        defaultView="week"
                        eventPropGetter={eventStyleGetter}
                        components={{
                            event: EventComponent
                        }}
                        messages={{
                            next: "Siguiente",
                            previous: "Anterior",
                            today: "Hoy",
                            month: "Mes",
                            week: "Semana",
                            day: "Día",
                            agenda: "Agenda",
                            date: "Fecha",
                            time: "Hora",
                            event: "Evento",
                            allDay: "Todo el día",
                            showMore: total => `+ Ver ${total} más`
                        }}
                        culture="es"
                    />
                    
                    {backendStatus.checked && (
                        <div className="mt-3">
                            <button 
                                className="btn btn-sm btn-outline-primary" 
                                onClick={checkBackendAndFetchData}
                            >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Reconectar y actualizar datos
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReserveCalendar;
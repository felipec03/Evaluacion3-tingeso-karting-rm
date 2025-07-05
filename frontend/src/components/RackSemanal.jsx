import React, { useState, useEffect, useCallback } from 'react';
import RackSemanalService from '../services/RackSemanalService';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import './RackSemanal.css';
import { getDurationForType, getDescriptionForType } from '../utils/reservationUtils';

moment.locale('es');
const localizer = momentLocalizer(moment);

const minCalendarTime = new Date();
minCalendarTime.setHours(10, 0, 0, 0);

const maxCalendarTime = new Date();
maxCalendarTime.setHours(22, 0, 0, 0);

const calendarFormats = {
  timeGutterFormat: 'HH:mm',
  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
    localizer.format(start, 'HH:mm', culture) + ' - ' + localizer.format(end, 'HH:mm', culture),
  agendaTimeFormat: 'HH:mm',
  agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
    localizer.format(start, 'HH:mm', culture) + ' - ' + localizer.format(end, 'HH:mm', culture),
};

const RackSemanal = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(moment());
  const [currentView, setCurrentView] = useState('week');

  const navigate = useNavigate();

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservaDetail, setSelectedReservaDetail] = useState(null);

  const [showOutOfHoursModal, setShowOutOfHoursModal] = useState(false);
  const [outOfHoursMessage, setOutOfHoursMessage] = useState({ title: '', body: [] });

  const formatTipoReservaText = (tipoReserva) => {
    return getDescriptionForType(tipoReserva);
  };

  const getEstadoReserva = (reserva) => {
    const now = new Date();
    const inicioDate = new Date(reserva.inicio_reserva);
    const finDate = new Date(reserva.fin_reserva);
    
    if (finDate < now) return 'COMPLETADA';
    if (inicioDate <= now && finDate >= now) return 'EN_CURSO';
    return 'CONFIRMADA';
  };

  useEffect(() => {
    const fetchReservasData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await RackSemanalService.obtenerTodasLasReservas();
        
        if (Array.isArray(response.data)) {
          const calendarEvents = response.data.map(reserva => {
            const startTime = moment(reserva.inicio_reserva);
            const endTime = moment(reserva.fin_reserva);
            
            let titleParts = [];
            // Use email as name since we don't have user names in the response
            const displayName = reserva.emailarrendatario ? reserva.emailarrendatario.split('@')[0] : 'Cliente';
            titleParts.push(displayName);
            titleParts.push(`(${reserva.numero_personas || 0}p)`);
            titleParts.push(formatTipoReservaText(reserva.tiporeserva).split(' ')[0]);
            if (reserva.cantidadcumple && reserva.cantidadcumple > 0) {
              titleParts.push(`(🎂 ${reserva.cantidadcumple})`);
            }
            
            // Calculate correct duration based on reservation type
            let duracionMinutos = getDurationForType(reserva.tiporeserva);
            
            return {
              id: reserva.id,
              title: titleParts.join(' '),
              start: startTime.toDate(),
              end: endTime.toDate(),
              allDay: false,
              resource: {
                ...reserva,
                estadoReserva: getEstadoReserva(reserva),
                montoFinal: reserva.totalConIva,
                // Map backend fields to expected frontend fields
                fechaHora: reserva.inicio_reserva,
                duracionMinutos: duracionMinutos, // Use correct duration based on type
                emailUsuario: reserva.emailarrendatario,
                nombreUsuario: reserva.emailarrendatario ? reserva.emailarrendatario.split('@')[0] : 'N/A',
                cantidadPersonas: reserva.numero_personas,
                tipoReserva: reserva.tiporeserva
              }, 
            };
          });
          setReservas(calendarEvents);
        } else {
          setError('Error: Los datos recibidos del servidor no tienen el formato esperado.');
          setReservas([]); 
        }
      } catch (err) {
        let errorMessage = 'Error al cargar las reservas. Por favor, intente nuevamente.';
        if (err.response && err.response.data) {
            errorMessage = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || JSON.stringify(err.response.data));
        } else if (err.message) {
            errorMessage = err.message;
        }
        setError(errorMessage);
        setReservas([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservasData();
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedReservaDetail(event.resource);
    setShowDetailModal(true);
  }, []);

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedReservaDetail(null);
  };

  const handleCloseOutOfHoursModal = () => {
    setShowOutOfHoursModal(false);
  };

  const handleSelectSlot = useCallback(({ start }) => {
    const selectedMoment = moment(start);
    const dayOfWeek = selectedMoment.day(); 
    const hour = selectedMoment.hour();
    const minute = selectedMoment.minute(); 

    const isWeekendOrFestive = dayOfWeek === 0 || dayOfWeek === 6; 
    let isValidSlot = false;
    
    const alertTitle = "Horario No Disponible";
    const alertBodyLines = [
        "La hora seleccionada está fuera de nuestro horario de atención.",
        "",
        "Nuestros Horarios:",
        "Lunes a Viernes: 14:00 - 22:00",
        "Sábados, Domingos y Festivos: 10:00 - 22:00"
    ];

    if (isWeekendOrFestive) { 
      if (hour >= 10 && (hour < 22 || (hour === 22 && minute === 0))) { 
        isValidSlot = true;
      }
    } else { 
      if (hour >= 14 && (hour < 22 || (hour === 22 && minute === 0))) { 
        isValidSlot = true;
      }
    }
    
    if (selectedMoment.hour() < moment(minCalendarTime).hour() || selectedMoment.hour() >= moment(maxCalendarTime).hour()) {
        isValidSlot = false;
    }

    if (!((isWeekendOrFestive && selectedMoment.hour() >= 10) || (!isWeekendOrFestive && selectedMoment.hour() >= 14)) || selectedMoment.hour() >= 22 ) {
        isValidSlot = false; 
    }

    if (isValidSlot) {
      const selectedDate = selectedMoment.format('YYYY-MM-DD');
      const selectedTime = selectedMoment.format('HH:mm');
      navigate(`/agregar-reserva?date=${selectedDate}&time=${selectedTime}`);
    } else {
      setOutOfHoursMessage({ title: alertTitle, body: alertBodyLines });
      setShowOutOfHoursModal(true);
    }
  }, [navigate]);

  const handleNavigate = (newDate) => {
    setCurrentDate(moment(newDate));
  };

  const handleViewChange = (newView) => {
    setCurrentView(newView);
  };

  const dayPropGetter = useCallback((date) => {
    if (moment(date).isSame(moment(), 'day')) {
      return {
        className: 'current-day',
        style: {
          backgroundColor: '#e3f2fd',
        },
      };
    }
    return {};
  }, []);

  const slotPropGetter = useCallback((date) => {
    const hour = moment(date).hour();
    const dayOfWeek = moment(date).day();
    const isWeekendOrFestive = dayOfWeek === 0 || dayOfWeek === 6;
    
    let isBusinessHour = false;
    if (isWeekendOrFestive) {
      isBusinessHour = hour >= 10 && hour < 22;
    } else {
      isBusinessHour = hour >= 14 && hour < 22;
    }
    
    if (!isBusinessHour) {
      return {
        style: {
          backgroundColor: '#f5f5f5',
          color: '#999',
        },
      };
    }
    return {};
  }, []);

  if (loading) {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center m-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <span className="ms-3 fs-5">Cargando reservas...</span>
        </div>
    );
  }
  
  if (error) {
    return (
        <Alert variant="danger" className="text-center m-4">
            <h4>Error al Cargar Reservas</h4>
            <p>{error}</p>
        </Alert>
    );
  }
  
  return (
    <div className="container-fluid mt-4 rack-semanal-container">
      <h2 className="text-center mb-4">Rack Semanal de Reservas</h2>
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={reservas}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['month', 'week', 'day', 'agenda']}
          view={currentView} 
          onView={handleViewChange} 
          date={currentDate.toDate()} 
          onNavigate={handleNavigate} 
          selectable 
          onSelectSlot={handleSelectSlot} 
          onSelectEvent={handleSelectEvent}
          dayPropGetter={dayPropGetter} 
          slotPropGetter={slotPropGetter} 
          min={minCalendarTime} 
          max={maxCalendarTime} 
          formats={calendarFormats}
          step={30}
          timeslots={1}
          messages={{
            allDay: 'Todo el día',
            previous: '‹',
            next: '›',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Reserva',
            noEventsInRange: 'No hay reservas en este rango.',
            showMore: total => `+ Ver ${total} más`,
          }}
          eventPropGetter={(event) => {
            let backgroundColor = '#3174ad';
            switch(event.resource?.tipoReserva) {
              case 1: backgroundColor = '#3174ad'; break;
              case 2: backgroundColor = '#5cb85c'; break;
              case 3: backgroundColor = '#f0ad4e'; break;
              default: break;
            }
            return { style: { backgroundColor } };
          }}
          components={{
            toolbar: (toolbar) => {
              const goToBack = () => toolbar.onNavigate('PREV');
              const goToNext = () => toolbar.onNavigate('NEXT');
              const goToToday = () => toolbar.onNavigate('TODAY');
              const goToView = (view) => toolbar.onView(view);

              return (
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="btn-group" role="group">
                    <Button variant="outline-primary" size="sm" onClick={goToBack}>‹ Anterior</Button>
                    <Button variant="outline-primary" size="sm" onClick={goToToday}>Hoy</Button>
                    <Button variant="outline-primary" size="sm" onClick={goToNext}>Siguiente ›</Button>
                  </span>
                  <h4 className="mb-0">{toolbar.label}</h4>
                  <span className="btn-group" role="group">
                    {toolbar.views.includes('month') && <Button variant={toolbar.view === 'month' ? 'primary' : 'outline-primary'} size="sm" onClick={() => goToView('month')}>Mes</Button>}
                    {toolbar.views.includes('week') && <Button variant={toolbar.view === 'week' ? 'primary' : 'outline-primary'} size="sm" onClick={() => goToView('week')}>Semana</Button>}
                    {toolbar.views.includes('day') && <Button variant={toolbar.view === 'day' ? 'primary' : 'outline-primary'} size="sm" onClick={() => goToView('day')}>Día</Button>}
                    {toolbar.views.includes('agenda') && <Button variant={toolbar.view === 'agenda' ? 'primary' : 'outline-primary'} size="sm" onClick={() => goToView('agenda')}>Agenda</Button>}
                  </span>
                </div>
              );
            }
          }}
        />
      </div>

      {/* Out of Hours Modal */}
      <Modal show={showOutOfHoursModal} onHide={handleCloseOutOfHoursModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{outOfHoursMessage.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {outOfHoursMessage.body.map((line, index) => (
            <p key={index} className={line === '' ? 'mb-1' : 'mb-0'}>
              {line || '\u00A0'}
            </p>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseOutOfHoursModal}>
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reservation Detail Modal */}
      {selectedReservaDetail && (
        <Modal show={showDetailModal} onHide={handleCloseDetailModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              Detalles de la Reserva <Badge bg="primary">ID: {selectedReservaDetail.id}</Badge>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup variant="flush">
              <ListGroup.Item><strong>Cliente:</strong> {selectedReservaDetail.nombreUsuario || 'N/A'}</ListGroup.Item>
              <ListGroup.Item><strong>Email:</strong> {selectedReservaDetail.emailUsuario || 'N/A'}</ListGroup.Item>
              <ListGroup.Item><strong>Fecha y Hora Inicio:</strong> {moment(selectedReservaDetail.inicio_reserva).format('DD/MM/YYYY HH:mm')}</ListGroup.Item>
              <ListGroup.Item><strong>Fecha y Hora Fin:</strong> {moment(selectedReservaDetail.fin_reserva).format('DD/MM/YYYY HH:mm')}</ListGroup.Item>
              <ListGroup.Item><strong>Duración:</strong> {selectedReservaDetail.duracion} horas</ListGroup.Item>
              <ListGroup.Item><strong>Tipo de Reserva:</strong> {formatTipoReservaText(selectedReservaDetail.tipoReserva)}</ListGroup.Item>
              <ListGroup.Item><strong>Cantidad de Personas:</strong> {selectedReservaDetail.cantidadPersonas}</ListGroup.Item>
              {selectedReservaDetail.cantidadcumple > 0 && (
                <ListGroup.Item><strong>Personas en Cumpleaños:</strong> {selectedReservaDetail.cantidadcumple}</ListGroup.Item>
              )}
              <ListGroup.Item>
                <strong>Estado:</strong> <Badge bg={selectedReservaDetail.estadoReserva === 'CONFIRMADA' ? 'success' : 'warning'}>{selectedReservaDetail.estadoReserva}</Badge>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Monto Final:</strong> {selectedReservaDetail.montoFinal != null ? `$${Number(selectedReservaDetail.montoFinal).toLocaleString('es-CL')}` : 'N/A'}
              </ListGroup.Item>
            </ListGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseDetailModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default RackSemanal;
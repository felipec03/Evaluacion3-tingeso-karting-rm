import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReserveList.css';
import ReserveService from '../services/ReserveService';
import { getShortDescriptionForType } from '../utils/reservationUtils';

const ReserveList = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        setLoading(true);
        const response = await ReserveService.getAllReserves();
        console.log('Respuesta API (Reservas):', response.data);
        
        const data = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || [];
        
        setReservas(data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar reservas:', err);
        setError('Error al cargar las reservas. Por favor intente nuevamente.');
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  const formatDateTime = (inicioReserva) => {
    if (!inicioReserva) return 'N/A';
    const date = new Date(inicioReserva);
    return date.toLocaleString('es-ES', { 
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const getEstadoReserva = (reserva) => {
    // Since backend doesn't provide estado, we can derive it from dates
    const now = new Date();
    const inicioDate = new Date(reserva.inicio_reserva);
    const finDate = new Date(reserva.fin_reserva);
    
    if (finDate < now) return 'COMPLETADA';
    if (inicioDate <= now && finDate >= now) return 'EN_CURSO';
    return 'CONFIRMADA';
  };

  const handleDelete = (idReserva) => {
    if (window.confirm('¿Está seguro que desea eliminar esta reserva?')) {
      console.log(`Intentando eliminar reserva con ID: ${idReserva}`);
      ReserveService.deleteReserve(idReserva)
        .then(() => {
          console.log(`Reserva ${idReserva} eliminada exitosamente`);
          setReservas(prevReservas => prevReservas.filter(reserva => reserva.id !== idReserva));
        })
        .catch(err => {
          console.error('Error al eliminar reserva:', err);
          setError('Error al eliminar la reserva. Por favor intente nuevamente.');
        });
    }
  };

  const navigateToAddReserve = () => {
    navigate('/agregar-reserva');
  };

  if (loading) return <div className="loading">Cargando reservas...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="reservas-container">
      <h2>Lista de Reservas</h2>
      <div className="add-reserve-btn-container">
        <button className="add-reserve-btn" onClick={navigateToAddReserve}>
          Agregar Nueva Reserva
        </button>
      </div>
      
      {reservas.length === 0 ? (
        <div className="no-data">No hay reservas disponibles</div>
      ) : (
        <table className="reservas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha y Hora Inicio</th>
              <th>Fecha y Hora Fin</th>
              <th>Tipo</th>
              <th>Personas</th>
              <th>Email Cliente</th>
              <th>Cumpleaños</th>
              <th>Monto Final</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id}>
                <td>{reserva.id}</td>
                <td>{formatDateTime(reserva.inicio_reserva)}</td>
                <td>{formatDateTime(reserva.fin_reserva)}</td>
                <td>{getShortDescriptionForType(reserva.tiporeserva)}</td>
                <td>{reserva.numero_personas}</td>
                <td>{reserva.emailarrendatario || 'N/A'}</td>
                <td>{reserva.cantidadcumple > 0 ? `${reserva.cantidadcumple} personas` : 'No'}</td>
                <td>${reserva.totalConIva?.toLocaleString('es-CL') || 'N/A'}</td>
                <td>{getEstadoReserva(reserva)}</td>
                <td>
                  <button 
                    className="btn btn-delete" 
                    onClick={() => handleDelete(reserva.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReserveList;
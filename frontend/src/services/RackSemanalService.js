import axios from 'axios';

const API_URL = '/api/reservas'; 

class RackSemanalService {
    obtenerTodasLasReservas() {
        return axios.get(`${API_URL}/`);
    }

    // Removed: inicializarRack, actualizarRack, obtenerMatrizRack, obtenerDetallesReserva
    // as these functionalities are no longer part of the simplified ms-racksemanal backend.
}

export default new RackSemanalService();
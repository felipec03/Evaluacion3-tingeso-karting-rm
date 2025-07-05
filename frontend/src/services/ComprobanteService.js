import axios from 'axios';

const API_BASE_URL = '/api/comprobantes'; 

class ComprobanteService {
    getAllComprobantes() {
        return axios.get(`${API_BASE_URL}/`);
    }
    
    getComprobanteById(id) {
        // Backend endpoint is /api/comprobantes/{id}
        return axios.get(`${API_BASE_URL}/${id}`);
    }
    
    // Updated to match backend: POST /api/comprobantes/generar/{reservaId}
    generarComprobante(reservaId, metodoPago) {
        return axios.post(`${API_BASE_URL}/generar/${reservaId}`, null, {
            params: {
                metodoPago: metodoPago
            }
        });
    }
    
    // Updated to match backend: GET /api/comprobantes/download/reserva/{reservaId}
    downloadComprobantePdfByReservaId(reservaId) {
        return axios.get(`${API_BASE_URL}/download/reserva/${reservaId}`, { 
            responseType: 'blob',
            headers: {
                'Accept': 'application/pdf',
            }
        });
    }
    
    getComprobantesByEmail(email) {
        // Assuming backend has an endpoint like /api/comprobantes/email/{email}
        // The provided ComprobanteController.java does not show this endpoint.
        // If it exists, this is fine. Otherwise, it needs to be added or this method removed.
        return axios.get(`${API_BASE_URL}/email/${email}`);
    }

    enviarEmailComprobante(codigoComprobante) {
        return axios.post(`${API_BASE_URL}/${codigoComprobante}/enviar-email`);
    }
}

export default new ComprobanteService();
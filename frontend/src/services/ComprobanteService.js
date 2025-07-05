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
    
    // POST /api/comprobantes/generar/{reservaId}
    generarComprobante(reservaId, metodoPago) {
        return axios.post(`${API_BASE_URL}/generar/${reservaId}`, null, {
            params: { metodoPago }
        });
    }

    // GET /api/comprobantes/generar-pdf/{reservaId}
    generarPdfComprobante(reservaId) {
        return axios.get(`${API_BASE_URL}/generar-pdf/${reservaId}`, {
            responseType: 'blob',
            headers: { 'Accept': 'application/pdf' }
        });
    }

    // POST /api/comprobantes/enviar-pdf-email/{reservaId}
    enviarComprobantePdfPorEmail(reservaId) {
        return axios.post(`${API_BASE_URL}/enviar-pdf-email/${reservaId}`);
    }
    
    getComprobantesByEmail(email) {
        // Assuming backend has an endpoint like /api/comprobantes/email/{email}
        // The provided ComprobanteController.java does not show this endpoint.
        // If it exists, this is fine. Otherwise, it needs to be added or this method removed.
        return axios.get(`${API_BASE_URL}/email/${email}`);
    }

    // Deprecated: Use enviarComprobantePdfPorEmail(reservaId) instead
    // enviarEmailComprobante(codigoComprobante) { ... }
}

export default new ComprobanteService();
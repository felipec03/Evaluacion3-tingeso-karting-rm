import axios from 'axios';

// Use a consistent base URL that matches your backend
const API_URL = '/api/reservas';

class ReserveService {
    getAllReserves() {
        return axios.get(`${API_URL}/`);
    }

    getReserveById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    createReserve(reserveData) {
        return axios.post(`${API_URL}/`, reserveData);
    }

    updateReserve(id, reserveData) {
        return axios.put(`${API_URL}/${id}`, reserveData);
    }

    deleteReserve(id) {
        return axios.delete(`${API_URL}/${id}`);
    }

    getReservesByEmail(email) {
        return axios.get(`${API_URL}/email/${email}`);
    }

    getReservesByDate(date) {
        return axios.get(`${API_URL}/fecha/${date}`);
    }
    
    calculateTotal(reserveData) {
        return axios.post(`${API_URL}/calcular-total`, reserveData);
    }
}

export default new ReserveService();
import axios from 'axios';

const API_URL = '/api/tarifas';

class TarifasService {
    getAllTarifas(soloActivas = false) {
        return axios.get(`${API_URL}/`, { params: { soloActivas } });
    }

    getTarifaById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    createTarifa(tarifaData) {
        return axios.post(`${API_URL}/`, tarifaData);
    }

    updateTarifa(id, tarifaData) {
        return axios.put(`${API_URL}/${id}`, tarifaData);
    }

    deleteTarifa(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
}

export default new TarifasService();
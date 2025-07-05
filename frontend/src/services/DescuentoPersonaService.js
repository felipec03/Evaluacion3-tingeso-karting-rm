import axios from 'axios';

const API_URL = '/api/descuento-persona';

class DescuentoPersonaService {
    getAllDescuentosPersona() {
        return axios.get(`${API_URL}/`);
    }
}

export default new DescuentoPersonaService();
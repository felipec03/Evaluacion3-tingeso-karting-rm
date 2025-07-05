import axios from 'axios';

const API_URL = '/api/descuentos-persona';

class DescuentoPersonaService{
    getAllDescuentosPersona() {
        return axios.get(`${API_URL}/`);
    };
}

export default new DescuentoPersonaService();
import axios from 'axios';

const API_URL = '/api/tarifas-dias-especiales';

class TarifaDiaEspecialService {
    getAllTarifasDiaEspecial() {
        return axios.get(`${API_URL}/`);
    }
}

export default new TarifaDiaEspecialService();
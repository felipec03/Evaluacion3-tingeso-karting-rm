import axios from 'axios';

const REPORTE_API_BASE_URL = '/api/reportes';

class ReporteService {
    // Expects anioInicio, mesInicio, anioFin, mesFin as integers
    getIngresosPorTarifa(anioInicio, mesInicio, anioFin, mesFin) {
        return axios.get(`${REPORTE_API_BASE_URL}/ingresos-por-tarifa`, {
            params: {
                anioInicio,
                mesInicio,
                anioFin,
                mesFin
            }
        });
    }

    // Expects anioInicio, mesInicio, anioFin, mesFin as integers
    getIngresosPorNumeroPersonas(anioInicio, mesInicio, anioFin, mesFin) {
        return axios.get(`${REPORTE_API_BASE_URL}/ingresos-por-personas`, {
            params: {
                anioInicio,
                mesInicio,
                anioFin,
                mesFin
            }
        });
    }
}

export default new ReporteService();
import axios from "axios";

const payrollBackendServer = import.meta.env.VITE_PAYROLL_BACKEND_SERVER;
const payrollBackendPort = import.meta.env.VITE_PAYROLL_BACKEND_PORT;

console.log('Backend server:', payrollBackendServer);
console.log('Backend port:', payrollBackendPort);

export default axios.create({
    baseURL: `http://${payrollBackendServer}:${payrollBackendPort}`,
    headers: {
        'Content-Type': 'application/json'
    }
});
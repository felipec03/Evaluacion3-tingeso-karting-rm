import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Header from './components/Header';
import HomePage from './components/HomePage';
import ReserveList from './components/ReserveList';
import ReserveForm from './components/ReserveForm';
// Removed DriverList and KartList imports as they are no longer linked
// import DriverList from './components/DriverList';
// import KartList from './components/KartList';
import ReportView from './components/ReportView';
import RackSemanal from './components/RackSemanal';
import ComprobanteForm from './components/ComprobanteForm'; // Import ComprobanteForm
import NuestraOferta from './components/NuestraOferta'; // Import NuestraOferta component


function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="container-fluid mt-4 mb-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reservas" element={<ReserveList />} />
            <Route path="/rack-semanal" element={<RackSemanal />} />
            <Route path="/agregar-reserva" element={<ReserveForm />} />
            {/* Removed Pilotos and Karts routes */}
            {/* <Route path="/pilotos" element={<DriverList />} /> */}
            {/* <Route path="/karts" element={<KartList />} /> */}
            <Route path="/reportes" element={<ReportView />} />
            {/* Add Comprobantes route */}
            <Route path="/comprobantes" element={<ComprobanteForm />} />
            <Route path="/nuestra-oferta" element={<NuestraOferta />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
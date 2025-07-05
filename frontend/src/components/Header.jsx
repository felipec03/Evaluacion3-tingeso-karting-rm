import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => {
    // Helper function to apply classes for NavLink active state
    const getNavLinkClass = ({ isActive }) => {
        return isActive ? "nav-link active fw-bold" : "nav-link";
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
            <div className="container-fluid"> {/* Changed from container to container-fluid */}
                <NavLink className="navbar-brand fs-4" to="/">
                    Karting RM
                </NavLink>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <NavLink className={getNavLinkClass} to="/">
                                Inicio
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className={getNavLinkClass} to="/nuestra-oferta">
                                Nuestra Oferta
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className={getNavLinkClass} to="/reservas">
                                Reservas
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className={getNavLinkClass} to="/rack-semanal">
                                Rack Semanal
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className={getNavLinkClass} to="/agregar-reserva">
                                Nueva Reserva
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className={getNavLinkClass} to="/comprobantes">
                                Comprobantes
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className={getNavLinkClass} to="/reportes">
                                Reportes
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; 

const HomePage = () => {
    // Replace these with your actual image paths
    const heroImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/%D0%9A%D0%BB%D0%B0%D1%81_60.jpg/1280px-%D0%9A%D0%BB%D0%B0%D1%81_60.jpg'; // Example: /images/karting-hero.jpg
    const tarifasImage = 'https://www.reactev.com/sites/default/files/field/image/Blog_Reactev_queespricing.jpg'; // Example: /images/tarifas-card.jpg
    const rackImage = 'https://media.istockphoto.com/id/1409304190/photo/embroidered-red-pins-on-a-calendar-event-planner-calendar-clock-to-set-timetable-organize.jpg?s=612x612&w=0&k=20&c=A4XVCLw143nplxUzqppgNjjLH0gijPzZ4jtjZK-f75w=';     // Example: /images/rack-card.jpg
    const reportesImage = 'https://t4.ftcdn.net/jpg/01/27/54/19/360_F_127541998_6DX7gVaCPr1n6tgewWlwKwdMldYvjNmg.jpg'; // Example: /images/reportes-card.jpg

    // Fallback if images are not found (using placehold.co)
    const placeholderUrl = (text, width = 800, height = 400) => `https://placehold.co/${width}x${height}/6c757d/FFFFFF/png?text=${encodeURIComponent(text)}&font=lato`;


    return (
        <>
            {/* Hero Section */}
            <div 
                className="hero-section text-center text-white py-5 mb-5 shadow-lg" 
                style={{ 
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroImage})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    minHeight: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                onError={(e) => { e.target.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${placeholderUrl('Karting Action!', 1200, 600)})`; }}
            >
                <div className="container">
                    <h1 className="display-2 fw-bolder mb-3">¡Bienvenido a Karting RM!</h1>
                    <p className="lead fs-3 mb-4">
                        Su solución integral para la gestión de pistas de karting.
                    </p>
                    <hr className="my-4 mx-auto" style={{ width: '30%', borderColor: 'rgba(255,255,255,0.3)' }} />
                    <p className="fs-5 mb-5">Explore nuestras funcionalidades y optimice su operación.</p>
                    <div>
                        <Link to="/rack-semanal" className="btn btn-primary btn-lg px-4 me-sm-3 mb-3 mb-sm-0">
                            <i className="bi bi-calendar-check-fill me-2"></i>Ver Disponibilidad
                        </Link>
                        <Link to="/nuestra-oferta" className="btn btn-outline-light btn-lg px-4">
                            <i className="bi bi-tags-fill me-2"></i>Nuestras Tarifas
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container py-5">
                <div className="text-center mb-5">
                    <h2 className="fw-bold display-5">Optimice su Pista de Karting</h2>
                    <p className="lead text-muted">Herramientas diseñadas para la máxima eficiencia y satisfacción del cliente.</p>
                </div>
                
                <div className="row g-4 gx-lg-5">
                    <div className="col-lg-4 col-md-6 mb-4">
                        <div className="card h-100 shadow border-0 rounded-4 overflow-hidden hover-lift-img">
                            <img 
                                src={tarifasImage} 
                                className="card-img-top" 
                                alt="Tarifas y Ofertas" 
                                style={{ height: '220px', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = placeholderUrl('Tarifas', 600, 400); }}
                            />
                            <div className="card-body p-4 d-flex flex-column">
                                <h5 className="card-title fs-4 fw-semibold mb-3">Tarifas y Ofertas</h5>
                                <p className="card-text text-muted small flex-grow-1">
                                    Gestione precios, descuentos y promociones especiales de forma sencilla y flexible.
                                </p>
                                <Link to="/nuestra-oferta" className="btn btn-primary mt-3 stretched-link">
                                    <i className="bi bi-arrow-right-circle me-2"></i>Ver Tarifas
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-4 col-md-6 mb-4">
                        <div className="card h-100 shadow border-0 rounded-4 overflow-hidden hover-lift-img">
                            <img 
                                src={rackImage} 
                                className="card-img-top" 
                                alt="Rack Semanal" 
                                style={{ height: '220px', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = placeholderUrl('Rack Semanal', 600, 400); }}
                            />
                            <div className="card-body p-4 d-flex flex-column">
                                <h5 className="card-title fs-4 fw-semibold mb-3">Rack Semanal</h5>
                                <p className="card-text text-muted small flex-grow-1">
                                    Visualice la disponibilidad y gestione las reservas en tiempo real con una interfaz intuitiva.
                                </p>
                                <Link to="/rack-semanal" className="btn btn-success mt-3 stretched-link">
                                    <i className="bi bi-eye-fill me-2"></i>Ver Rack
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-4 col-md-6 mb-4">
                        <div className="card h-100 shadow border-0 rounded-4 overflow-hidden hover-lift-img">
                            <img 
                                src={reportesImage} 
                                className="card-img-top" 
                                alt="Documentos y Reportes" 
                                style={{ height: '220px', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = placeholderUrl('Reportes', 600, 400); }}
                            />
                            <div className="card-body p-4 d-flex flex-column">
                                <h5 className="card-title fs-4 fw-semibold mb-3">Documentos y Reportes</h5>
                                <p className="card-text text-muted small flex-grow-1">
                                    Genere comprobantes y analice el rendimiento con reportes detallados para tomar decisiones informadas.
                                </p>
                                <Link to="/reportes" className="btn btn-warning mt-3 stretched-link">
                                    <i className="bi bi-bar-chart-line-fill me-2"></i>Ver Reportes
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomePage;
import React, { useState, useEffect } from 'react';
import KartService from '../services/KartService';

const KartList = () => {
    const [karts, setKarts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchKarts();
    }, []);

    const fetchKarts = () => {
        KartService.getAllKarts()
            .then(response => {
                setKarts(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching karts:', error);
                setLoading(false);
            });
    };

    return (
        <div className="container mt-4">
            <h2>Karts List</h2>
            
            {loading ? (
                <p>Loading karts...</p>
            ) : (
                <table className="table table-bordered table-striped">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Kart Number</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {karts.map(kart => (
                            <tr key={kart.id}>
                                <td>{kart.id}</td>
                                <td>{kart.codificacion}</td>
                                <td>{kart.estado}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default KartList;
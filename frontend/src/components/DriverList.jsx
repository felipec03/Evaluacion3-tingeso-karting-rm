import React, { useState, useEffect } from 'react';
import DriverService from '../services/DriverService';

const DriverList = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = () => {
        DriverService.getAllDrivers()
            .then(response => {
                setDrivers(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching drivers:', error);
                setLoading(false);
            });
    };

    return (
        <div className="container mt-4">
            <h2>Drivers List</h2>
            
            {loading ? (
                <p>Loading drivers...</p>
            ) : (
                <table className="table table-bordered table-striped">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers.map(driver => (
                            <tr key={driver.id}>
                                <td>{driver.id}</td>
                                <td>{driver.name}</td>
                                <td>{driver.email}</td>
                                <td>{driver.phone}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default DriverList;
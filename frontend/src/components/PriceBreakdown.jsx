import React from 'react';
import './PriceBreakdown.css';

const PriceBreakdown = ({ priceData, loading }) => {
  if (loading) {
    return (
      <div className="price-breakdown">
        <div className="price-loading">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Calculando...</span>
          </div>
          <span className="ms-2">Calculando precio...</span>
        </div>
      </div>
    );
  }

  if (!priceData) {
    return null;
  }

  // Determine which discount was applied (the largest one)
  const discounts = [
    { type: 'Grupo', value: priceData.descuentoGrupo },
    { type: 'Cliente Frecuente', value: priceData.descuentoFrecuente },
    { type: 'Cumpleaños', value: priceData.descuentoCumple }
  ];
  
  const appliedDiscount = discounts.reduce((max, discount) => 
    discount.value > max.value ? discount : max, { type: 'Ninguno', value: 0 });

  return (
    <div className="price-breakdown">
      <h4>Detalles del Precio</h4>
      
      <div className="price-row">
        <span className="price-label">Tarifa Base:</span>
        <span className="price-value">${priceData.precioBase?.toLocaleString('es-CL')}</span>
      </div>
      
      {appliedDiscount.value > 0 && (
        <div className="price-row discount">
          <span className="price-label">Descuento ({appliedDiscount.type}):</span>
          <span className="price-value">-${appliedDiscount.value.toLocaleString('es-CL')}</span>
        </div>
      )}
      
      <div className="price-row subtotal">
        <span className="price-label">Subtotal:</span>
        <span className="price-value">${priceData.totalSinIva?.toLocaleString('es-CL')}</span>
      </div>
      
      <div className="price-row">
        <span className="price-label">IVA (19%):</span>
        <span className="price-value">${priceData.iva?.toLocaleString('es-CL')}</span>
      </div>
      
      <div className="price-row total">
        <span className="price-label">Total a Pagar:</span>
        <span className="price-value">${priceData.totalConIva?.toLocaleString('es-CL')}</span>
      </div>

      <div className="price-notes">
        {appliedDiscount.value > 0 && (
          <div className="discount-note">
            <small>* Se ha aplicado el descuento más favorable para usted</small>
          </div>
        )}
        {priceData.descuentoGrupo > 0 && priceData.descuentoGrupo < appliedDiscount.value && (
          <div className="other-discount">
            <small>Descuento por grupo disponible: ${priceData.descuentoGrupo.toLocaleString('es-CL')}</small>
          </div>
        )}
        {priceData.descuentoFrecuente > 0 && priceData.descuentoFrecuente < appliedDiscount.value && (
          <div className="other-discount">
            <small>Descuento por cliente frecuente disponible: ${priceData.descuentoFrecuente.toLocaleString('es-CL')}</small>
          </div>
        )}
        {priceData.descuentoCumple > 0 && priceData.descuentoCumple < appliedDiscount.value && (
          <div className="other-discount">
            <small>Descuento por cumpleaños disponible: ${priceData.descuentoCumple.toLocaleString('es-CL')}</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceBreakdown;
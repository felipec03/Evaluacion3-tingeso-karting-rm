# MEJORAS EN EL SISTEMA DE RESERVAS - DURACIÓN AUTOMÁTICA

## Problema Solucionado

Al crear reservas, la hora de fin no se calculaba automáticamente según el tipo de reserva. Se ha implementado un sistema consistente donde:

- **10 Vueltas (Tipo 1)**: 30 minutos de duración
- **15 Vueltas (Tipo 2)**: 35 minutos de duración  
- **20 Vueltas (Tipo 3)**: 40 minutos de duración

## Cambios Implementados

### 1. Backend - ReservaService.java

- **`crearReserva()`**: Ahora valida que la duración de la reserva coincida exactamente con el tipo seleccionado (±5 minutos de tolerancia)
- **`updateReserva()`**: También valida la duración al actualizar reservas
- **Cálculo de precios**: Mantiene los precios correctos por persona según el tipo de reserva

### 2. Frontend - Sistema de Utilidades

Creado `src/utils/reservationUtils.js` con funciones centralizadas:

- **`getDurationForType(tipo)`**: Obtiene la duración correcta para cada tipo
- **`calculateEndTime(startTime, tipo)`**: Calcula la hora de fin automáticamente
- **`validateDuration(startTime, endTime, tipo)`**: Valida que la duración sea correcta
- **`getDescriptionForType(tipo)`**: Descripciones consistentes para mostrar

### 3. Frontend - ReserveForm.jsx

- **Cálculo automático**: La hora de fin se calcula automáticamente al seleccionar tipo de reserva o cambiar hora de inicio
- **Validación mejorada**: Verifica que la duración coincida antes de enviar al backend
- **Campo de solo lectura**: La hora de fin no se puede editar manualmente

### 4. Frontend - Componentes de Visualización

- **ReserveList.jsx**: Muestra descripciones consistentes con duración incluida
- **RackSemanal.jsx**: Calcula duraciones correctas para el calendario visual
- **Consistencia**: Todos los componentes usan las mismas utilidades

### 5. API - Nuevos Endpoints

- **`POST /api/reservas/calcular-total`**: Permite calcular precios sin crear la reserva

## Validaciones Implementadas

### Frontend
1. Verificación de duración antes del envío
2. Recálculo automático al cambiar tipo de reserva
3. Validación de consistencia en tiempo real

### Backend
1. Validación estricta de duración en `crearReserva()`
2. Validación en `updateReserva()` para mantener consistencia
3. Tolerancia de ±5 minutos para flexibilidad en casos especiales

## Beneficios

1. **Experiencia de usuario mejorada**: No necesita calcular manualmente la hora de fin
2. **Consistencia**: Todos los componentes muestran la misma información
3. **Prevención de errores**: Validaciones tanto en frontend como backend
4. **Mantenibilidad**: Código centralizado en utilidades reutilizables

## Cómo Usar

1. Al crear una reserva, selecciona el tipo (10, 15 o 20 vueltas)
2. Selecciona la hora de inicio
3. La hora de fin se calcula automáticamente
4. El sistema valida que todo sea consistente antes de guardar

## Scripts de Despliegue

- **`build-and-restart.ps1`**: Script PowerShell para reconstruir y reiniciar servicios
- **`build-and-restart.sh`**: Script Bash para sistemas Unix/Linux

## Tipos de Reserva

| Tipo | Vueltas | Duración | Precio Base por Persona |
|------|---------|----------|-------------------------|
| 1    | 10      | 30 min   | $25.000                 |
| 2    | 15      | 35 min   | $23.000                 |
| 3    | 20      | 40 min   | $17.250                 |

*Los precios pueden tener recargos por fines de semana (15%) y feriados (25%), más descuentos por grupo, frecuencia y cumpleaños.*

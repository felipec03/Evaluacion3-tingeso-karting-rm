// Utility functions for reservation durations
export const RESERVATION_TYPES = {
  1: { vueltas: 10, duracion: 30, nombre: 'Normal' },
  2: { vueltas: 15, duracion: 35, nombre: 'Extendida' },
  3: { vueltas: 20, duracion: 40, nombre: 'Premium' }
};

export const getDurationForType = (tipo) => {
  return RESERVATION_TYPES[tipo]?.duracion || 30;
};

export const getDescriptionForType = (tipo) => {
  const typeInfo = RESERVATION_TYPES[tipo];
  if (!typeInfo) return `Tipo ${tipo}`;
  return `${typeInfo.nombre} (${typeInfo.vueltas} vueltas - ${typeInfo.duracion} min)`;
};

export const getShortDescriptionForType = (tipo) => {
  const typeInfo = RESERVATION_TYPES[tipo];
  if (!typeInfo) return `Tipo ${tipo}`;
  return `${typeInfo.vueltas} vueltas (${typeInfo.duracion} min)`;
};

export const calculateEndTime = (startTime, tipo) => {
  if (!startTime) return '';
  
  const [hours, minutes] = startTime.split(':');
  const start = new Date();
  start.setHours(parseInt(hours), parseInt(minutes), 0);
  
  const duration = getDurationForType(tipo);
  const end = new Date(start.getTime() + (duration * 60 * 1000));
  
  const endHours = end.getHours().toString().padStart(2, '0');
  const endMinutes = end.getMinutes().toString().padStart(2, '0');
  
  return `${endHours}:${endMinutes}`;
};

export const validateDuration = (startTime, endTime, tipo) => {
  if (!startTime || !endTime) return false;
  
  const [startHours, startMinutes] = startTime.split(':');
  const [endHours, endMinutes] = endTime.split(':');
  
  const start = new Date();
  start.setHours(parseInt(startHours), parseInt(startMinutes), 0);
  
  const end = new Date();
  end.setHours(parseInt(endHours), parseInt(endMinutes), 0);
  
  const actualMinutes = (end.getTime() - start.getTime()) / (60 * 1000);
  const expectedMinutes = getDurationForType(tipo);
  
  // Allow tolerance of ±1 minute
  return Math.abs(actualMinutes - expectedMinutes) <= 1;
};

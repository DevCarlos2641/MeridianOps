export function formatDateEs(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return 'Fecha inválida';
  let fecha: Date;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    // Separar manualmente para evitar errores de zona horaria
    const [year, month, day] = date.split('-').map(Number);
    fecha = new Date(year, month - 1, day); // month - 1 porque en JS los meses van de 0 a 11
  } else {
    fecha = new Date(date);
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return new Intl.DateTimeFormat('es-MX', options || defaultOptions).format(fecha);
}


export function getPriority(value: number) {
  if (value == 0) return "Baja";
  if (value == 1) return "Media";
  else return "Alta";
}

export function getStatus(value: number) {
  if (value == 0) return "Pendiente";
  if (value == 1) return "En proceso";
  if (value == 2) return "Por recibir";
  if (value == 3) return "Finalizado";
  else return "Cancelado";
}

export function getStatusVo(value: number) {
  if (value == 0) return "En proceso";
  if (value == 1) return "Comprado";
  if (value == 2) return "Finalizado";
  if (value == 3) return "Cancelado";
  else return "Cancelado";
}

export function quitarTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
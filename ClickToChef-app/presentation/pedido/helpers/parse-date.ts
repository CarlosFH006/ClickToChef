const MESES: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

// Parsea el formato que devuelve Gson: "Apr 25, 2026, 1:47:00 PM"
export const parseGsonDate = (value: any): Date | null => {
  //Si es nulo, devuelve null
  if (value == null) return null;
  //Si es un número, devuelve new Date(value)
  if (typeof value === 'number') return new Date(value);
  //Si es un string, intenta convertirlo a número
  const num = Number(value);
  if (!isNaN(num)) return new Date(num);
  //Si no es un número, intenta parsearlo como una fecha
  const match = String(value).match(
    /^(\w{3})\s+(\d{1,2}),\s+(\d{4}),\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)$/
  );
  //Si no es una fecha, devuelve null
  if (!match) return null;
  const [, mon, day, year, h, m, s, period] = match;
  let hours = parseInt(h, 10);
  //Si es PM y no son las 12, suma 12 a las horas
  if (period === 'PM' && hours !== 12) hours += 12;
  //Si es AM y son las 12, las convierte a 0
  if (period === 'AM' && hours === 12) hours = 0;
  //Crea la fecha con los datos parseados
  return new Date(parseInt(year, 10), MESES[mon], parseInt(day, 10), hours, parseInt(m, 10), parseInt(s, 10));
};
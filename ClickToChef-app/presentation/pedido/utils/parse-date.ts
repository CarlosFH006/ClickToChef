const MESES: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

// Parsea el formato que devuelve Gson: "Apr 25, 2026, 1:47:00 PM"
export const parseGsonDate = (value: any): Date | null => {
  if (value == null) return null;
  if (typeof value === 'number') return new Date(value);
  const num = Number(value);
  if (!isNaN(num)) return new Date(num);
  const match = String(value).match(
    /^(\w{3})\s+(\d{1,2}),\s+(\d{4}),\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)$/
  );
  if (!match) return null;
  const [, mon, day, year, h, m, s, period] = match;
  let hours = parseInt(h, 10);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return new Date(parseInt(year, 10), MESES[mon], parseInt(day, 10), hours, parseInt(m, 10), parseInt(s, 10));
};
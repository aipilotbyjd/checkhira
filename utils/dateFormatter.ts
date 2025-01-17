export const formatDateForAPI = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseCustomDate = (dateString: string | Date): Date => {
  if (dateString instanceof Date) {
    return dateString;
  }

  if (!dateString) return new Date();

  const parts = dateString.split('-').map((num) => parseInt(num, 10));
  if (parts.length === 3) {
    const [day, month, year] = parts;
    if (day && month && year) {
      return new Date(year, month - 1, day);
    }
  }

  return new Date(dateString);
};

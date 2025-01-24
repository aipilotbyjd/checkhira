import { format, isValid, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';

export const dateUtils = {
  /**
   * Checks if the given date is today
   */
  isToday(date: Date): boolean {
    return format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  },

  /**
   * Checks if the given date is within the current week
   */
  isThisWeek(date: Date): boolean {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    return isWithinInterval(date, { start: weekStart, end: weekEnd });
  },

  /**
   * Checks if the given date is within the current month
   */
  isThisMonth(date: Date): boolean {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  },

  /**
   * Parses a date string in various formats and returns a Date object
   * Handles both DD-MM-YYYY format and standard date strings
   */
  parseCustomDate(dateString: string | Date): Date {
    if (dateString instanceof Date) {
      return dateString;
    }

    if (!dateString) return new Date();

    // Handle DD-MM-YYYY format
    const parts = dateString.split('-').map((num) => parseInt(num, 10));
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (day && month && year) {
        return new Date(year, month - 1, day);
      }
    }

    // Fallback to standard date parsing
    return new Date(dateString);
  },

  /**
   * Formats a date for display in the UI
   */
  formatForDisplay(date: Date): string {
    return format(date, 'MMMM dd, yyyy');
  },

  /**
   * Formats a date for API requests
   */
  formatForAPI(date: Date): string {
    return format(date, 'dd-MM-yyyy');
  },

  /**
   * Validates if a date string or Date object is valid
   */
  isValidDate(date: string | Date): boolean {
    if (date instanceof Date) {
      return isValid(date);
    }
    return isValid(this.parseCustomDate(date));
  },
};

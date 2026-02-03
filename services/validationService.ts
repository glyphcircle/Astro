
export const validationService = {
  isValidName: (name: string): boolean => {
    return typeof name === 'string' && name.trim().length >= 2 && !/[0-9]/.test(name);
  },

  isValidDate: (date: string): boolean => {
    if (!date) return false;
    const d = new Date(date);
    return !isNaN(d.getTime());
  },

  isValidTime: (time: string): boolean => {
    // Matches HH:MM format (24-hour)
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  },

  isNotEmpty: (str: string): boolean => {
    return typeof str === 'string' && str.trim().length > 0;
  },

  isValidEmail: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
};

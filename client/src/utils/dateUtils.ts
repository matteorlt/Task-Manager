/**
 * Formate une date pour l'affichage (format: YYYY-MM-DD HH:mm:ss)
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return 'Non définie';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Date invalide';
    return dateObj.toISOString().slice(0, 19).replace('T', ' ');
  } catch (error) {
    return 'Date invalide';
  }
};

/**
 * Formate une date pour l'input de type date (format: YYYY-MM-DD)
 */
export const formatDateForInput = (date: string | Date): string => {
  if (!date) return '';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};

/**
 * Formate une date pour l'envoi au serveur (format: YYYY-MM-DD HH:mm:ss)
 */
export const formatDateForServer = (date: string): string => {
  if (!date) return '';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return `${date} 00:00:00`;
  } catch (error) {
    return '';
  }
}; 
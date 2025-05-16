/**
 * Formate une date pour l'affichage (format: YYYY-MM-DD HH:mm:ss)
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return 'Non définie';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Date invalide';
    // Décale de +2h pour UTC+2
    const utc2 = new Date(dateObj.getTime() + 2 * 60 * 60 * 1000);
    return utc2.toISOString().slice(0, 19).replace('T', ' ');
  } catch (error) {
    return 'Date invalide';
  }
};

/**
 * Formate une date pour l'input de type date (format: YYYY-MM-DD)
 */
export function formatDateForInput(date: string | Date) {
  if (!date) return '';
  // Si c'est déjà une string au format YYYY-MM-DD, retourne-la
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    return date.slice(0, 10);
  }
  // Sinon, extrait la date locale sans décalage
  const d = new Date(date);
  // Décale de +2h pour UTC+2
  const utc2 = new Date(d.getTime() + 2 * 60 * 60 * 1000);
  const year = utc2.getFullYear();
  const month = String(utc2.getMonth() + 1).padStart(2, '0');
  const day = String(utc2.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formate une date pour l'envoi au serveur (format: YYYY-MM-DD HH:mm:ss)
 */
export const formatDateForServer = (date: string): string => {
  if (!date) return '';
  try {
    // Ajoute 00:00:00 en UTC+2
    const dateObj = new Date(date);
    const utc2 = new Date(dateObj.getTime() - 2 * 60 * 60 * 1000); // Soustrait 2h pour stocker en UTC
    const year = utc2.getFullYear();
    const month = String(utc2.getMonth() + 1).padStart(2, '0');
    const day = String(utc2.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} 00:00:00`;
  } catch (error) {
    return '';
  }
}; 
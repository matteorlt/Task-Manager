export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    VERIFY: `${API_BASE_URL}/auth/verify`,
  },
  TASKS: {
    GET_ALL: `${API_BASE_URL}/tasks`,
    CREATE: `${API_BASE_URL}/tasks`,
    UPDATE: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/tasks/${id}`,
  },
  EVENTS: {
    GET_ALL: `${API_BASE_URL}/events`,
    CREATE: `${API_BASE_URL}/events`,
    UPDATE: (id: string) => `${API_BASE_URL}/events/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/events/${id}`,
  },
  INVITATIONS: {
    GET_ALL: `${API_BASE_URL}/invitations`,
    SEND: `${API_BASE_URL}/invitations`,
    ACCEPT: (id: string) => `${API_BASE_URL}/invitations/${id}/accept`,
    DECLINE: (id: string) => `${API_BASE_URL}/invitations/${id}/reject`,
  },
  NOTIFICATIONS: {
    GET_ALL: `${API_BASE_URL}/notifications`,
    MARK_AS_READ: (id: number) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_AS_READ: `${API_BASE_URL}/notifications/read-all`,
  },
  PROFILE: {
    GET: `${API_BASE_URL}/profile`,
    UPDATE: `${API_BASE_URL}/profile`,
    UPDATE_PICTURE: `${API_BASE_URL}/profile/picture`,
    REMOVE_PICTURE: `${API_BASE_URL}/profile/picture`,
    UPLOAD_PICTURE: `${API_BASE_URL}/profile/picture`,
  },
}; 
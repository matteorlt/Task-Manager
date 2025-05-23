export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  TASKS: {
    GET_ALL: `${API_BASE_URL}/api/tasks`,
    CREATE: `${API_BASE_URL}/api/tasks`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/tasks/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/tasks/${id}`,
  },
  EVENTS: {
    GET_ALL: `${API_BASE_URL}/api/events`,
    CREATE: `${API_BASE_URL}/api/events`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/events/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/events/${id}`,
  },
  INVITATIONS: {
    GET_ALL: `${API_BASE_URL}/api/invitations`,
    SEND: `${API_BASE_URL}/api/invitations`,
    ACCEPT: (id: string) => `${API_BASE_URL}/api/invitations/${id}/accept`,
    DECLINE: (id: string) => `${API_BASE_URL}/api/invitations/${id}/reject`,
  },
  NOTIFICATIONS: {
    GET_ALL: `${API_BASE_URL}/api/notifications`,
    MARK_AS_READ: (id: number) => `${API_BASE_URL}/api/notifications/${id}/read`,
    MARK_ALL_AS_READ: `${API_BASE_URL}/api/notifications/read-all`,
  },
  PROFILE: {
    GET: `${API_BASE_URL}/api/profile`,
    UPDATE: `${API_BASE_URL}/api/profile`,
    UPDATE_PICTURE: `${API_BASE_URL}/api/profile/picture`,
    REMOVE_PICTURE: `${API_BASE_URL}/api/profile/picture`,
    UPLOAD_PICTURE: `${API_BASE_URL}/api/profile/picture`,
  },
}; 
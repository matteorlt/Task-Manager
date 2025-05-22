const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  TASKS: `${API_BASE_URL}/api/tasks`,
  EVENTS: `${API_BASE_URL}/api/events`,
  INVITATIONS: {
    SEND: `${API_BASE_URL}/api/invitations`,
    GET_ALL: `${API_BASE_URL}/api/invitations`,
    ACCEPT: `${API_BASE_URL}/api/invitations`,
    REJECT: `${API_BASE_URL}/api/invitations`,
  },
  NOTIFICATIONS: {
    GET_ALL: `${API_BASE_URL}/api/notifications`,
    MARK_AS_READ: `${API_BASE_URL}/api/notifications`,
    MARK_ALL_AS_READ: `${API_BASE_URL}/api/notifications/read-all`,
    DELETE: `${API_BASE_URL}/api/notifications`,
  },
}; 
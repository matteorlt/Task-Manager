const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  TASKS: `${API_BASE_URL}/api/tasks`,
  EVENTS: `${API_BASE_URL}/api/events`,
}; 
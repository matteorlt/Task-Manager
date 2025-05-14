const BASE_URL = 'http://localhost:3000';

export const EVENTS = `${BASE_URL}/api/events`;
export const TASKS = `${BASE_URL}/api/tasks`;
export const AUTH = {
  LOGIN: `${BASE_URL}/api/auth/login`,
  REGISTER: `${BASE_URL}/api/auth/register`,
  LOGOUT: `${BASE_URL}/api/auth/logout`,
} as const; 
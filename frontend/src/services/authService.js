import api from './api';

export const authService = {
  /**
   * Authenticate user with Spring Boot backend
   * @param {{ email: string, password: string }} credentials
   */
  login: async (credentials) => {
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;

    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        const userObj = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        };
        localStorage.setItem('user', JSON.stringify(userObj));
        return userObj;
      }
      throw new Error('Authentication response did not contain a valid security token.');
    } catch (apiError) {
      const msg = apiError.response?.data?.message || apiError.customMessage || 'Invalid email or password.';
      throw new Error(msg);
    }
  },

  /**
   * Register a new user account with Spring Boot backend
   * @param {{ name: string, email: string, phone: string, password: string }} userData
   */
  register: async (userData) => {
    const email = userData.email.trim().toLowerCase();
    const name = userData.name.trim();
    const phone = userData.phone ? userData.phone.trim() : '';
    const password = userData.password;

    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        phone,
        password
      });

      if (response.data) {
        return response.data;
      }
      throw new Error('Registration failed. Please try again.');
    } catch (apiError) {
      const msg = apiError.response?.data?.message || apiError.customMessage || 'Registration failed. Email may already be registered.';
      throw new Error(msg);
    }
  },

  /**
   * Validate and retrieve current authenticated user from backend /auth/me
   */
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await api.get('/auth/me');
      if (response.data) {
        const userObj = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          role: response.data.role
        };
        localStorage.setItem('user', JSON.stringify(userObj));
        return userObj;
      }
      return null;
    } catch (e) {
      if (e.response && e.response.status === 401) {
        authService.logout();
        return null;
      }
      return authService.getStoredUser();
    }
  },

  /**
   * Clear session state
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Retrieve cached user details from localStorage
   */
  getStoredUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  }
};

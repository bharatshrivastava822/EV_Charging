import api from './api';

const USERS_STORAGE_KEY = 'chargergo_users';

const DEFAULT_USERS = [
  {
    id: 1,
    name: 'Admin Manager',
    email: 'admin@evcharge.in',
    phone: '9876543210',
    role: 'ADMIN',
    password: 'Admin@123'
  },
  {
    id: 2,
    name: 'Aryan Sharma',
    email: 'aryan@example.com',
    phone: '9876543211',
    role: 'USER',
    password: 'User@123'
  },
  {
    id: 3,
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '9876543212',
    role: 'USER',
    password: 'User@123'
  }
];

const getStoredUsers = () => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_USERS;
  }
};

const saveStoredUsers = (users) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to local storage', e);
  }
};

export const authService = {
  login: async (credentials) => {
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;

    try {
      // Attempt backend REST call
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        }));
        return response.data;
      }
    } catch (apiError) {
      // If backend responded with 400/401/403 credentials error, propagate the error message
      if (apiError.response && apiError.response.status >= 400 && apiError.response.status < 500) {
        throw new Error(apiError.response.data?.message || 'Invalid email or password.');
      }
      
      // If network error (backend offline during client demo), fallback to local registry
      const localUsers = getStoredUsers();
      const matched = localUsers.find(u => u.email.toLowerCase() === email && u.password === password);
      if (matched) {
        const dummyToken = 'mock_jwt_token_' + btoa(matched.email + ':' + Date.now());
        const userObj = {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          role: matched.role || 'USER',
          token: dummyToken
        };
        localStorage.setItem('token', dummyToken);
        localStorage.setItem('user', JSON.stringify(userObj));
        return userObj;
      } else {
        throw new Error('Invalid email or password.');
      }
    }
  },

  register: async (userData) => {
    const email = userData.email.trim().toLowerCase();
    const name = userData.name.trim();
    const phone = userData.phone ? userData.phone.trim() : '';
    const password = userData.password;

    try {
      // Attempt backend REST call
      const response = await api.post('/auth/register', {
        name,
        email,
        phone,
        password
      });

      if (response.data) {
        return response.data;
      }
    } catch (apiError) {
      // If backend threw validation error or duplicate email
      if (apiError.response && apiError.response.status === 400) {
        throw new Error(apiError.response.data?.message || 'Registration failed. Email may already be in use.');
      }

      // Offline fallback: save in local registry
      const localUsers = getStoredUsers();
      if (localUsers.some(u => u.email.toLowerCase() === email)) {
        throw new Error('An account with this email address already exists.');
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password,
        role: 'USER'
      };

      localUsers.push(newUser);
      saveStoredUsers(localUsers);

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (e) {
      return authService.getStoredUser();
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  }
};

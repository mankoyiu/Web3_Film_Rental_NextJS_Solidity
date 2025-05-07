import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'https://pcpdfilm.starsknights.com:18888/api/v2';
let authToken: string | null = null;

export interface User {
  id: string;
  username: string;
  role: 'user' | 'staff' | 'admin';
  name?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Login with username and password
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // For demo purposes, we're using a hardcoded response
    // In a real app, this would be an actual API call
    if (credentials.username === 'staff' && credentials.password === 'password123') {
      const response = {
        token: 'jwt-token-for-staff-user',
        user: {
          id: '1',
          username: 'staff',
          role: 'staff' as const,
          name: 'Staff User'
        }
      };
      
      // Store the token for future requests
      authToken = response.token;
      
      // Store token and user info in cookies
      Cookies.set('auth_token', response.token, { sameSite: 'strict' });
      Cookies.set('user', JSON.stringify(response.user), { sameSite: 'strict' });
      
      return response;
    } else if (credentials.username === 'admin' && credentials.password === 'admin123') {
      const response = {
        token: 'jwt-token-for-admin-user',
        user: {
          id: '2',
          username: 'admin',
          role: 'admin' as const,
          name: 'Admin User'
        }
      };
      
      // Store the token for future requests
      authToken = response.token;
      
      // Store token and user info in cookies
      Cookies.set('auth_token', response.token, { sameSite: 'strict' });
      Cookies.set('user', JSON.stringify(response.user), { sameSite: 'strict' });
      
      return response;
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Logout user
export const logout = (): void => {
  authToken = null;
  
  // Remove user info from cookies
  Cookies.remove('auth_token');
  Cookies.remove('user');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return Cookies.get('auth_token') !== undefined;
};

// Get current user
export const getCurrentUser = (): User | null => {
  const userStr = Cookies.get('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user cookie:', e);
      return null;
    }
  }
  return null;
};

// Check if user has staff role
export const isStaff = (): boolean => {
  const user = getCurrentUser();
  return user !== null && (user.role === 'staff' || user.role === 'admin');
};

// Check if user has admin role
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user !== null && user.role === 'admin';
};

// Get auth header
export const getAuthHeader = (): Record<string, string> => {
  const token = Cookies.get('auth_token');
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
};

// Change password for staff/admin
export const changePassword = async ({ oldPassword, newPassword }: { oldPassword: string, newPassword: string }) => {
  // Replace with actual API endpoint and logic
  const token = Cookies.get('auth_token');
  if (!token) throw new Error('Not authenticated');

  // Example: POST /change-password
  const res = await fetch('/api/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to change password');
  }
  return true;
};

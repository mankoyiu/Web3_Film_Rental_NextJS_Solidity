// src/services/auth.ts
import Cookies from 'js-cookie';

export interface User {
  id: string;
  username: string;
  name: string; // Add name field to fix TypeScript errors
  role: 'admin' | 'staff';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Simulate backend tokens
const TOKENS: Record<string, string> = {
  admin: 'jwt-token-for-admin-user',
  staff: 'jwt-token-for-staff-user',
};

// Simulate backend user info
const USERS: Record<string, User> = {
  admin: { id: '1', username: 'admin', name: 'Administrator', role: 'admin' },
  staff: { id: '2', username: 'staff', name: 'Staff Member', role: 'staff' },
};

// For demo: store passwords in localStorage (persist across reloads)
function getStoredPasswords(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('PASSWORDS');
    if (data) return JSON.parse(data);
  }
  return {
    admin: 'password123',
    staff: 'staffpass',
  };
}

function setStoredPasswords(passwords: Record<string, string>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('PASSWORDS', JSON.stringify(passwords));
  }
}

export async function login({ username, password }: LoginCredentials): Promise<{ user: User }> {
  // Demo: Accept admin/staff with password from localStorage
  const passwords = getStoredPasswords();
  if (
    (username === 'admin' && password === passwords['admin']) ||
    (username === 'staff' && password === passwords['staff'])
  ) {
    // Store both token and user data in cookies
    Cookies.set('token', TOKENS[username], { expires: 1, path: '/' });
    Cookies.set('username', username, { expires: 1, path: '/' });
    // Also store user role directly for easier access
    Cookies.set('userRole', USERS[username].role, { expires: 1, path: '/' });
    console.log('Login successful:', username, USERS[username].role);
    return { user: USERS[username] };
  } else {
    throw new Error('Invalid username or password');
  }
}

export function logout() {
  Cookies.remove('token', { path: '/' });
  Cookies.remove('username', { path: '/' });
  Cookies.remove('userRole', { path: '/' });
  console.log('Logged out, cookies cleared');
}

export function isAuthenticated(): boolean {
  const hasToken = Boolean(Cookies.get('token'));
  console.log('isAuthenticated check:', hasToken);
  return hasToken;
}

export function getCurrentUser(): User | null {
  const username = Cookies.get('username');
  const role = Cookies.get('userRole') as 'admin' | 'staff' | undefined;
  
  console.log('getCurrentUser:', { username, role });
  
  if (username && role) {
    // Reconstruct user from cookies directly
    return {
      id: role === 'admin' ? '1' : '2',
      username,
      name: role === 'admin' ? 'Administrator' : 'Staff Member',
      role
    };
  }
  
  // Fallback to the original method
  if (username && USERS[username]) {
    return USERS[username];
  }
  
  return null;
}

export async function changePassword({ oldPassword, newPassword }: { oldPassword: string; newPassword: string; }) {
  // Add debug logging
  console.log('Changing password...');
  
  const username = Cookies.get('username');
  console.log('Username from cookie:', username);
  
  if (!username) throw new Error('Not authenticated');
  
  const passwords = getStoredPasswords();
  console.log('Retrieved stored passwords, username exists:', Boolean(passwords[username]));
  
  if (!passwords[username]) throw new Error('User not found');
  
  // Don't log actual passwords but check if they match
  const passwordsMatch = passwords[username] === oldPassword;
  console.log('Current password matches stored password:', passwordsMatch);
  
  if (!passwordsMatch) throw new Error('Current password is incorrect');
  
  if (!newPassword || newPassword.length < 6) throw new Error('New password must be at least 6 characters');
  
  // Update password
  passwords[username] = newPassword;
  setStoredPasswords(passwords);
  console.log('Password updated successfully');
  
  // Log the user out to force re-login
  Cookies.remove('token', { path: '/' });
  Cookies.remove('username', { path: '/' });
  Cookies.remove('userRole', { path: '/' });
  console.log('User logged out after password change');
  
  return true;
}

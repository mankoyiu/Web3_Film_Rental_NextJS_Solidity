'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin, logout as apiLogout, isAuthenticated, getCurrentUser, User, LoginCredentials } from '@/services/auth';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  user: User | null;
  isStaff: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Force a check of authentication status whenever the component mounts
  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('Checking authentication status...');
        const authenticated = isAuthenticated();
        console.log('isAuthenticated returned:', authenticated);
        
        setIsLoggedIn(authenticated);
        
        if (authenticated) {
          const currentUser = getCurrentUser();
          console.log('getCurrentUser returned:', currentUser);
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Also check auth when the window gains focus or storage changes (for password changes)
    const handleFocus = () => {
      checkAuth();
    };
    
    const handleStorageChange = (event: StorageEvent) => {
      // If passwords are changed, we need to refresh auth state
      if (event.key === 'PASSWORDS') {
        console.log('Password storage changed, rechecking auth');
        checkAuth();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting login with:', credentials.username);
      const response = await apiLogin(credentials);
      console.log('Login successful, user:', response.user);
      
      setIsLoggedIn(true);
      setUser(response.user);
      // Ensure cookies are set before redirecting
      setTimeout(() => {
        if (response.user.role === 'admin' || response.user.role === 'staff') {
          console.log('Redirecting to dashboard...');
          window.location.href = '/staff/dashboard';
        }
      }, 100); // 100ms delay to ensure cookies are written
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    apiLogout();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/login');
  };

  // Defensive: If user is not staff/admin, force logout and redirect
  useEffect(() => {
    if (!loading && user && !(user.role === 'admin' || user.role === 'staff')) {
      setError('You are not authorized to access the staff dashboard.');
      logout();
    }
  }, [loading, user]);

  // Derived properties
  const isStaff = Boolean(user && (user.role === 'staff' || user.role === 'admin'));
  const isAdmin = Boolean(user && user.role === 'admin');

  console.log('Auth context state:', { isLoggedIn, isStaff, isAdmin, user, loading });

  return (
    <AuthContext.Provider 
      value={{
        isLoggedIn,
        login,
        logout,
        user,
        isStaff,
        isAdmin,
        loading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
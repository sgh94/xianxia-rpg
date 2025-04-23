import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for authentication
type User = {
  id: string;
  username: string;
  email: string;
  // Add more user fields as needed
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check local storage or session for authentication tokens
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // In a real app, you'd validate the token with your backend
          // For now, just set a mock user for demonstration
          setUser({
            id: '1',
            username: 'user',
            email: 'user@example.com',
          });
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        setError('Failed to authenticate user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Here you would typically call your API
      // Mock implementation for now
      localStorage.setItem('auth_token', 'mock_token');
      
      setUser({
        id: '1',
        username: email.split('@')[0],
        email,
      });
    } catch (err) {
      console.error('Login failed:', err);
      setError('Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Here you would typically call your API
      // Mock implementation for now
      localStorage.setItem('auth_token', 'mock_token');
      
      setUser({
        id: '1',
        username,
        email,
      });
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;

import React, { createContext, useContext, ReactNode } from 'react';
import useAuth from '@hooks/useAuth';

// AuthContext 인터페이스 정의
interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  checkAuth: () => Promise<void>;
  requireAuth: (redirectUrl?: string) => void;
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// 커스텀 훅
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;

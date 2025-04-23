import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });
  
  const router = useRouter();

  // 현재 인증 상태 확인
  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('인증 상태 확인 오류:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: '인증 상태를 확인하는 중 오류가 발생했습니다.',
      });
    }
  }, []);

  // 로그인
  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || '로그인에 실패했습니다.',
        }));
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
      console.error('로그인 오류:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, message: errorMessage };
    }
  }, []);

  // 회원가입
  const register = useCallback(async (username: string, email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || '회원가입에 실패했습니다.',
        }));
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.';
      console.error('회원가입 오류:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, message: errorMessage };
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
        router.push('/');
        return true;
      } else {
        const data = await response.json();
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || '로그아웃에 실패했습니다.',
        }));
        return false;
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: '로그아웃 중 오류가 발생했습니다.',
      }));
      return false;
    }
  }, [router]);

  // 인증이 필요한 페이지 접근 처리
  const requireAuth = useCallback((redirectUrl = '/auth/login') => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      // 인증 상태를 확인하기 위해 한 번 더 시도
      checkAuth().then(() => {
        // 여전히 인증되지 않은 경우 리디렉션
        if (!authState.isAuthenticated) {
          console.log('인증이 필요한 페이지 접근 - 리디렉션:', redirectUrl);
          router.push(`${redirectUrl}?redirect=${encodeURIComponent(router.asPath)}`);
        }
      });
    }
  }, [authState.isLoading, authState.isAuthenticated, router, checkAuth]);

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    login,
    logout,
    register,
    checkAuth,
    requireAuth,
  };
};

export default useAuth;
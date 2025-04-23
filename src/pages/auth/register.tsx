import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation(['common', 'auth']);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 기본 검증
    if (!formData.username || !formData.email || !formData.password) {
      setError(t('auth:errors.allFieldsRequired'));
      return;
    }
    
    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth:errors.passwordMismatch'));
      return;
    }
    
    // 비밀번호 길이 검증
    if (formData.password.length < 6) {
      setError(t('auth:errors.passwordTooShort'));
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '회원가입 실패');
      }
      
      // 회원가입 성공 - 리디렉션
      if (router.query.redirect) {
        router.push(router.query.redirect as string);
      } else {
        router.push('/');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center py-8">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">{t('auth:register')}</h1>
        
        {error && (
          <div className="bg-red-900 text-white p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2 text-sm font-medium">
              {t('auth:username')}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-sm font-medium">
              {t('auth:email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-sm font-medium">
              {t('auth:password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
            <p className="mt-1 text-xs text-gray-400">{t('auth:passwordRequirements')}</p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
              {t('auth:confirmPassword')}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium transition-colors"
            disabled={isLoading}
          >
            {isLoading ? t('auth:registering') : t('auth:register')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-300">
            {t('auth:haveAccount')}{' '}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300">
              {t('auth:login')}
            </Link>
          </p>
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-300">
            {t('auth:backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common', 'auth'])),
    },
  };
};
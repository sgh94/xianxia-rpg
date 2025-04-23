import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useAuthContext } from '@contexts/AuthContext';
import LanguageSwitcher from '@components/LanguageSwitcher';

const AuthHeader = () => {
  const { t } = useTranslation(['common', 'auth']);
  const { isAuthenticated, user, logout } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">
          {t('title')}
        </Link>

        <div className="flex items-center">
          <LanguageSwitcher />
          
          {isAuthenticated ? (
            <div className="relative ml-4">
              <button
                className="flex items-center space-x-2 text-white hover:text-indigo-300 focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span>{user?.username || '사용자'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10">
                  <Link
                    href="/game/continue"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('auth:myGames')}
                  </Link>
                  <Link
                    href="/auth/profile"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('auth:profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                  >
                    {t('auth:logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-4 flex space-x-4">
              <Link href="/auth/login" className="text-white hover:text-indigo-300">
                {t('auth:login')}
              </Link>
              <Link href="/auth/register" className="text-white hover:text-indigo-300">
                {t('auth:register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
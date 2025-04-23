import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useAuthContext } from '@/contexts/AuthContext';
import LanguageSwitcher from '@components/LanguageSwitcher';

const AuthHeader = () => {
  const { t } = useTranslation('common');
  const { user, logout, isAuthenticated } = useAuthContext();

  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <span className="text-xl font-bold cursor-pointer">
              Xianxia RPG
            </span>
          </Link>
          <nav className="ml-8">
            <ul className="flex space-x-6">
              <li>
                <Link href="/">
                  <span className="hover:text-gray-300 cursor-pointer">
                    {t('home')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/play">
                  <span className="hover:text-gray-300 cursor-pointer">
                    {t('play')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="hover:text-gray-300 cursor-pointer">
                    {t('about')}
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <span className="hover:text-gray-300 cursor-pointer">
                  {user?.username || t('profile')}
                </span>
              </Link>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link href="/login">
                <span className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded cursor-pointer">
                  {t('login')}
                </span>
              </Link>
              <Link href="/register">
                <span className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded cursor-pointer">
                  {t('register')}
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;

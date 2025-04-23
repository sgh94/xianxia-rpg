import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import AuthHeader from '@components/AuthHeader';
import { useAuthContext } from '@contexts/AuthContext';

export default function Home() {
  const { t } = useTranslation('common');
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <AuthHeader />
      
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gray-800 bg-opacity-50 p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-4xl font-bold mb-6">{t('welcome')}</h2>
          <p className="text-lg mb-8">{t('description')}</p>
          
          <div className="space-y-4">
            <Link 
              href="/game/new" 
              className="block w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
            >
              {t('newGame')}
            </Link>
            
            {isAuthenticated && (
              <Link 
                href="/game/continue" 
                className="block w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                {t('continueGame')}
              </Link>
            )}
          </div>
        </div>
      </main>
      
      <footer className="p-4 text-center text-gray-400">
        <p>&copy; 2025 Xianxia RPG</p>
      </footer>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common', 'auth'])),
    },
  };
};
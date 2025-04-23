import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

interface GameSession {
  id: string;
  username: string;
  lastSaved: number;
  level?: number;
  fate?: string;
}

export default function ContinueGamePage() {
  const router = useRouter();
  const { t } = useTranslation(['common', 'game']);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [error, setError] = useState('');

  // 게임 세션 목록 로드
  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/game/list');
        
        if (!response.ok) {
          throw new Error('Failed to load saved games');
        }
        
        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (err) {
        console.error('Error loading sessions:', err);
        setError(t('game:errors.loadSessionsFailed'));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSessions();
  }, [t]);

  // 게임 세션 선택
  const handleSelectSession = (sessionId: string) => {
    router.push(`/game/main?userId=${sessionId}`);
  };

  // 날짜 형식화 함수
  const formatDate = (timestamp: number) => {
    if (!timestamp) return t('game:never');
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>{t('game:loadingSessions')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">{t('game:continueGame')}</h1>
        
        {error && (
          <div className="max-w-md mx-auto bg-red-900 rounded-lg p-4 mb-8 text-center">
            <p>{error}</p>
          </div>
        )}
        
        {sessions.length === 0 ? (
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 text-center">
            <p className="mb-6">{t('game:noSavedGames')}</p>
            <Link
              href="/game/new"
              className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              {t('game:startNewGame')}
            </Link>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">{t('game:character')}</th>
                    <th className="px-6 py-3 text-left">{t('game:fate')}</th>
                    <th className="px-6 py-3 text-left">{t('game:level')}</th>
                    <th className="px-6 py-3 text-left">{t('game:lastPlayed')}</th>
                    <th className="px-6 py-3 text-right">{t('game:actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4">{session.username}</td>
                      <td className="px-6 py-4">{session.fate || t('game:noFate')}</td>
                      <td className="px-6 py-4">{session.level || 1}</td>
                      <td className="px-6 py-4">{formatDate(session.lastSaved)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSelectSession(session.id)}
                          className="px-4 py-1 bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
                        >
                          {t('game:continue')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 text-center">
              <Link href="/" className="text-indigo-400 hover:text-indigo-300 mr-4">
                {t('game:backToHome')}
              </Link>
              <Link href="/game/new" className="text-indigo-400 hover:text-indigo-300">
                {t('game:startNewGame')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common', 'game'])),
    },
  };
};
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { FateResult } from '@modules/fate/types';

export default function NewGamePage() {
  const router = useRouter();
  const { t } = useTranslation(['common', 'fate', 'game']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [fate, setFate] = useState<FateResult | null>(null);

  // 게임 시작 처리
  const handleCreateGame = async () => {
    if (!username.trim()) {
      setError(t('game:errors.usernameRequired'));
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // 실제 구현에서는 여기서 사용자 프로필을 생성하고
      // 운명을 연결하는 API 호출이 필요합니다.
      const userId = 'test-user-' + Date.now();
      
      // 1. 프로필 생성
      const profileResponse = await fetch('/api/stats/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          username,
          locale: router.locale,
        }),
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to create profile');
      }
      
      // 2. 운명을 선택했다면 연결
      if (fate) {
        // 실제 구현에서는 프로필에 운명 정보를 연결하는 로직 추가
      }
      
      // 게임 메인 화면으로 이동
      router.push(`/game/main?userId=${userId}`);
      
    } catch (err) {
      console.error('Error:', err);
      setError(t('game:errors.createGameFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseFate = () => {
    router.push('/game/fate');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">{t('game:newGame')}</h1>
        
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="mb-6">
            <label htmlFor="username" className="block mb-2">
              {t('game:username')}
            </label>
            <input
              type="text"
              id="username"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('game:usernamePlaceholder')}
            />
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">{t('fate.title')}</h2>
            
            {fate ? (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{fate.fate}</h3>
                <p className="text-sm mb-4">{fate.description}</p>
                
                <button
                  onClick={() => setFate(null)}
                  className="text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  {t('game:changeFate')}
                </button>
              </div>
            ) : (
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="mb-4">{t('game:noFateSelected')}</p>
                <button
                  onClick={handleChooseFate}
                  className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {t('game:chooseFate')}
                </button>
              </div>
            )}
          </div>
          
          {error && <p className="text-red-400 mb-4">{error}</p>}
          
          <div className="flex space-x-4">
            <Link
              href="/"
              className="flex-1 py-2 text-center bg-gray-700 rounded-md font-medium hover:bg-gray-600 transition-colors"
            >
              {t('game:cancel')}
            </Link>
            <button
              onClick={handleCreateGame}
              className="flex-1 py-2 bg-indigo-600 rounded-md font-medium hover:bg-indigo-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? t('game:creating') : t('game:startGame')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common', 'fate', 'game'])),
    },
  };
};
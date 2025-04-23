import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { FateResult } from '@modules/fate/types';
import AuthHeader from '@components/AuthHeader';
import { useAuthContext } from '@contexts/AuthContext';

export default function NewGamePage() {
  const router = useRouter();
  const { t } = useTranslation(['common', 'fate', 'game']);
  const { isAuthenticated, requireAuth } = useAuthContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFate, setIsLoadingFate] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [fate, setFate] = useState<FateResult | null>(null);

  // 인증 확인
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // 이전에 선택한 운명 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingFate(true);
      
      fetch(`/api/fate/get`)
        .then(response => {
          if (!response.ok && response.status !== 404) {
            throw new Error('운명 데이터를 가져오는데 실패했습니다.');
          }
          return response.json();
        })
        .then(data => {
          if (data && !data.message) {
            setFate(data);
          }
        })
        .catch(err => {
          console.error('운명 데이터 로드 실패:', err);
          setError(t('game:errors.loadFateFailed'));
        })
        .finally(() => {
          setIsLoadingFate(false);
        });
    }
  }, [isAuthenticated, t]);

  // 게임 시작 처리
  const handleCreateGame = async () => {
    if (!username.trim()) {
      setError(t('game:errors.usernameRequired'));
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // 1. 운명이 아직 선택되지 않았다면 먼저 운명 선택 페이지로 이동
      if (!fate) {
        router.push('/game/fate');
        return;
      }
      
      console.log('게임 생성 시작:', { username, locale: router.locale });
      
      // 2. 게임 생성 API 호출
      const gameResponse = await fetch('/api/game/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          locale: router.locale,
        }),
      });
      
      const responseData = await gameResponse.json();
      console.log('게임 생성 응답:', responseData);
      
      if (!gameResponse.ok) {
        throw new Error(responseData.message || 'Failed to create game');
      }
      
      // 3. 게임 메인 화면으로 이동할 때 userId를 쿼리 파라미터로 전달
      const userId = responseData.profile?.id;
      if (!userId) {
        throw new Error('사용자 ID가 응답에 없습니다');
      }
      
      console.log('게임 생성 성공, 리디렉션 중...');
      router.push(`/game/main?userId=${userId}`);
      
    } catch (err: any) {
      console.error('Game creation error:', err);
      
      // 오류 메시지 설정
      if (err.message && err.message.includes('운명을 선택')) {
        setError(t('game:errors.needFate'));
        // 자동으로 운명 선택 페이지로 리디렉션
        setTimeout(() => {
          router.push('/game/fate');
        }, 2000);
      } else {
        setError(err.message || t('game:errors.createGameFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseFate = () => {
    router.push('/game/fate');
  };

  // 인증되지 않은 상태에서는 로딩 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <AuthHeader />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl">{t('game:authRequired')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AuthHeader />
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
            
            {isLoadingFate ? (
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p>{t('game:loadingFate')}</p>
              </div>
            ) : fate ? (
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
          
          {error && (
            <div className="bg-red-900 bg-opacity-50 rounded-md p-3 mb-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}
          
          <div className="flex space-x-4">
            <Link
              href="/"
              className="flex-1 py-2 text-center bg-gray-700 rounded-md font-medium hover:bg-gray-600 transition-colors"
            >
              {t('game:cancel')}
            </Link>
            <button
              onClick={handleCreateGame}
              className="flex-1 py-2 bg-indigo-600 rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-900 disabled:cursor-not-allowed"
              disabled={isLoading || !fate || !username.trim()}
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
      ...(await serverSideTranslations(locale || 'ko', ['common', 'fate', 'game', 'auth'])),
    },
  };
};
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { FateResult } from '@modules/fate/types';
import AuthHeader from '@components/AuthHeader';
import { useAuthContext } from '@contexts/AuthContext';

export default function FatePage() {
  const router = useRouter();
  const { t } = useTranslation(['common', 'fate']);
  const { isAuthenticated, requireAuth } = useAuthContext();
  
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fateResult, setFateResult] = useState<FateResult | null>(null);
  const [error, setError] = useState('');

  // 인증 확인
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError(t('fate:errors.emptyPrompt'));
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/fate/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          locale: router.locale,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate fate');
      }
      
      setFateResult(data);
    } catch (err) {
      console.error('Error generating fate:', err);
      setError(t('fate:errors.generateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!fateResult) return;
    
    try {
      setIsLoading(true);
      
      // 운명 데이터 저장
      const response = await fetch('/api/fate/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fate: fateResult,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '운명 저장 실패');
      }
      
      // 저장 후 새 게임 페이지로 이동
      router.push('/game/new');
    } catch (err) {
      console.error('운명 저장 중 오류:', err);
      setError(t('fate:errors.saveFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // 인증되지 않은 상태에서는 로딩 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <AuthHeader />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl">{t('fate:authRequired')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AuthHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6">{t('fate.title')}</h1>
        
        {!fateResult ? (
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6">
            <p className="mb-4">{t('fate.question')}</p>
            
            <form onSubmit={handleSubmit}>
              <textarea
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white mb-4"
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('fate:placeholder')}
              />
              
              {error && (
                <div className="bg-red-900 bg-opacity-50 rounded-md p-3 mb-4">
                  <p className="text-red-300">{error}</p>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? t('fate:loading') : t('fate.submit')}
              </button>
            </form>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">{fateResult.fate}</h2>
            <p className="mb-6">{fateResult.description}</p>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">{t('fate:startingStats')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(fateResult.startingStats).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between">
                    <span>{t(`stats.${stat}`)}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">{t('fate:startingTraits')}</h3>
              <ul className="list-disc list-inside">
                {fateResult.startingTraits.map((trait, index) => (
                  <li key={index}>{trait}</li>
                ))}
              </ul>
            </div>
            
            {error && (
              <div className="bg-red-900 bg-opacity-50 rounded-md p-3 mb-4">
                <p className="text-red-300">{error}</p>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={() => setFateResult(null)}
                className="flex-1 py-2 bg-gray-700 rounded-md font-medium hover:bg-gray-600 transition-colors"
              >
                {t('fate:tryAgain')}
              </button>
              <button
                onClick={handleStartGame}
                className="flex-1 py-2 bg-indigo-600 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? t('fate:saving') : t('fate:acceptFate')}
              </button>
            </div>
          </div>
        )}
        
        <div className="text-center mt-6">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300">
            {t('fate:backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common', 'fate', 'auth'])),
    },
  };
};
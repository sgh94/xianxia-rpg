import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { FateResult } from '@modules/fate/types';

export default function FatePage() {
  const router = useRouter();
  const { t } = useTranslation(['common', 'fate']);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fateResult, setFateResult] = useState<FateResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError(t('fate:errors.emptyPrompt'));
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // In a real app, we'd get a real userId from authentication
      const userId = 'test-user-' + Date.now();
      
      const response = await fetch('/api/fate/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          prompt,
          locale: router.locale,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate fate');
      }
      
      const result = await response.json();
      setFateResult(result);
    } catch (err) {
      console.error('Error:', err);
      setError(t('fate:errors.generateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = () => {
    // In a real app, we would save the chosen fate and redirect to game setup
    router.push('/game/new');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
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
              
              {error && <p className="text-red-400 mb-4">{error}</p>}
              
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
              >
                {t('fate:acceptFate')}
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
      ...(await serverSideTranslations(locale || 'ko', ['common', 'fate'])),
    },
  };
};
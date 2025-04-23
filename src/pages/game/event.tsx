import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

import { Event, EventResult } from '@modules/events/types';

export default function EventPage() {
  const router = useRouter();
  const { t } = useTranslation(['common', 'events']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [event, setEvent] = useState<Event | null>(null);
  const [result, setResult] = useState<EventResult | null>(null);
  const { userId, eventId } = router.query;

  useEffect(() => {
    if (userId && eventId) {
      generateEvent();
    }
  }, [userId, eventId]);

  const generateEvent = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/events/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          eventId,
          locale: router.locale,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate event');
      }

      const data = await response.json();
      setEvent(data);
    } catch (err) {
      console.error('Error:', err);
      setError(t('events:errors.generateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = async (optionId: string) => {
    if (!event) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/events/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sessionId: event.sessionId,
          optionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to resolve event');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError(t('events:errors.resolveFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    // 다음 이벤트로 이동하거나 게임 화면으로 돌아가기
    router.push('/game/main');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>{t('events:loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/game/main')}
            className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
          >
            {t('events:backToGame')}
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg text-center">
          <p className="mb-4">{t('events:noEvent')}</p>
          <button
            onClick={() => router.push('/game/main')}
            className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
          >
            {t('events:backToGame')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        {!result ? (
          // 이벤트 화면
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="prose prose-invert mb-6">
              <p className="text-lg">{event.narrative}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{t('events:chooseAction')}</h3>
              
              {event.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // 결과 화면
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="mb-6">
              <h2 className={`text-xl font-bold mb-2 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.success ? t('events:success') : t('events:failure')}
              </h2>
              <p className="text-lg">{result.narrative}</p>
            </div>

            {result.rewards && Object.keys(result.rewards).length > 0 && (
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2 text-green-300">{t('events:rewards')}</h3>
                <ul className="space-y-1">
                  {result.rewards.ep && Object.entries(result.rewards.ep).map(([stat, value]) => (
                    <li key={stat} className="flex justify-between">
                      <span>{t(`stats.${stat}`)}</span>
                      <span>+{value} EP</span>
                    </li>
                  ))}
                  
                  {result.rewards.life && (
                    <li className="flex justify-between">
                      <span>{t('events:life')}</span>
                      <span>+{result.rewards.life}</span>
                    </li>
                  )}
                  
                  {result.rewards.traits && result.rewards.traits.map((trait) => (
                    <li key={trait} className="flex justify-between">
                      <span>{t('events:newTrait')}</span>
                      <span>{trait}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.penalties && Object.keys(result.penalties).length > 0 && (
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2 text-red-300">{t('events:penalties')}</h3>
                <ul className="space-y-1">
                  {result.penalties.life && (
                    <li className="flex justify-between">
                      <span>{t('events:life')}</span>
                      <span>{result.penalties.life}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <button
              onClick={handleContinue}
              className="w-full py-3 bg-indigo-600 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              {t('events:continue')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common', 'events'])),
    },
  };
};
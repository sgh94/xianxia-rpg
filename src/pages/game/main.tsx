import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { UserProfile } from '@modules/stats/types';
import { EventMetadata } from '@modules/events/types';
import LanguageSwitcher from '@components/LanguageSwitcher';

export default function GameMainPage() {
  const router = useRouter();
  const { t } = useTranslation(['common', 'game']);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<EventMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 임시 아이디 (실제로는 인증에서 가져와야 함)
  const userId = 'test-user-1';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 프로필 가져오기
        let profileData = await fetchProfile();
        
        if (!profileData) {
          // 프로필이 없으면 생성
          profileData = await createProfile();
        }
        
        setProfile(profileData);
        
        // 이벤트 목록 가져오기
        const eventsData = await fetchEvents();
        setEvents(eventsData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t('game:errors.fetchFailed'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchProfile = async (): Promise<UserProfile | null> => {
    const response = await fetch(`/api/stats/profile?userId=${userId}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    return response.json();
  };

  const createProfile = async (): Promise<UserProfile> => {
    const response = await fetch(`/api/stats/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        username: 'Cultivator',
        locale: router.locale,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create profile');
    }
    
    return response.json();
  };

  const fetchEvents = async (): Promise<EventMetadata[]> => {
    const response = await fetch(`/api/events/list`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    return response.json();
  };

  const handleStartEvent = (eventId: string) => {
    router.push(`/game/event?userId=${userId}&eventId=${eventId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>{t('game:loading')}</p>
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
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
          >
            {t('game:backToHome')}
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg text-center">
          <p className="mb-4">{t('game:noProfile')}</p>
          <button
            onClick={() => router.push('/game/fate')}
            className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
          >
            {t('game:createProfile')}
          </button>
        </div>
      </div>
    );
  }

  // 샘플 이벤트 데이터 (실제로는 API에서 가져와야 함)
  const sampleEvents: EventMetadata[] = [
    {
      id: 'mountain-cave',
      type: 'exploration',
      timeCost: 60,
      epReward: 30,
      risk: 0.3
    },
    {
      id: 'market-trade',
      type: 'social',
      timeCost: 30,
      epReward: 15,
      risk: 0.1
    },
    {
      id: 'spirit-beast',
      type: 'combat',
      timeCost: 90,
      epReward: 45,
      risk: 0.5,
      lifeDelta: -20
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 flex justify-between items-center bg-gray-800">
        <h1 className="text-xl font-bold">{t('game:title')}</h1>
        <LanguageSwitcher />
      </header>
      
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 프로필 및 스탯 */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4 shadow-lg mb-4">
              <h2 className="text-lg font-semibold mb-2">{profile.username}</h2>
              <div className="flex justify-between mb-2">
                <span>{t('game:life')}</span>
                <span>{profile.life} / {profile.maxLife}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${(profile.life / profile.maxLife) * 100}%` }}
                ></div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2">{t('game:traits')}</h3>
                {profile.traits.length === 0 ? (
                  <p className="text-gray-400 text-sm">{t('game:noTraits')}</p>
                ) : (
                  <ul className="list-disc list-inside">
                    {profile.traits.map((trait, index) => (
                      <li key={index} className="text-sm">{trait}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">{t('game:stats')}</h2>
              <div className="space-y-3">
                {Object.values(profile.stats).map((stat) => (
                  <div key={stat.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t(`stats.${stat.key}`)}</span>
                      <span>Lv.{stat.grade} ({stat.ep}/{stat.maxEP})</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full" 
                        style={{ width: `${(stat.ep / stat.maxEP) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 이벤트 및 활동 */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4 shadow-lg mb-4">
              <h2 className="text-lg font-semibold mb-4">{t('game:availableEvents')}</h2>
              
              {sampleEvents.length === 0 ? (
                <p className="text-gray-400">{t('game:noEvents')}</p>
              ) : (
                <div className="space-y-4">
                  {sampleEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                      onClick={() => handleStartEvent(event.id)}
                    >
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">
                          {t(`events:${event.id}.title`) || event.id}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          event.type === 'combat' ? 'bg-red-900' : 
                          event.type === 'social' ? 'bg-blue-900' : 
                          'bg-green-900'
                        }`}>
                          {t(`game:eventTypes.${event.type}`)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3">
                        {t(`events:${event.id}.description`) || t('game:eventDescription')}
                      </p>
                      
                      <div className="flex text-xs text-gray-400 space-x-4">
                        <div>
                          <span className="mr-1">⏱</span>
                          <span>{event.timeCost} {t('game:minutes')}</span>
                        </div>
                        <div>
                          <span className="mr-1">✨</span>
                          <span>EP: {event.epReward}</span>
                        </div>
                        {event.lifeDelta && event.lifeDelta < 0 && (
                          <div className="text-red-400">
                            <span className="mr-1">❤</span>
                            <span>{event.lifeDelta}</span>
                          </div>
                        )}
                        <div>
                          <span className="mr-1">⚠</span>
                          <span>{t('game:risk')}: {(event.risk * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex space-x-4">
              <Link
                href="/game/cultivation"
                className="flex-1 bg-gray-800 rounded-lg p-4 shadow-lg text-center hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-semibold mb-2">{t('game:cultivation')}</h3>
                <p className="text-sm text-gray-300">{t('game:cultivationDesc')}</p>
              </Link>
              
              <Link
                href="/game/inventory"
                className="flex-1 bg-gray-800 rounded-lg p-4 shadow-lg text-center hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-semibold mb-2">{t('game:inventory')}</h3>
                <p className="text-sm text-gray-300">{t('game:inventoryDesc')}</p>
              </Link>
              
              <Link
                href="/game/achievements"
                className="flex-1 bg-gray-800 rounded-lg p-4 shadow-lg text-center hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-semibold mb-2">{t('game:achievements')}</h3>
                <p className="text-sm text-gray-300">{t('game:achievementsDesc')}</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'ko', ['common', 'game', 'events'])),
    },
  };
};
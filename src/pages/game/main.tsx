import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { FateResult } from '@modules/fate/types';

// 게임 상태 인터페이스
interface GameState {
  userId: string;
  username: string;
  age: number;
  cultivation: {
    realm: string;
    level: number;
  };
  stats: Record<string, number>;
  traits: string[];
  fate?: string;
  inventory: {
    items: Array<{
      id: string;
      name: string;
      type: string;
      quantity: number;
    }>;
    herbs: string[];
    artifacts: string[];
    currency: number;
  };
  relationships: Array<{
    id: string;
    name: string;
    type: string;
    level: number;
  }>;
}

const initialState: GameState = {
  userId: '',
  username: '',
  age: 16,
  cultivation: {
    realm: '기초 단계',
    level: 1,
  },
  stats: {
    qiGeneration: 1,
    technique: 1,
    perception: 1,
    luck: 1,
    clarity: 1,
  },
  traits: [],
  inventory: {
    items: [],
    herbs: [],
    artifacts: [],
    currency: 100,
  },
  relationships: [],
};

export default function MainGamePage() {
  const router = useRouter();
  const { t } = useTranslation(['common', 'game']);
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [fateDescription, setFateDescription] = useState<string>('');

  useEffect(() => {
    const { userId } = router.query;
    
    if (!userId) {
      router.push('/');
      return;
    }
    
    // 게임 상태 로드
    async function loadGameState() {
      setIsLoading(true);
      try {
        // 1. 프로필 데이터 로드
        const profileResponse = await fetch(`/api/stats/profile?userId=${userId}`);
        if (!profileResponse.ok) {
          throw new Error('Failed to load profile');
        }
        const profileData = await profileResponse.json();
        
        // 2. 운명 데이터 로드
        const fateResponse = await fetch(`/api/fate/get?userId=${userId}`);
        let fateData = null;
        
        if (fateResponse.ok) {
          fateData = await fateResponse.json();
          setFateDescription(fateData.description);
          
          // 프로필에 이미 스탯이 설정되어 있으면 그대로 사용, 없으면 운명 데이터로 초기화
          let statsData = {};
          
          if (profileData.stats) {
            // 프로필에서 스탯 값만 추출
            Object.keys(profileData.stats).forEach(key => {
              statsData[key] = profileData.stats[key].value;
            });
          } else if (fateData && fateData.startingStats) {
            // 운명 데이터에서 스탯 가져오기
            statsData = { ...fateData.startingStats };
          } else {
            // 기본 스탯
            statsData = { 
              qiGeneration: 1,
              technique: 1, 
              perception: 1, 
              luck: 1, 
              clarity: 1 
            };
          }
          
          // 3. 게임 상태 업데이트
          const updatedState = {
            ...initialState,
            userId: userId as string,
            username: profileData.username || 'Unknown Cultivator',
            stats: statsData,
            traits: profileData.traits || [],
            fate: profileData.fate || fateData.fate
          };
          
          setGameState(updatedState);
        } else {
          // 운명 데이터가 없는 경우 기본값으로 초기화
          setGameState({
            ...initialState,
            userId: userId as string,
            username: profileData.username || 'Unknown Cultivator',
            traits: profileData.traits || [],
            fate: profileData.fate
          });
        }
      } catch (err) {
        console.error('Error loading game state:', err);
        setError('Failed to load game data');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadGameState();
  }, [router, router.query]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('game:loading')}</h2>
          <p>{t('game:loadingDescription')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('game:error')}</h2>
          <p className="mb-6">{error}</p>
          <Link href="/" className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700">
            {t('game:backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{gameState.username}</h1>
          <div className="flex justify-between items-center mt-2">
            <div>
              <span className="text-gray-400">{t('game:age')}:</span> {gameState.age}
            </div>
            <div>
              <span className="text-gray-400">{t('game:realm')}:</span> {gameState.cultivation.realm} ({gameState.cultivation.level})
            </div>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 운명 정보 */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-2">
              {t('game:fate')}
            </h2>
            {gameState.fate ? (
              <div>
                <h3 className="font-medium text-indigo-400">{gameState.fate}</h3>
                <p className="text-sm mt-2">{fateDescription}</p>
              </div>
            ) : (
              <p className="text-gray-400 italic">{t('game:noFateSelected')}</p>
            )}
          </div>
          
          {/* 스탯 정보 */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-2">
              {t('game:stats')}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(gameState.stats).map(([stat, value]) => (
                <div key={stat} className="flex justify-between">
                  <span>{t(`stats.${stat}`)}</span>
                  <span className="text-indigo-300">{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 특성 정보 */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-2">
              {t('game:traits')}
            </h2>
            {gameState.traits.length > 0 ? (
              <ul className="list-disc list-inside">
                {gameState.traits.map((trait, index) => (
                  <li key={index} className="mb-1">{trait}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic">{t('game:noTraits')}</p>
            )}
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 이벤트 섹션 */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-2">
              {t('game:actions')}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/game/event?userId=${gameState.userId}`} className="bg-indigo-700 hover:bg-indigo-600 text-center py-3 rounded-md">
                {t('game:startEvent')}
              </Link>
              <button className="bg-indigo-700 hover:bg-indigo-600 text-center py-3 rounded-md opacity-50 cursor-not-allowed">
                {t('game:train')}
              </button>
              <button className="bg-indigo-700 hover:bg-indigo-600 text-center py-3 rounded-md opacity-50 cursor-not-allowed">
                {t('game:explore')}
              </button>
              <button className="bg-indigo-700 hover:bg-indigo-600 text-center py-3 rounded-md opacity-50 cursor-not-allowed">
                {t('game:meditate')}
              </button>
            </div>
          </div>
          
          {/* 인벤토리 섹션 */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-2">
              {t('game:inventory')}
            </h2>
            <div>
              <p className="mb-2">
                <span className="text-gray-400">{t('game:currency')}:</span> {gameState.inventory.currency}
              </p>
              {gameState.inventory.items.length > 0 ? (
                <ul className="list-disc list-inside">
                  {gameState.inventory.items.map((item) => (
                    <li key={item.id} className="mb-1">
                      {item.name} x{item.quantity}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic">{t('game:emptyInventory')}</p>
              )}
            </div>
          </div>
        </div>
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
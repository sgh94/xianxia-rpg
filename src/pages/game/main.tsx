import { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { FateResult } from '@modules/fate/types';
import AuthHeader from '@components/AuthHeader';
import { useAuthContext } from '@contexts/AuthContext';

// 게임 상태 인터페이스
interface GameState {
  userId: string;
  username: string;
  age: number;
  cultivation: {
    realm: string;
    level: number;
  };
  stats: Record<string, any>; // 스탯 객체 타입을 any로 변경 (다양한 타입 허용)
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
  lastSaved?: number;
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
  const { isAuthenticated, requireAuth } = useAuthContext();
  
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [fateDescription, setFateDescription] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const { userId } = router.query;

  // 인증 확인
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // 게임 상태 저장 함수
  const saveGameState = useCallback(async () => {
    if (!gameState.userId) return;
    
    try {
      setSaveStatus('saving');
      console.log('게임 상태 저장 중...');
      
      const response = await fetch('/api/game/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameState: {
            ...gameState,
            lastSaved: Date.now(),
          },
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save game state');
      }
      
      const data = await response.json();
      console.log('게임 상태 저장 성공:', data);
      
      setLastSaved(new Date());
      setSaveStatus('saved');
      
      // 3초 후 상태 초기화
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Error saving game state:', error);
      setSaveStatus('error');
      
      // 3초 후 상태 초기화
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  }, [gameState]);

  // 정기적인 자동 저장 설정
  useEffect(() => {
    if (!gameState.userId || isLoading) return;
    
    // 5분마다 자동 저장
    const autoSaveInterval = setInterval(() => {
      saveGameState();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(autoSaveInterval);
  }, [gameState.userId, isLoading, saveGameState]);

  // 게임 데이터 로드
  useEffect(() => {
    if (!isAuthenticated) return;
    
    if (!userId) {
      console.error('userId is missing, cannot load game data');
      setError('게임 데이터를 불러올 수 없습니다 (사용자 ID 누락)');
      setIsLoading(false);
      return;
    }
    
    async function loadGameState() {
      setIsLoading(true);
      setError('');
      
      try {
        console.log(`게임 데이터 로드 중... (userId: ${userId})`);
        
        // 게임 상태 로드 API 호출
        const response = await fetch(`/api/game/load?userId=${userId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to load game data');
        }
        
        const data = await response.json();
        console.log('게임 데이터 로드 성공:', data);
        
        // 게임 상태 설정
        setGameState(data.gameState);
        
        // 운명 설명 설정
        if (data.fateData && data.fateData.description) {
          setFateDescription(data.fateData.description);
        }
        
        // 마지막 저장 시간 설정
        if (data.gameState.lastSaved) {
          setLastSaved(new Date(data.gameState.lastSaved));
        }
        
      } catch (err) {
        console.error('Error loading game state:', err);
        setError('게임 데이터를 불러오는데 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadGameState();
  }, [userId, isAuthenticated]);

  // stats 객체를 안전하게 처리하는 함수
  const getStatValue = (stat: string): number => {
    if (!gameState.stats) return 0;
    
    const statData = gameState.stats[stat];
    // 객체인 경우 value 속성 반환, 숫자인 경우 그대로 반환
    if (typeof statData === 'object' && statData !== null && 'value' in statData) {
      return statData.value || 0;
    }
    if (typeof statData === 'number') {
      return statData;
    }
    return 0;
  };

  // 로딩 화면
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

  // 오류 화면
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

  // 스탯 키 배열 생성 - 객체인 경우와 그렇지 않은 경우 모두 처리
  const statKeys = gameState.stats ? Object.keys(gameState.stats) : [];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AuthHeader />
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{gameState.username}</h1>
            <div className="flex justify-between items-center mt-2">
              <div className="mr-4">
                <span className="text-gray-400">{t('game:age')}:</span> {gameState.age}
              </div>
              <div>
                <span className="text-gray-400">{t('game:realm')}:</span> {gameState.cultivation.realm} ({gameState.cultivation.level})
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={saveGameState}
              disabled={saveStatus === 'saving'}
              className={`px-4 py-2 rounded-md ${
                saveStatus === 'saving' ? 'bg-gray-600' : 
                saveStatus === 'saved' ? 'bg-green-600' : 
                saveStatus === 'error' ? 'bg-red-600' : 
                'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {saveStatus === 'saving' ? t('game:saving') : 
               saveStatus === 'saved' ? t('game:saved') : 
               saveStatus === 'error' ? t('game:saveError') : 
               t('game:save')}
            </button>
            
            {lastSaved && (
              <div className="ml-4 text-sm text-gray-400">
                {t('game:lastSaved')}: {lastSaved.toLocaleString()}
              </div>
            )}
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
              {statKeys.map((stat) => (
                <div key={stat} className="flex justify-between">
                  <span>{t(`stats.${stat}`)}</span>
                  <span className="text-indigo-300">{getStatValue(stat)}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 특성 정보 */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-2">
              {t('game:traits')}
            </h2>
            {gameState.traits && gameState.traits.length > 0 ? (
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
              {gameState.inventory.items && gameState.inventory.items.length > 0 ? (
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
      ...(await serverSideTranslations(locale || 'ko', ['common', 'game', 'auth'])),
    },
  };
};
import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { getUserProfile } from '@modules/stats/service';
import { getUserFate } from '@modules/fate/service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: 'Missing required userId parameter' });
  }

  try {
    // 1. 저장된 게임 상태 확인
    const gameState = await kv.get(`user:${userId}:game_state`);
    
    // 2. 사용자 프로필 로드
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    // 3. 운명 데이터 로드
    const fateData = await getUserFate(userId);
    
    // 4. 응답 데이터 구성
    // 게임 상태가 없는 경우 프로필 데이터로 기본 게임 상태 구성
    const responseData = {
      gameState: gameState || {
        userId: profile.id,
        username: profile.username,
        age: 16, // 기본값
        cultivation: {
          realm: '기초 단계',
          level: 1
        },
        stats: profile.stats,
        traits: profile.traits,
        fate: profile.fate || (fateData ? fateData.fate : undefined),
        inventory: {
          items: [],
          herbs: [],
          artifacts: [],
          currency: 100
        },
        relationships: []
      },
      profile,
      fateData,
      hasSavedState: !!gameState
    };
    
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error loading game state:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to load game state'
    });
  }
}
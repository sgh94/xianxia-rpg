import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';

interface GameSession {
  id: string;
  username: string;
  lastSaved: number;
  level?: number;
  fate?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // KV 스토어에서 모든 프로필과 게임 상태 키 검색
    const profileKeys = await kv.keys('user:*:profile');
    
    const sessionPromises = profileKeys.map(async (key) => {
      // 사용자 ID 추출 (user:userId:profile 형식에서)
      const userId = key.split(':')[1];
      
      // 프로필 데이터와 게임 상태 로드
      const [profile, gameState] = await Promise.all([
        kv.get(key),
        kv.get(`user:${userId}:game_state`)
      ]);
      
      // 게임 세션 정보 구성
      if (profile && gameState) {
        return {
          id: userId,
          username: profile.username || 'Unknown Cultivator',
          lastSaved: gameState.lastSaved || Date.now(),
          level: gameState.cultivation?.level || 1,
          fate: profile.fate || gameState.fate
        } as GameSession;
      } else if (profile) {
        // 게임 상태는 없지만 프로필은 있는 경우 (게임 시작 전)
        return {
          id: userId,
          username: profile.username || 'Unknown Cultivator',
          lastSaved: 0, // 아직 저장된 적 없음
          fate: profile.fate
        } as GameSession;
      }
      
      return null;
    });
    
    // 모든 세션 정보 수집
    const sessions = (await Promise.all(sessionPromises))
      .filter(Boolean) // 빈 세션 필터링
      .sort((a, b) => b.lastSaved - a.lastSaved); // 최근에 저장된 순서로 정렬
    
    return res.status(200).json({ sessions });
  } catch (error) {
    console.error('Error listing game sessions:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to list game sessions'
    });
  }
}
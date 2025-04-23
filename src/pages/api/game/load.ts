import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { getUserProfile } from '@modules/stats/service';
import { getUserFate } from '@modules/fate/service';
import { requireAuth } from '@middleware/auth';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // URL 파라미터에서 userId 가져오기
    let { userId } = req.query;
    
    // userId가 없으면 인증된 사용자 ID 사용
    if (!userId || typeof userId !== 'string') {
      userId = req.userId;
      
      if (!userId) {
        return res.status(400).json({ message: '사용자 ID가 필요합니다' });
      }
    }
    
    console.log(`게임 데이터 로드 시작 (사용자 ID: ${userId})`);

    // 1. 저장된 게임 상태 확인
    let gameState;
    try {
      gameState = await kv.get(`user:${userId}:game_state`);
      console.log(`게임 상태 로드 ${gameState ? '성공' : '없음'} (사용자 ID: ${userId})`);
    } catch (kvError) {
      console.error(`게임 상태 로드 실패 (사용자 ID: ${userId}):`, kvError);
      gameState = null;
    }
    
    // 2. 사용자 프로필 로드
    let profile;
    try {
      profile = await getUserProfile(userId as string);
      console.log(`프로필 로드 ${profile ? '성공' : '실패'} (사용자 ID: ${userId})`);
      
      if (!profile) {
        return res.status(404).json({ message: '사용자 프로필을 찾을 수 없습니다' });
      }
    } catch (profileError) {
      console.error(`프로필 로드 실패 (사용자 ID: ${userId}):`, profileError);
      return res.status(500).json({ message: '프로필 로드 중 오류 발생' });
    }
    
    // 3. 운명 데이터 로드
    let fateData;
    try {
      fateData = await getUserFate(userId as string);
      console.log(`운명 데이터 로드 ${fateData ? '성공' : '실패'} (사용자 ID: ${userId})`);
    } catch (fateError) {
      console.error(`운명 데이터 로드 실패 (사용자 ID: ${userId}):`, fateError);
      fateData = null;
    }
    
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
        stats: profile.stats || {
          qiGeneration: 1,
          technique: 1,
          perception: 1,
          luck: 1,
          clarity: 1
        },
        traits: profile.traits || [],
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
    
    console.log(`게임 데이터 로드 완료 (사용자 ID: ${userId})`);
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error loading game state:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : '게임 상태 로드 실패'
    });
  }
}

// 인증 미들웨어 적용
export default requireAuth(handler);
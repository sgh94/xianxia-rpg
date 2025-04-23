import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { requireAuth } from '@middleware/auth';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 요청 바디에서 userId와 게임 상태 추출
    const { gameState } = req.body;
    
    // 인증된 사용자 ID 사용
    const userId = req.userId;
    
    if (!userId) {
      return res.status(400).json({ message: '사용자 ID가 필요합니다' });
    }
    
    if (!gameState) {
      return res.status(400).json({ message: '게임 상태 데이터가 필요합니다' });
    }
    
    console.log(`게임 상태 저장 시작 (사용자 ID: ${userId})`);
    
    // 게임 상태 저장
    try {
      await kv.set(`user:${userId}:game_state`, {
        ...gameState,
        lastSaved: Date.now()
      });
      console.log(`게임 상태 저장 성공 (사용자 ID: ${userId})`);
    } catch (kvError) {
      console.error(`게임 상태 저장 실패 (사용자 ID: ${userId}):`, kvError);
      return res.status(500).json({ message: '게임 상태 저장 중 데이터베이스 오류가 발생했습니다' });
    }
    
    return res.status(200).json({
      success: true,
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving game state:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : '게임 상태 저장 중 오류가 발생했습니다'
    });
  }
}

// 인증 미들웨어 적용
export default requireAuth(handler);
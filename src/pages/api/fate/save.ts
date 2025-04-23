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
    const { fate } = req.body;
    
    // 인증된 사용자의 ID 사용 (미들웨어에서 설정됨)
    const userId = req.userId;
    
    if (!userId) {
      return res.status(400).json({ message: '사용자 ID가 없습니다' });
    }
    
    if (!fate) {
      return res.status(400).json({ message: '운명 데이터가 없습니다' });
    }
    
    console.log(`저장 중인 운명 데이터 (사용자 ID: ${userId}):`, fate);
    
    // KV 스토어에 운명 데이터 저장
    try {
      await kv.set(`user:${userId}:fate`, fate);
      console.log(`운명 데이터 저장 성공 (사용자 ID: ${userId})`);
    } catch (kvError) {
      console.error(`운명 데이터 저장 실패 (사용자 ID: ${userId}):`, kvError);
      return res.status(500).json({ message: 'KV 저장소 오류: ' + (kvError instanceof Error ? kvError.message : String(kvError)) });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving fate:', error);
    return res.status(500).json({ message: '운명 저장 중 오류 발생: ' + (error instanceof Error ? error.message : String(error)) });
  }
}

// 인증 미들웨어 적용
export default requireAuth(handler);
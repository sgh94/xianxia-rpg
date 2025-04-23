import type { NextApiRequest, NextApiResponse } from 'next';
import { createUserProfile } from '@modules/stats/service';
import { getUserFate } from '@modules/fate/service';
import { FateResult } from '@modules/fate/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, username, locale = 'ko' } = req.body;
    
    if (!userId || !username) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // 1. 유저 프로필 생성
    const profile = await createUserProfile(userId, username, locale);
    
    // 2. 사용자의 운명 데이터 확인
    const fateData = await getUserFate(userId);
    
    // 3. 운명 데이터가 있으면 프로필에 반영
    if (fateData) {
      // 현재는 서비스 로직에서 직접 처리하지 않고 클라이언트에서 처리
      // 추후 이 부분을 stats 서비스에 통합하는 것이 좋음
    }
    
    return res.status(201).json({
      success: true,
      profile,
      fateData
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

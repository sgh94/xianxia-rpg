import type { NextApiRequest, NextApiResponse } from 'next';
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
    // 인증된 사용자의 ID 사용 (미들웨어에서 설정됨)
    const userId = req.userId;
    
    if (!userId) {
      return res.status(400).json({ message: '사용자 ID가 없습니다' });
    }
    
    const fateResult = await getUserFate(userId);
    
    if (!fateResult) {
      return res.status(404).json({ message: 'Fate not found' });
    }
    
    return res.status(200).json(fateResult);
  } catch (error) {
    console.error('Error getting fate:', error);
    return res.status(500).json({ message: 'Failed to get fate' });
  }
}

// 인증 미들웨어 적용
export default requireAuth(handler);
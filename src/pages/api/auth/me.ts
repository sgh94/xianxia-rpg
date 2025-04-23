import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@middleware/auth';
import { sanitizeUser } from '@modules/auth/utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 인증 미들웨어에서 사용자 정보가 추가됨
  // 이 핸들러는 requireAuth로 래핑되어 있으므로 인증된 요청만 처리
  
  try {
    // 민감한 정보 제외하고 사용자 정보 반환
    const user = sanitizeUser(req.user);
    
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return res.status(500).json({
      success: false,
      message: '사용자 정보를 가져오는 중 오류가 발생했습니다'
    });
  }
}

// 인증이 필요한 핸들러로 래핑
export default requireAuth(handler);
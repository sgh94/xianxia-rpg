import type { NextApiRequest, NextApiResponse } from 'next';
import { createUserProfile } from '@modules/stats/service';
import { getUserFate } from '@modules/fate/service';
import { requireAuth } from '@middleware/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, locale = 'ko' } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // 인증된 사용자 ID 사용
    const userId = req.userId;
    
    if (!userId) {
      console.error('User ID is missing in the request');
      return res.status(401).json({ 
        message: '인증 정보가 유효하지 않습니다. 다시 로그인해주세요.' 
      });
    }
    
    // 1. 사용자의 운명 데이터 확인 - 먼저 확인하여 실패 가능성이 있는 작업 먼저 처리
    let fateData;
    try {
      fateData = await getUserFate(userId);
      
      if (!fateData) {
        console.warn(`No fate data found for user ${userId}`);
        return res.status(400).json({ 
          message: '게임을 시작하기 전에 운명을 선택해야 합니다.' 
        });
      }
    } catch (fateError) {
      console.error('Error fetching fate data:', fateError);
      // 운명 데이터 조회 실패 시에도 게임 생성 시도
      fateData = null;
    }
    
    // 2. 유저 프로필 생성
    let profile;
    try {
      profile = await createUserProfile(userId, username, locale);
    } catch (profileError) {
      console.error('Error creating user profile:', profileError);
      return res.status(500).json({ 
        message: '프로필 생성 중 오류가 발생했습니다. 다시 시도해주세요.' 
      });
    }
    
    // 3. 운명 데이터가 있으면 프로필에 반영
    // 현재는 서비스 로직에서 직접 처리하지 않고 클라이언트에서 처리
    // 추후 이 부분을 stats 서비스에 통합하는 것이 좋음
    
    return res.status(201).json({
      success: true,
      profile,
      fateData
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : '게임 생성 중 오류가 발생했습니다'
    });
  }
}

// 인증 미들웨어 적용 - 로그인된 사용자만 게임 생성 가능
export default requireAuth(handler);
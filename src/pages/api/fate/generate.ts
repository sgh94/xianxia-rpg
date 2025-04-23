import type { NextApiRequest, NextApiResponse } from 'next';
import { generateFate } from '@modules/fate/service';
import { FateRequest, FateResult } from '@modules/fate/types';
import { requireAuth } from '@middleware/auth';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt, locale = 'ko' } = req.body;
    
    // 인증된 사용자의 ID 사용 (미들웨어에서 설정됨)
    const userId = req.userId;
    
    if (!userId) {
      return res.status(400).json({ message: '사용자 ID가 없습니다' });
    }
    
    if (!prompt) {
      return res.status(400).json({ message: '운명 생성을 위한 설명이 필요합니다' });
    }
    
    console.log(`운명 생성 요청 (사용자 ID: ${userId}, 언어: ${locale})`);
    
    const fateResult = await generateFate({ 
      userId, 
      prompt, 
      locale 
    });
    
    console.log(`운명 생성 성공 (사용자 ID: ${userId})`);
    
    return res.status(200).json(fateResult);
  } catch (error) {
    console.error('Error generating fate:', error);
    return res.status(500).json({ 
      message: '운명 생성 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : String(error)) 
    });
  }
}

// 인증 미들웨어 적용
export default requireAuth(handler);
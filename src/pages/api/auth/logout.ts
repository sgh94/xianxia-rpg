import type { NextApiRequest, NextApiResponse } from 'next';
import { logoutUser } from '@modules/auth/service';
import { clearCookie } from '@lib/cookies';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 쿠키에서 토큰 가져오기
  const token = req.cookies.authToken;
  
  // 토큰이 없는 경우도 로그아웃 성공으로 처리
  if (!token) {
    clearCookie(res, 'authToken', {
      path: '/',
      sameSite: 'strict'
    });
    
    return res.status(200).json({
      success: true,
      message: '로그아웃 되었습니다'
    });
  }

  try {
    // 토큰 세션 삭제
    await logoutUser(token);
    
    // 쿠키 삭제
    clearCookie(res, 'authToken', {
      path: '/',
      sameSite: 'strict'
    });
    
    return res.status(200).json({
      success: true,
      message: '로그아웃 되었습니다'
    });
  } catch (error) {
    console.error('Error in logout:', error);
    
    // 오류가 발생해도 쿠키는 삭제
    clearCookie(res, 'authToken', {
      path: '/',
      sameSite: 'strict'
    });
    
    return res.status(500).json({
      success: false,
      message: '로그아웃 중 오류가 발생했습니다'
    });
  }
}
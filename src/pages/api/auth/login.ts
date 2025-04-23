import type { NextApiRequest, NextApiResponse } from 'next';
import { loginUser } from '@modules/auth/service';
import { setCookie } from '@lib/cookies';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    // 필수 필드 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 모두 입력해주세요'
      });
    }
    
    // 로그인 시도
    const result = await loginUser({
      email,
      password
    });
    
    if (!result.success) {
      return res.status(401).json(result);
    }
    
    // 토큰을 쿠키에 저장
    if (result.token) {
      setCookie(res, 'authToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60, // 24시간
        path: '/',
        sameSite: 'strict'
      });
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({
      success: false,
      message: '로그인 중 오류가 발생했습니다'
    });
  }
}
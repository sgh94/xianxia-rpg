import type { NextApiRequest, NextApiResponse } from 'next';
import { registerUser } from '@modules/auth/service';
import { setCookie } from '@lib/cookies';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, email, password } = req.body;
    
    // 필수 필드 검증
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '모든 필드를 입력해주세요'
      });
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '유효한 이메일 주소를 입력해주세요'
      });
    }
    
    // 비밀번호 복잡성 검증
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '비밀번호는 최소 6자 이상이어야 합니다'
      });
    }
    
    // 사용자 등록
    const result = await registerUser({
      username,
      email,
      password
    });
    
    if (!result.success) {
      return res.status(400).json(result);
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
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error in registration:', error);
    return res.status(500).json({
      success: false,
      message: '회원가입 중 오류가 발생했습니다'
    });
  }
}
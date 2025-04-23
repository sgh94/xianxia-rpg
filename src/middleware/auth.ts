import { NextApiRequest, NextApiResponse } from 'next';
import { verifySession, getUserById } from '@modules/auth/service';

// 인증 상태 확장하기 위한 타입 확장
declare module 'next' {
  interface NextApiRequest {
    user?: any;
    userId?: string;
    auth?: {
      isAuthenticated: boolean;
      token?: string;
    };
  }
}

// 쿠키에서 토큰 추출
function getTokenFromCookies(req: NextApiRequest): string | null {
  const { cookies } = req;
  return cookies && cookies.authToken ? cookies.authToken : null;
}

// 헤더에서 토큰 추출
function getTokenFromHeader(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

// 인증 미들웨어
export async function authMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  // 토큰 가져오기
  const token = getTokenFromHeader(req) || getTokenFromCookies(req);
  
  // 기본 인증 상태
  req.auth = {
    isAuthenticated: false,
  };
  
  if (!token) {
    return next();
  }
  
  // 세션 검증
  const { valid, userId } = await verifySession(token);
  
  if (!valid || !userId) {
    return next();
  }
  
  // 사용자 정보 가져오기
  const user = await getUserById(userId);
  
  if (!user) {
    return next();
  }
  
  // 요청에 인증 정보 추가
  req.auth.isAuthenticated = true;
  req.auth.token = token;
  req.userId = userId;
  req.user = user;
  
  return next();
}

// 인증 필요 핸들러
export function requireAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // 먼저 인증 미들웨어 실행
    await new Promise<void>((resolve) => {
      authMiddleware(req, res, resolve);
    });
    
    // 인증 확인
    if (!req.auth?.isAuthenticated) {
      return res.status(401).json({ 
        success: false, 
        message: '인증이 필요합니다.' 
      });
    }
    
    // 인증된 경우 핸들러 실행
    return handler(req, res);
  };
}

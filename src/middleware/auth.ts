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
  // 기본 인증 상태 설정
  req.auth = {
    isAuthenticated: false,
  };
  
  // 토큰 가져오기
  const token = getTokenFromHeader(req) || getTokenFromCookies(req);
  
  if (!token) {
    // 개발 환경에서 인증 우회 (테스트 목적)
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
      console.warn('Development mode: Authentication bypassed');
      req.auth.isAuthenticated = true;
      req.userId = 'dev-test-user';
      return next();
    }
    
    return next();
  }
  
  try {
    // 세션 검증
    const { valid, userId } = await verifySession(token);
    
    if (!valid || !userId) {
      return next();
    }
    
    // 사용자 정보 가져오기
    try {
      const user = await getUserById(userId);
      
      if (!user) {
        return next();
      }
      
      // 요청에 인증 정보 추가
      req.auth.isAuthenticated = true;
      req.auth.token = token;
      req.userId = userId;
      req.user = user;
    } catch (userError) {
      console.error('Failed to fetch user data:', userError);
      // 사용자 정보 가져오기 실패 시에도 기본 인증은 유지
      req.auth.isAuthenticated = true;
      req.auth.token = token;
      req.userId = userId;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    // 오류 발생 시 인증되지 않은 상태로 진행
  }
  
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
    
    // 개발 환경에서 인증 우회 (테스트 목적)
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
      console.warn('Development mode: Authentication check bypassed');
      
      if (!req.userId) {
        req.userId = 'dev-test-user';
      }
      
      if (!req.auth) {
        req.auth = { isAuthenticated: true };
      } else {
        req.auth.isAuthenticated = true;
      }
      
      return handler(req, res);
    }
    
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

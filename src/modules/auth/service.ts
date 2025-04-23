import { kv } from '@vercel/kv';
import { User, UserSession, RegisterData, LoginData, AuthResponse } from './types';
import { generateUserId, hashPassword, verifyPassword, generateToken, calculateTokenExpiry, sanitizeUser } from './utils';

// 이메일로 사용자 조회
export async function getUserByEmail(email: string): Promise<User | null> {
  const keys = await kv.keys('auth:users:*');
  
  for (const key of keys) {
    const user = await kv.get(key) as User;
    if (user && user.email.toLowerCase() === email.toLowerCase()) {
      return user;
    }
  }
  
  return null;
}

// 사용자 이름으로 사용자 조회
export async function getUserByUsername(username: string): Promise<User | null> {
  const keys = await kv.keys('auth:users:*');
  
  for (const key of keys) {
    const user = await kv.get(key) as User;
    if (user && user.username.toLowerCase() === username.toLowerCase()) {
      return user;
    }
  }
  
  return null;
}

// ID로 사용자 조회
export async function getUserById(userId: string): Promise<User | null> {
  return kv.get(`auth:users:${userId}`);
}

// 새 사용자 등록
export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  // 이메일 중복 확인
  const existingEmail = await getUserByEmail(data.email);
  if (existingEmail) {
    return {
      success: false,
      message: '이미 등록된 이메일입니다.'
    };
  }
  
  // 사용자 이름 중복 확인
  const existingUsername = await getUserByUsername(data.username);
  if (existingUsername) {
    return {
      success: false,
      message: '이미 사용 중인 사용자 이름입니다.'
    };
  }
  
  // 사용자 ID 및 비밀번호 해시 생성
  const userId = generateUserId();
  const passwordHash = hashPassword(data.password);
  
  // 사용자 생성
  const user: User = {
    id: userId,
    username: data.username,
    email: data.email,
    passwordHash,
    createdAt: Date.now(),
    lastLogin: Date.now()
  };
  
  // 사용자 정보 저장
  await kv.set(`auth:users:${userId}`, user);
  
  // 세션 토큰 생성 및 저장
  const token = generateToken();
  const expiresAt = calculateTokenExpiry();
  
  const session: UserSession = {
    userId,
    token,
    expires: expiresAt,
    createdAt: Date.now()
  };
  
  await kv.set(`auth:sessions:${token}`, session);
  
  // 인증 응답 반환
  return {
    success: true,
    user: sanitizeUser(user),
    token,
    expiresAt
  };
}

// 사용자 로그인
export async function loginUser(data: LoginData): Promise<AuthResponse> {
  // 이메일로 사용자 조회
  const user = await getUserByEmail(data.email);
  
  if (!user) {
    return {
      success: false,
      message: '이메일 또는 비밀번호가 일치하지 않습니다.'
    };
  }
  
  // 비밀번호 검증
  if (!verifyPassword(user.passwordHash, data.password)) {
    return {
      success: false,
      message: '이메일 또는 비밀번호가 일치하지 않습니다.'
    };
  }
  
  // 세션 토큰 생성 및 저장
  const token = generateToken();
  const expiresAt = calculateTokenExpiry();
  
  const session: UserSession = {
    userId: user.id,
    token,
    expires: expiresAt,
    createdAt: Date.now()
  };
  
  await kv.set(`auth:sessions:${token}`, session);
  
  // 마지막 로그인 시간 업데이트
  user.lastLogin = Date.now();
  await kv.set(`auth:users:${user.id}`, user);
  
  // 인증 응답 반환
  return {
    success: true,
    user: sanitizeUser(user),
    token,
    expiresAt
  };
}

// 토큰으로 세션 검증
export async function verifySession(token: string): Promise<{ valid: boolean; userId?: string }> {
  if (!token) {
    return { valid: false };
  }
  
  const session = await kv.get(`auth:sessions:${token}`) as UserSession;
  
  if (!session) {
    return { valid: false };
  }
  
  // 만료 시간 확인
  if (session.expires < Date.now()) {
    // 만료된 세션 삭제
    await kv.del(`auth:sessions:${token}`);
    return { valid: false };
  }
  
  return {
    valid: true,
    userId: session.userId
  };
}

// 로그아웃
export async function logoutUser(token: string): Promise<boolean> {
  if (!token) {
    return false;
  }
  
  // 토큰 세션 삭제
  await kv.del(`auth:sessions:${token}`);
  return true;
}

// 암호 변경
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResponse> {
  const user = await getUserById(userId);
  
  if (!user) {
    return {
      success: false,
      message: '사용자를 찾을 수 없습니다.'
    };
  }
  
  // 현재 비밀번호 검증
  if (!verifyPassword(user.passwordHash, currentPassword)) {
    return {
      success: false,
      message: '현재 비밀번호가 일치하지 않습니다.'
    };
  }
  
  // 새 비밀번호 해시
  const passwordHash = hashPassword(newPassword);
  
  // 사용자 정보 업데이트
  user.passwordHash = passwordHash;
  await kv.set(`auth:users:${userId}`, user);
  
  return {
    success: true,
    message: '비밀번호가 변경되었습니다.'
  };
}

import crypto from 'crypto';

// 비밀번호 해싱 (실제로는 bcrypt 같은 라이브러리 사용 권장)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// 비밀번호 검증
export function verifyPassword(storedPassword: string, suppliedPassword: string): boolean {
  const [salt, storedHash] = storedPassword.split(':');
  const hash = crypto.pbkdf2Sync(suppliedPassword, salt, 1000, 64, 'sha512').toString('hex');
  return storedHash === hash;
}

// 토큰 생성
export function generateToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

// 토큰 만료 시간 계산 (기본 24시간)
export function calculateTokenExpiry(hours: number = 24): number {
  return Date.now() + (hours * 60 * 60 * 1000);
}

// 사용자 ID 생성
export function generateUserId(): string {
  return `user_${crypto.randomBytes(8).toString('hex')}`;
}

// 인증 토큰에서 사용자 정보 제외하기
export function sanitizeUser(user: any) {
  const { passwordHash, ...sanitizedUser } = user;
  return sanitizedUser;
}

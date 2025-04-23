import { kv } from '@vercel/kv';
import { Stat, StatKey, Stats, UserProfile } from './types';

const EP_BASE = 100;
const GRADE_POWER = 1.5;

// EP 계산 함수
export function calculateEPRequired(grade: number): number {
  return Math.floor(EP_BASE * Math.pow(grade, GRADE_POWER));
}

// EP 획득량 계산
export function calculateEPGain(baseRate: number, actionMinutes: number, statValue: number): number {
  return baseRate * actionMinutes * (1 + statValue / 1000);
}

// 새 사용자 프로필 생성
export async function createUserProfile(userId: string, username: string, locale = 'ko'): Promise<UserProfile> {
  const initialStats: Stats = {};
  
  const allStats: StatKey[] = [
    'attack', 'fortitude', 'critical', 'technique', 
    'qiGeneration', 'perception', 'cultSpeed', 'clarity',
    'pillRefining', 'forging', 'alchemy', 'gemCarving',
    'luck', 'fiveElements'
  ];
  
  allStats.forEach(key => {
    initialStats[key] = {
      key,
      value: 1,
      grade: 1,
      ep: 0,
      maxEP: calculateEPRequired(1)
    };
  });
  
  const profile: UserProfile = {
    id: userId,
    username,
    locale,
    stats: initialStats,
    traits: [],
    life: 100,
    maxLife: 100,
    reincarnations: 0,
    reincarnationPoints: 0,
    achievements: []
  };
  
  await kv.set(`user:${userId}:profile`, profile);
  
  return profile;
}

// 사용자 프로필 불러오기
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return kv.get(`user:${userId}:profile`);
}

// 스탯에 EP 추가
export async function addEP(userId: string, statKey: StatKey, amount: number): Promise<Stat> {
  const profile = await getUserProfile(userId);
  
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const stat = profile.stats[statKey];
  if (!stat) {
    throw new Error(`Stat ${statKey} not found`);
  }
  
  stat.ep += amount;
  
  // 레벨업 확인
  while (stat.ep >= stat.maxEP) {
    stat.ep -= stat.maxEP;
    stat.grade += 1;
    stat.value += 1;
    stat.maxEP = calculateEPRequired(stat.grade);
  }
  
  // 프로필 저장
  await kv.set(`user:${userId}:profile`, profile);
  
  return stat;
}

// 사용자 프로필 업데이트
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const profile = await getUserProfile(userId);
  
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const updatedProfile = { ...profile, ...updates };
  
  await kv.set(`user:${userId}:profile`, updatedProfile);
  
  return updatedProfile;
}
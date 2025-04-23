import { kv } from '@vercel/kv';
import { Stat, StatKey, Stats, UserProfile } from './types';
import { FateResult } from '@modules/fate/types';
import { getUserFate } from '@modules/fate/service';

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
  
  // 운명 데이터 확인 및 적용
  try {
    const fateData = await getUserFate(userId);
    
    if (fateData) {
      // 운명에서 설정한 초기 스탯값을 적용
      if (fateData.startingStats) {
        Object.entries(fateData.startingStats).forEach(([key, value]) => {
          if (key in initialStats) {
            profile.stats[key as StatKey].value = value;
          }
        });
      }
      
      // 운명 특성 적용
      if (fateData.startingTraits && Array.isArray(fateData.startingTraits)) {
        profile.traits = [...fateData.startingTraits];
      }
      
      // 운명 이름 저장
      profile.fate = fateData.fate;
    }
  } catch (error) {
    console.error('운명 데이터 적용 중 오류 발생:', error);
    // 오류가 발생해도 기본 프로필은 생성
  }
  
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

// 운명 데이터를 기반으로 프로필 초기화
export async function initializeProfileWithFate(userId: string, fateData: FateResult): Promise<UserProfile> {
  const profile = await getUserProfile(userId);
  
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  // 운명에서 설정한 초기 스탯값을 적용
  if (fateData.startingStats) {
    Object.entries(fateData.startingStats).forEach(([key, value]) => {
      if (key in profile.stats) {
        profile.stats[key as StatKey].value = value;
      }
    });
  }
  
  // 운명 특성 적용
  if (fateData.startingTraits && Array.isArray(fateData.startingTraits)) {
    profile.traits = [...fateData.startingTraits];
  }
  
  // 운명 이름 저장
  profile.fate = fateData.fate;
  
  // 업데이트된 프로필 저장
  await kv.set(`user:${userId}:profile`, profile);
  
  return profile;
}
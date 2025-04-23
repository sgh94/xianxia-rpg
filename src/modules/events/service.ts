import { kv } from '@vercel/kv';
import { Event, EventMetadata, EventOption, EventResult, EventHistory } from './types';
import { getUserProfile, updateUserProfile } from '@modules/stats/service';
import { UserProfile } from '@modules/stats/types';

// 이벤트 메타데이터 조회
export async function getEventMetadata(eventId: string): Promise<EventMetadata | null> {
  return kv.get(`event:meta:${eventId}`);
}

// 모든 이벤트 메타데이터 조회
export async function getAllEventMetadata(): Promise<EventMetadata[]> {
  const keys = await kv.keys('event:meta:*');
  
  if (keys.length === 0) {
    return [];
  }
  
  const events = await kv.mget(...keys);
  return events.filter(Boolean) as EventMetadata[];
}

// 이벤트 텍스트 생성/조회
export async function getEventNarrative(sessionId: string): Promise<string | null> {
  return kv.get(`event:text:${sessionId}`);
}

// 이벤트 생성
export async function generateEvent(
  userId: string,
  eventId: string,
  locale: string
): Promise<Event | null> {
  const metadata = await getEventMetadata(eventId);
  
  if (!metadata) {
    throw new Error(`Event metadata not found for ${eventId}`);
  }
  
  const profile = await getUserProfile(userId);
  
  if (!profile) {
    throw new Error(`User profile not found for ${userId}`);
  }
  
  // 세션 ID 생성
  const sessionId = `${userId}-${eventId}-${Date.now()}`;
  
  // 실제 구현에서는 여기서 Claude API를 호출하여 내러티브 생성
  // 이 예제에서는 간단한 모의 데이터를 사용
  
  // 내러티브 생성 (실제로는 Claude API 사용)
  let narrative = '';
  
  if (locale === 'ko') {
    narrative = '당신은 깊은 산 속 동굴 앞에 서 있습니다. 동굴 안에서 신비로운 기운이 느껴집니다. 이 기운은 당신의 수련에 도움이 될 수도 있지만, 위험해 보이기도 합니다.';
  } else if (locale === 'en') {
    narrative = 'You stand before a cave deep in the mountains. A mysterious energy emanates from within. This energy could help your cultivation, but it also seems dangerous.';
  } else if (locale === 'zh') {
    narrative = '你站在深山洞穴前。洞穴里散发出神秘的能量。这种能量可能有助于你的修炼，但看起来也很危险。';
  }
  
  // 내러티브 저장
  await kv.set(`event:text:${sessionId}`, narrative);
  
  // 선택지 생성 (간단한 모의 데이터)
  const options: EventOption[] = [
    {
      id: 'enter_cave',
      text: locale === 'ko' ? '동굴에 들어간다' : locale === 'en' ? 'Enter the cave' : '进入洞穴',
      success: {
        probability: 0.7,
        narrative: locale === 'ko' ? '성공적으로 동굴 깊숙이 들어가 신비로운 기운을 흡수했습니다.' : 
                 locale === 'en' ? 'You successfully venture deep into the cave and absorb the mysterious energy.' : 
                 '你成功地深入洞穴，吸收了神秘的能量。',
        rewards: {
          ep: { qiGeneration: 20, perception: 10 },
          life: 5
        }
      },
      failure: {
        narrative: locale === 'ko' ? '동굴 안에서 갑자기 바위가 무너지기 시작했고, 간신히 탈출했습니다.' : 
                  locale === 'en' ? 'Rocks suddenly begin to collapse inside the cave, and you barely escape.' : 
                  '洞穴内的岩石突然开始崩塌，你勉强逃脱。',
        penalties: {
          life: -10
        }
      }
    },
    {
      id: 'observe',
      text: locale === 'ko' ? '동굴 입구에서 관찰한다' : locale === 'en' ? 'Observe from the entrance' : '在洞口观察',
      success: {
        probability: 0.9,
        narrative: locale === 'ko' ? '안전한 거리에서 동굴의 기운을 연구하여 약간의 깨달음을 얻었습니다.' : 
                 locale === 'en' ? 'From a safe distance, you study the cave\'s energy and gain some insight.' : 
                 '从安全距离研究洞穴的能量，获得一些领悟。',
        rewards: {
          ep: { clarity: 15, perception: 5 }
        }
      }
    },
    {
      id: 'leave',
      text: locale === 'ko' ? '떠난다' : locale === 'en' ? 'Leave' : '离开',
      success: {
        probability: 1.0,
        narrative: locale === 'ko' ? '더 위험을 감수할 필요가 없다고 판단하고 떠났습니다.' : 
                 locale === 'en' ? 'You decide there\'s no need to risk it and leave.' : 
                 '你决定没有必要冒险，然后离开。',
        rewards: {}
      }
    }
  ];
  
  return {
    id: eventId,
    sessionId,
    metadata,
    narrative,
    options
  };
}

// 이벤트 결과 처리
export async function resolveEvent(
  userId: string,
  sessionId: string,
  optionId: string
): Promise<EventResult> {
  // 세션 ID에서 이벤트 ID 추출
  const parts = sessionId.split('-');
  const eventId = parts[1];
  
  // 이벤트 조회
  const metadata = await getEventMetadata(eventId);
  
  if (!metadata) {
    throw new Error(`Event metadata not found for ${eventId}`);
  }
  
  // 생성된 내러티브 조회
  const narrative = await getEventNarrative(sessionId);
  
  if (!narrative) {
    throw new Error(`Event narrative not found for session ${sessionId}`);
  }
  
  // 이벤트 재생성 (실제로는 저장된 이벤트를 불러와야 함)
  const event = await generateEvent(userId, eventId, 'ko');
  
  if (!event) {
    throw new Error(`Failed to regenerate event for ${sessionId}`);
  }
  
  // 선택한 옵션 찾기
  const option = event.options.find(opt => opt.id === optionId);
  
  if (!option) {
    throw new Error(`Option ${optionId} not found in event ${eventId}`);
  }
  
  // 성공 여부 결정
  const roll = Math.random();
  const success = roll <= (option.success.probability || 1.0);
  
  // 결과 생성
  const result: EventResult = {
    success,
    narrative: success ? option.success.narrative : (option.failure?.narrative || ''),
    rewards: success ? option.success.rewards : undefined,
    penalties: !success && option.failure ? option.failure.penalties : undefined
  };
  
  // 사용자 프로필 업데이트
  const profile = await getUserProfile(userId);
  
  if (profile) {
    // 생명력 업데이트
    if (success && result.rewards?.life) {
      profile.life = Math.min(profile.maxLife, profile.life + result.rewards.life);
    } else if (!success && result.penalties?.life) {
      profile.life = Math.max(0, profile.life + result.penalties.life);
    }
    
    // 특성 추가
    if (success && result.rewards?.traits) {
      profile.traits = [...new Set([...profile.traits, ...result.rewards.traits])];
    }
    
    // 업적 추가
    if (success && result.rewards?.achievement && !profile.achievements.includes(result.rewards.achievement)) {
      profile.achievements.push(result.rewards.achievement);
    }
    
    await updateUserProfile(userId, profile);
    
    // EP 획득 처리 (별도 API 호출 필요)
  }
  
  // 이벤트 히스토리 저장
  const historyEntry: EventHistory = {
    userId,
    eventId,
    timestamp: Date.now(),
    optionId,
    result
  };
  
  await kv.lpush(`user:${userId}:event_history`, historyEntry);
  
  return result;
}
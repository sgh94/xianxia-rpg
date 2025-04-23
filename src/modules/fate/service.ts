import { kv } from '@vercel/kv';
import { FateRequest, FateResult, FateTemplate } from './types';

const DEFAULT_FATE_TEMPLATE_ID = 'default-fate';

export async function getFateTemplate(id = DEFAULT_FATE_TEMPLATE_ID): Promise<FateTemplate | null> {
  return kv.get(`fate:templates:${id}`);
}

export async function saveFateTemplate(template: FateTemplate): Promise<void> {
  await kv.set(`fate:templates:${template.id}`, template);
}

export async function generateFate(request: FateRequest): Promise<FateResult> {
  const template = await getFateTemplate();
  
  if (!template) {
    throw new Error('Fate template not found');
  }
  
  // In a real implementation, this would call Claude API
  // For now, we'll simulate it with a mock response
  const mockResponse: FateResult = {
    fate: '도사의 운명',
    description: '당신은 은둔한 산 속에서 신비로운 도를 추구하는 도사입니다. 자연과 조화를 이루며 내면의 평화를 찾아가고 있습니다.',
    startingStats: {
      qiGeneration: 5,
      clarity: 4,
      perception: 3,
      luck: 2,
      technique: 1
    },
    startingTraits: ['자연친화적', '명상가', '도술연구자']
  };
  
  // In English based on locale
  if (request.locale === 'en') {
    mockResponse.fate = 'Daoist Destiny';
    mockResponse.description = 'You are a Daoist cultivator seeking mysterious paths in secluded mountains. You live in harmony with nature while finding inner peace.';
    mockResponse.startingTraits = ['Nature Affinity', 'Meditator', 'Daoist Arts Researcher'];
  } else if (request.locale === 'zh') {
    mockResponse.fate = '道士的命运';
    mockResponse.description = '你是一位隐居在山中寻求神秘之道的道士。与自然和谐相处，寻找内心的平静。';
    mockResponse.startingTraits = ['亲近自然', '冥想者', '道术研究者'];
  }
  
  // In a real implementation, we would:
  // 1. Format the prompt using the template
  // 2. Call Claude API
  // 3. Parse the response into FateResult

  // Store the user's fate
  await kv.set(`user:${request.userId}:fate`, mockResponse);
  
  return mockResponse;
}

export async function getUserFate(userId: string): Promise<FateResult | null> {
  return kv.get(`user:${request.userId}:fate`);
}
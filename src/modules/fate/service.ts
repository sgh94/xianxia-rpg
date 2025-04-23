import { kv } from '@vercel/kv';
import { FateRequest, FateResult, FateTemplate } from './types';
import { generateTextWithGemini, fillPromptTemplate, extractJsonFromText } from '@lib/gemini';
import fs from 'fs';
import path from 'path';

const DEFAULT_FATE_TEMPLATE_ID = 'default-fate';

export async function getFateTemplate(id = DEFAULT_FATE_TEMPLATE_ID): Promise<FateTemplate | null> {
  // 먼저 KV 스토어에서 확인
  const template = await kv.get(`fate:templates:${id}`);
  
  if (template) {
    return template as FateTemplate;
  }
  
  // KV 스토어에 없으면 파일 시스템에서 로드
  try {
    const promptPath = path.join(process.cwd(), 'prompts', 'fate-template.txt');
    let promptContent;
    
    try {
      promptContent = fs.readFileSync(promptPath, 'utf-8');
    } catch (err) {
      console.warn('Template file not found, using default template');
      promptContent = "You are a Xianxia RPG fate generator.\nGenerate a fate based on this description: {{prompt}}\nRespond in JSON format with fate, description, startingStats, and startingTraits fields.";
    }
    
    const defaultTemplate: FateTemplate = {
      id: DEFAULT_FATE_TEMPLATE_ID,
      promptTemplate: promptContent,
      defaultTranslations: {
        ko: {
          title: '운명 선택',
          description: '당신의 선택이 운명을 결정합니다'
        },
        en: {
          title: 'Choose Your Fate',
          description: 'Your choices determine your destiny'
        },
        zh: {
          title: '选择你的命运',
          description: '你的选择决定你的命运'
        }
      }
    };
    
    // 템플릿을 KV 스토어에 저장
    try {
      await saveFateTemplate(defaultTemplate);
    } catch (error) {
      console.error('Failed to save template to KV store:', error);
      // Continue despite save error - we'll use the template in memory
    }
    
    return defaultTemplate;
  } catch (error) {
    console.error('템플릿 파일 로드 오류:', error);
    
    // Fallback template in case of error
    const fallbackTemplate: FateTemplate = {
      id: DEFAULT_FATE_TEMPLATE_ID,
      promptTemplate: "Generate a fate based on this description: {{prompt}}",
      defaultTranslations: {
        ko: {
          title: '운명',
          description: '당신의 운명'
        },
        en: {
          title: 'Fate',
          description: 'Your fate'
        },
        zh: {
          title: '命运',
          description: '你的命运'
        }
      }
    };
    
    return fallbackTemplate;
  }
}

export async function saveFateTemplate(template: FateTemplate): Promise<void> {
  await kv.set(`fate:templates:${template.id}`, template);
}

export async function generateFate(request: FateRequest): Promise<FateResult> {
  const template = await getFateTemplate();
  
  if (!template) {
    throw new Error('Fate template not found');
  }
  
  // 실제 환경에서는 Gemini API를 호출하여 운명 생성
  try {
    // 프롬프트 템플릿에 사용자 입력 채우기
    const prompt = fillPromptTemplate(template.promptTemplate, {
      prompt: request.prompt
    });
    
    let generatedText;
    try {
      // Gemini API 호출
      generatedText = await generateTextWithGemini(prompt, 0.7);
      
      // JSON 파싱
      const result = extractJsonFromText(generatedText);
      
      // 응답 형식 검증
      if (!result.fate || !result.description || !result.startingStats || !result.startingTraits) {
        throw new Error('Invalid response format from Gemini API');
      }
      
      // 사용자의 운명 저장
      try {
        await kv.set(`user:${request.userId}:fate`, result);
      } catch (kvError) {
        console.error('KV 저장 오류:', kvError);
        // Continue despite KV error
      }
      
      return result as FateResult;
    } catch (geminiError) {
      console.error('Gemini API 오류:', geminiError);
      throw geminiError;
    }
  } catch (error) {
    console.error('운명 생성 중 오류 발생:', error);
    
    // 오류 시 모의 데이터 반환 (실제 구현에서는 적절한 오류 처리 필요)
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
    
    // 영어 또는 중국어 응답 생성 (언어에 따라)
    if (request.locale === 'en') {
      mockResponse.fate = 'Daoist Destiny';
      mockResponse.description = 'You are a Daoist cultivator seeking mysterious paths in secluded mountains. You live in harmony with nature while finding inner peace.';
      mockResponse.startingTraits = ['Nature Affinity', 'Meditator', 'Daoist Arts Researcher'];
    } else if (request.locale === 'zh') {
      mockResponse.fate = '道士的命运';
      mockResponse.description = '你是一位隐居在山中寻求神秘之道的道士。与自然和谐相处，寻找内心的平静。';
      mockResponse.startingTraits = ['亲近自然', '冥想者', '道术研究者'];
    }
    
    // 모의 데이터 저장
    try {
      await kv.set(`user:${request.userId}:fate`, mockResponse);
    } catch (kvError) {
      console.error('KV 저장 오류:', kvError);
      // Continue despite KV error
    }
    
    return mockResponse;
  }
}

export async function getUserFate(userId: string): Promise<FateResult | null> {
  try {
    return await kv.get(`user:${userId}:fate`);
  } catch (error) {
    console.error('Fate retrieval error:', error);
    return null;
  }
}
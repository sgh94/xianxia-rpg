/**
 * Gemini API 연동을 위한 유틸리티 함수
 */

// API 설정
const API_URL = process.env.GEMINI_API_URL;
const API_KEY = process.env.GEMINI_API_KEY;

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

/**
 * Gemini API로 텍스트 생성 요청
 * @param prompt 프롬프트 텍스트
 * @param temperature 생성 다양성 설정 (0.0 ~ 1.0)
 * @returns 생성된 텍스트
 */
export async function generateTextWithGemini(
  prompt: string,
  temperature: number = 0.7
): Promise<string> {
  if (!API_URL || !API_KEY) {
    throw new Error('Gemini API 설정이 없습니다. 환경 변수를 확인하세요.');
  }

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: temperature,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API 오류: ${error}`);
    }

    const data = await response.json() as GeminiResponse;
    const generatedText = data.candidates[0]?.content.parts[0].text;

    if (!generatedText) {
      throw new Error('응답 형식이 예상과 다릅니다.');
    }

    return generatedText;
  } catch (error) {
    console.error('Gemini API 호출 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 템플릿 문자열에 변수 값을 대입하여 완성된 프롬프트 생성
 * @param template 템플릿 문자열 ({{변수명}} 형식으로 변수 위치 지정)
 * @param variables 대입할 변수 값들의 객체
 * @returns 완성된 프롬프트 문자열
 */
export function fillPromptTemplate(
  template: string,
  variables: Record<string, any>
): string {
  let filledTemplate = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    let replacementValue: string;
    
    if (typeof value === 'object') {
      replacementValue = JSON.stringify(value, null, 2);
    } else {
      replacementValue = String(value);
    }
    
    filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), replacementValue);
  }
  
  return filledTemplate;
}

/**
 * JSON 형식 문자열에서 JSON 객체만 추출
 * @param text JSON을 포함한 텍스트
 * @returns 파싱된 JSON 객체
 */
export function extractJsonFromText(text: string): any {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/;
  const match = text.match(jsonRegex);
  
  if (match) {
    const jsonString = match[1] || match[2];
    try {
      return JSON.parse(jsonString.trim());
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      throw new Error('응답에서 유효한 JSON을 찾을 수 없습니다.');
    }
  }
  
  try {
    // 전체 텍스트를 JSON으로 파싱 시도
    return JSON.parse(text.trim());
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
    throw new Error('응답에서 유효한 JSON을 찾을 수 없습니다.');
  }
}
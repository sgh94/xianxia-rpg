# Xianxia RPG

분기 내러티브와 리플레이 가능한 '런'이 특징인 Xianxia 시뮬레이션 RPG입니다.

## 프로젝트 개요

- **장르**: Xianxia 시뮬레이션 RPG (분기 내러티브 및 리플레이)
- **개발 도구**: Google Gemini API (AI 스토리, 이벤트, 밸런스 생성)
- **프론트엔드 & 배포**: Next.js (React) + Vercel
- **데이터베이스**: Vercel KV (Redis API)

## 핵심 기능

- 다국어 지원 (한국어, 영어, 중국어)
- 스텟 & EP 시스템
- 업적 및 레거시 시스템
- 환생 메커니즘
- 돌파 지원 시스템
- 동적 운명 & 이벤트 시스템

## 시작하기

### 개발 환경 설정

1. 저장소 클론
```bash
git clone https://github.com/sgh94/xianxia-rpg.git
cd xianxia-rpg
```

2. 의존성 설치
```bash
yarn install
```

3. 환경 변수 설정
`.env.example`을 복사하여 `.env.local` 파일을 생성하고 필요한 키를 입력하세요.
```bash
# Vercel KV 설정
VERCEL_KV_URL=
VERCEL_KV_TOKEN=

# Gemini API 설정
GEMINI_API_KEY=
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent

# 개발 환경에서 인증 우회하려면 아래 설정 활성화
# NODE_ENV=development
# BYPASS_AUTH=true
```

4. 개발 서버 실행
```bash
yarn dev
```

## Gemini API 설정 방법

1. [Google AI Studio](https://makersuite.google.com/) 또는 [Google Cloud Console](https://console.cloud.google.com/)에서 계정을 생성합니다.
2. Gemini API 키를 발급받습니다.
3. 발급받은 API 키를 `.env.local` 파일의 `GEMINI_API_KEY` 변수에 설정합니다.

## 프로젝트 구조

- `/src/pages` - Next.js 페이지
- `/src/components` - 재사용 가능한 UI 컴포넌트
- `/src/modules` - 게임 기능 모듈 (이벤트, 운명, 업적 등)
- `/src/lib` - 유틸리티 및 헬퍼 함수
- `/src/styles` - 전역 스타일
- `/public/locales` - 국제화 파일
- `/prompts` - Gemini API 프롬프트 템플릿

## 데이터 모델

상세한 데이터 모델은 문서에서 확인하세요.

## 문제 해결

### "게임 생성에 실패했습니다" 오류

이 오류는 다음과 같은 원인으로 발생할 수 있습니다:

1. **환경 변수 설정 문제**
   - `.env.local` 파일에 필요한 환경 변수가 올바르게 설정되었는지 확인하세요.
   - Gemini API 키와 Vercel KV 인증 정보가 유효한지 확인하세요.

2. **인증 문제**
   - 개발 환경에서는 인증 우회를 활성화할 수 있습니다:
     ```
     NODE_ENV=development
     BYPASS_AUTH=true
     ```
   - 인증 관련 오류가 발생하면 브라우저 쿠키를 지우고 다시 로그인해보세요.

3. **운명 선택 문제**
   - 게임을 시작하기 전에 운명을 먼저 선택해야 합니다.
   - `/game/fate` 페이지에서 운명을 생성하고 선택한 후 게임을 시작하세요.

4. **Vercel KV 연결 문제**
   - Vercel KV 설정이 올바른지 확인하세요.
   - 로컬 개발 시에는 Vercel CLI를 사용하여 KV 스토어에 연결해야 할 수 있습니다.

5. **개발 오류 디버깅**
   - 브라우저 콘솔 및 서버 로그를 확인하여 구체적인 오류 메시지를 찾으세요.
   - 서버 측 로그는 터미널에서, 클라이언트 측 로그는 브라우저 개발자 도구에서 확인할 수 있습니다.

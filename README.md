# Xianxia RPG

분기 내러티브와 리플레이 가능한 '런'이 특징인 Xianxia 시뮬레이션 RPG입니다.

## 프로젝트 개요

- **장르**: Xianxia 시뮬레이션 RPG (분기 내러티브 및 리플레이)
- **개발 도구**: Claude Desktop (AI 스토리, 이벤트, 밸런스 생성)
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

4. 개발 서버 실행
```bash
yarn dev
```

## 프로젝트 구조

- `/src/pages` - Next.js 페이지
- `/src/components` - 재사용 가능한 UI 컴포넌트
- `/src/modules` - 게임 기능 모듈 (이벤트, 운명, 업적 등)
- `/src/lib` - 유틸리티 및 헬퍼 함수
- `/src/styles` - 전역 스타일
- `/public/locales` - 국제화 파일
- `/prompts` - Claude API 프롬프트 템플릿

## 데이터 모델

상세한 데이터 모델은 문서에서 확인하세요.
/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'ko'], // 사용 중인 로케일 목록 예시
    defaultLocale: 'en',   // 기본 로케일 예시
    localeDetection: false, // <--- 이 값을 false 로 설정하세요.
  },
  env: {
    GEMINI_API_URL: process.env.GEMINI_API_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
};

module.exports = nextConfig;
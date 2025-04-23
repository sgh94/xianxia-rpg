/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  i18n,
  env: {
    GEMINI_API_URL: process.env.GEMINI_API_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
};

module.exports = nextConfig;
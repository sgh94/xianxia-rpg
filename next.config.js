/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  i18n,
  env: {
    CLAUDE_API_URL: process.env.CLAUDE_API_URL,
  },
};

module.exports = nextConfig;
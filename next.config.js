/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    CONTRACT_MUMBAI: process.env.CONTRACT_MUMBAI,
    WEB3STORAGE_TOKEN:process.env.WEB3STORAGE_TOKEN,
    MORALIS_API_KEY:process.env.MORALIS_API_KEY
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig

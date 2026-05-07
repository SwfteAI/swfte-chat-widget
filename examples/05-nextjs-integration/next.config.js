/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Transpile the chat widget package
  transpilePackages: ['@swfte/chat-widget'],
};

module.exports = nextConfig;

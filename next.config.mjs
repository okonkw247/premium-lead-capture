/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only process tsx/ts files so Next.js ignores legacy Express JS files in root api/
  pageExtensions: ['tsx', 'ts'],
};

export default nextConfig;

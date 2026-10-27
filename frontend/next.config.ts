import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '/**',
      },
    ],
  },
  // Silence the package-lock.json outside-repo warning on Vercel/Render
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig

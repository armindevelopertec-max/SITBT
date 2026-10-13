/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/auth/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/storage/files/:path*',
        destination: `${backendUrl}/storage/files/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

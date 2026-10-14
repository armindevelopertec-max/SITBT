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
        source: '/autenticacion/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/almacenamiento/archivos/:path*',
        destination: `${backendUrl}/api/almacenamiento/archivos/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

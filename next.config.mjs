/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-backend/:path*',
        destination: 'https://cs2skintrading.onrender.com/:path*'
      }
    ]
  }
}

export default nextConfig
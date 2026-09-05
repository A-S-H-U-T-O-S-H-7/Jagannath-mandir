// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/member-card': ['./public/memberjaga.png', './public/swarnakshetra-h.png', './public/swarnakshetra-o.png'],
    '/api/email/verification': ['./public/memberjaga.png', './public/swarnakshetra-h.png', './public/swarnakshetra-o.png'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**',
      },
      // Add any other domains you use for images
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', 
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

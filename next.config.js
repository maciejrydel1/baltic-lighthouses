/** @type {import('next').NextConfig} */
const nextConfig = {
  // Wyłącz strict mode — podwójne renderowanie w dev psuje Globe.gl
  reactStrictMode: false,
  // Zezwól na obrazki z Wikimedia
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
};

module.exports = nextConfig;

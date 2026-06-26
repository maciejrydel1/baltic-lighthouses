/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict Mode włączony — efekty uboczne w Globe3D są zabezpieczone flagami mounted
  reactStrictMode: true,
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

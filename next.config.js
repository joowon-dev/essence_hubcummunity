/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack', 'url-loader'],
    });

    return config;
  },
  async redirects() {
    return [
      {
        source: '/review',
        destination: '/blog',
        permanent: false,
      },
      {
        source: '/sopticle',
        destination: '/blog',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;

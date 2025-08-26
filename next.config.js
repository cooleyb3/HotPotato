/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: 'https://api.farcaster.xyz/miniapps/hosted-manifest/YOUR_HOSTED_MANIFEST_ID',
        permanent: false,
      },
    ];
  },
  images: {
    domains: ['hotpotatogame.vercel.app'],
  },

};

module.exports = nextConfig;

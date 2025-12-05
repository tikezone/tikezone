/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip type-check step during builds (runtime still uses TS/JS emit).
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

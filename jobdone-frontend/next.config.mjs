import withPWA from '@ducanh2912/next-pwa';

const withPWAConfig = withPWA({
  dest: 'public',
  disable: false, // Enabled in dev so we can test the install prompt
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {}
};

export default withPWAConfig(nextConfig);

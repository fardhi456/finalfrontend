// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'fardheenkp.pythonanywhere.com', // your backend
      'images.pexels.com',            // for Pexels API images
    ],
  },
};

export default nextConfig;

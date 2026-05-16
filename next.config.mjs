/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net", // Contentful CDN
      },
      {
        protocol: "https",
        hostname: "downloads.ctfassets.net", // Contentful file downloads
      },
      {
        protocol: "https",
        hostname: "img.clerk.com", // Clerk avatars
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
    ],
  },
};

export default nextConfig;

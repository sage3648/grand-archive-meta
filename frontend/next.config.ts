import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization for S3 hosted images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ga-index-public.s3.us-west-2.amazonaws.com",
      },
    ],
    // Optimize image loading performance
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Output configuration (default for Vercel)
  output: "standalone",

  // Strict mode for better development experience
  reactStrictMode: true,

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img-service-cdn-h2avfjg4bcb8a0gw.australiaeast-01.azurewebsites.net",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' *",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/embed/:provider",
        destination: "/calculator?provider=:provider",
      },
    ];
  },
};

export default nextConfig;

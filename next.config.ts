import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      // Add other image domains as needed
    ],
  },
  webpack: (config, { isServer, edge }) => {
    // For Edge Runtime (middleware), mark nodemailer and related modules as external
    if (edge) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: false,
        crypto: false,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  // Explicitly exclude nodemailer from Edge Runtime bundles
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;

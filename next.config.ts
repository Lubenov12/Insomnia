import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js"],
  },

  // Webpack configuration to handle deprecation warnings
  webpack: (config, { isServer }) => {
    // Suppress punycode deprecation warnings
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ },
      { message: /the request of a dependency is an expression/ },
    ];

    // Add fallbacks for Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        punycode: false,
      };
    }

    return config;
  },

  // Turbopack configuration (stable) - disabled for now to fix SVG loading issues
  // turbopack: {
  //   rules: {
  //     "*.svg": {
  //       loaders: ["@svgr/webpack"],
  //       as: "*.js",
  //     },
  //   },
  // },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
    imageSizes: [48, 64, 96, 128, 192, 256],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compression and optimization
  compress: true,

  // Bundle analyzer removed to reduce dependencies

  // Performance optimizations
  poweredByHeader: false,

  // Static optimization
  trailingSlash: false,

  // Headers for better caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=600",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

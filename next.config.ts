import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/terms-and-conditoin",
        destination: "/terms-and-conditions",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

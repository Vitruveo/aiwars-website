import type { NextConfig } from "next";

// @wagmi/connectors pulls in @base-org/account and @coinbase/cdp-sdk, which dynamically import the
// optional @x402/* payment packages. They are not installed and never used here, so the bundler
// must ignore them and the server must load those SDKs as plain Node modules.
const nextConfig: NextConfig = {
  images: {
    qualities: [75, 95],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840, 5120, 7680],
  },
  serverExternalPackages: ["@base-org/account", "@coinbase/cdp-sdk"],
  webpack: (config, { webpack }) => {
    config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^@x402\// }));
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;

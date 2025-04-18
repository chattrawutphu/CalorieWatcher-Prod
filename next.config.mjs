import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      rules: {
        // Option to configure client-side logging. Defaults to "error"
        loaders: ["json"],
      },
    },
  },
};

export default withPWA(nextConfig);

import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

const nextConfig: NextConfig = {
  // Keep config minimal; Cloudflare local bindings are injected via setupDevPlatform.
};

if (process.env.NODE_ENV === "development") {
  setupDevPlatform().catch((error) => {
    console.warn("Failed to initialize Cloudflare dev platform:", error);
  });
}

export default nextConfig;

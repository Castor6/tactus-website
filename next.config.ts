import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Keep config minimal; Cloudflare local bindings are injected in dev.
};

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev().catch((error) => {
    console.warn("Failed to initialize Cloudflare dev platform:", error);
  });
}

export default nextConfig;

import { cpSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const OPEN_NEXT_DIR = path.resolve(".open-next");
const OPEN_NEXT_ASSETS_DIR = path.resolve(".open-next/assets");
const PAGES_OUTPUT_DIR = path.resolve(".cloudflare/pages");

if (!existsSync(OPEN_NEXT_DIR)) {
  throw new Error("Missing .open-next directory. Run `npx @opennextjs/cloudflare build` first.");
}

if (!existsSync(OPEN_NEXT_ASSETS_DIR)) {
  throw new Error("Missing .open-next/assets directory. Build output is incomplete.");
}

rmSync(PAGES_OUTPUT_DIR, { recursive: true, force: true });
mkdirSync(PAGES_OUTPUT_DIR, { recursive: true });

// Copy OpenNext runtime modules used by worker relative imports.
cpSync(OPEN_NEXT_DIR, PAGES_OUTPUT_DIR, { recursive: true });
// Flatten static assets to Pages root.
cpSync(OPEN_NEXT_ASSETS_DIR, PAGES_OUTPUT_DIR, { recursive: true });

rmSync(path.join(PAGES_OUTPUT_DIR, "assets"), { recursive: true, force: true });
renameSync(path.join(PAGES_OUTPUT_DIR, "worker.js"), path.join(PAGES_OUTPUT_DIR, "_worker.js"));

// Generate _routes.json so Cloudflare Pages serves static assets directly
// instead of routing all requests through _worker.js.
// "exclude" takes priority over "include" in Pages routing.
const excludeRoutes = ["/_next/*"];

// Add top-level static files from the assets directory.
for (const entry of readdirSync(OPEN_NEXT_ASSETS_DIR)) {
  if (entry === "_next" || entry === "BUILD_ID") continue;
  const stat = statSync(path.join(OPEN_NEXT_ASSETS_DIR, entry));
  if (stat.isDirectory()) {
    excludeRoutes.push(`/${entry}/*`);
  } else {
    excludeRoutes.push(`/${entry}`);
  }
}

const routesJson = {
  version: 1,
  include: ["/*"],
  exclude: excludeRoutes,
};

writeFileSync(
  path.join(PAGES_OUTPUT_DIR, "_routes.json"),
  JSON.stringify(routesJson, null, 2) + "\n"
);

console.log(`Generated _routes.json with ${excludeRoutes.length} exclude rules`);
console.log(`Prepared Pages deployment output at ${PAGES_OUTPUT_DIR}`);

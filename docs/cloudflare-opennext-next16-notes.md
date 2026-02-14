# Cloudflare + OpenNext (Next.js 16) notes

Date: 2026-02-14

## Sources checked

- OpenNext Cloudflare adapter docs (Context7: `/opennextjs/opennextjs-cloudflare`)
- OpenNext docs (Context7: `/opennextjs/docs`)
- Cloudflare Pages / Wrangler docs (Cloudflare MCP search)

## Verified conclusions

1. Next.js 16 can be built with `@opennextjs/cloudflare` (current project is on `next@16.1.6`).
2. OpenNext requires an `open-next.config.ts` file (missing file blocks build).
3. OpenNext deploy flow is:
   - `opennextjs-cloudflare build`
   - `opennextjs-cloudflare deploy` (Workers)
4. For Pages configuration and bindings, `wrangler.toml` must use Pages keys such as `pages_build_output_dir`, and D1/R2 bindings can be defined in Wrangler config for Pages.
5. For Next.js 16.1+, Wrangler should be `>= 4.59.2` (project already satisfies this with `wrangler@4.65.0`).

## Implementation direction for this repo

1. Replace legacy `@cloudflare/next-on-pages` dev hooks with OpenNext dev hooks.
2. Add `open-next.config.ts`.
3. Keep Cloudflare bindings (D1/R2) in Wrangler config and align it with Pages deployment usage.
4. Build with `npx @opennextjs/cloudflare build`.
5. Deploy to Pages with Wrangler and then configure custom domain + bindings verification.

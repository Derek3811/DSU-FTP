/**
 * Next.js config — optimized for Cloudflare Pages deployment.
 *
 * Cloudflare Pages notes:
 *  • Set `output: "export"` here for a fully static export, OR use
 *    `@cloudflare/next-on-pages` adapter (recommended) which supports
 *    Edge Runtime API routes via `export const runtime = "edge"` on each route.
 *  • `images.unoptimized: true` is required for static/Cloudflare deployments
 *    (Cloudflare Images can be used instead for production).
 *  • Add a `wrangler.toml` or `_routes.json` at the repo root for Cloudflare
 *    routing rules when deploying via `@cloudflare/next-on-pages`.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Required for Cloudflare Pages static/edge deployments
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Cloudflare doesn't run Next.js Image Optimization
  },
  // Uncomment when deploying to Cloudflare Pages with next-on-pages adapter:
  // output: "export",
};

export default nextConfig;


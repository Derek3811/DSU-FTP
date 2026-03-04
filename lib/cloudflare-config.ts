/**
 * Cloudflare Pages — Edge Runtime configuration
 *
 * When deploying with `@cloudflare/next-on-pages`:
 *   1. Install:  pnpm add -D @cloudflare/next-on-pages wrangler
 *   2. Build:    npx @cloudflare/next-on-pages
 *   3. Deploy:   npx wrangler pages deploy .vercel/output/static
 *
 * All API routes (e.g. /api/nextcloud/upload) must export:
 *   export const runtime = "edge";
 *
 * This file documents the Cloudflare environment bindings for reference.
 */

export const cloudflareConfig = {
  /** Nextcloud WebDAV base URL — set in Cloudflare Pages env vars */
  NEXTCLOUD_WEBDAV_URL: process.env.NEXT_PUBLIC_NEXTCLOUD_WEBDAV_URL ?? "",
  /** Nextcloud Share API URL — set in Cloudflare Pages env vars */
  NEXTCLOUD_SHARE_URL: process.env.NEXT_PUBLIC_NEXTCLOUD_SHARE_URL ?? "",
  /** Portal base URL — used for share link generation */
  PORTAL_BASE_URL: process.env.NEXT_PUBLIC_PORTAL_BASE_URL ?? "https://portal.dsudiscovery.com",
} as const;

/**
 * Required Cloudflare Pages environment variables:
 *
 *   NEXT_PUBLIC_NEXTCLOUD_WEBDAV_URL   → https://sftp.dsudiscovery.com:8443/nextcloud-php/remote.php/dav/files/admin/
 *   NEXT_PUBLIC_NEXTCLOUD_SHARE_URL    → https://sftp.dsudiscovery.com:8443/nextcloud-php/ocs/v2.php/apps/files_sharing/api/v1/shares
 *   NEXT_PUBLIC_PORTAL_BASE_URL        → https://portal.dsudiscovery.com
 *
 * Add these in:
 *   Cloudflare Dashboard → Pages → dsu-litigation-portal → Settings → Environment variables
 */

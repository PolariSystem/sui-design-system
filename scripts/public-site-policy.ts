import { createHash } from "node:crypto";
import type { Plugin } from "vite";

/** Build-time exposure controls; these do not conceal code needed to run a browser demo. */
export function publicSitePolicy(): Plugin {
  let policy = "";
  return {
    name: "serenity-public-site-policy",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        // The small pre-paint theme script uses an exact hash, never unsafe-inline scripts.
        const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
          ([, source]) =>
            `'sha256-${createHash("sha256").update(source).digest("base64")}'`,
        );
        policy = [
          "default-src 'self'",
          `script-src 'self' ${hashes.join(" ")}`,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data:",
          "font-src 'self'",
          "connect-src 'self'",
          "object-src 'none'",
          "base-uri 'none'",
          "form-action 'none'",
        ].join("; ");
        return [
          {
            tag: "meta",
            attrs: { "http-equiv": "Content-Security-Policy", content: policy },
            injectTo: "head-prepend",
          },
        ];
      },
    },
    generateBundle: {
      order: "post",
      handler() {
        // Netlify/Cloudflare Pages understand this file; other hosts need equivalent headers.
        this.emitFile({
          type: "asset",
          fileName: "_headers",
          source: `/*\n  Content-Security-Policy: ${policy}; frame-ancestors 'none'\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n`,
        });
      },
    },
  };
}

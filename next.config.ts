import type { NextConfig } from "next";

// Security headers (FIND-004, CWE-693; SECURITY-ASSESSMENT.md §3). Applied to every route.
// CSP choices (documented in PROGRESS-LOG-BACKEND.md):
//  - default-src 'self'                     : same-origin baseline for everything
//  - script-src 'self' 'unsafe-inline'      : Next.js App Router injects inline bootstrap/flight
//                                             scripts and layout.tsx's static pre-hydration theme
//                                             script; per-request nonces would require middleware
//                                             plumbing — deferred (future hardening)
//  - style-src 'self' 'unsafe-inline'       : Tailwind v4 + Next inject inline <style> tags
//  - img-src 'self' data:                   : no external images; data: for inline assets
//  - font-src 'self' data:                  : local fonts only
//  - connect-src 'self'                     : API is same-origin
//  - frame-ancestors 'none'                 : modern clickjacking complement to X-Frame-Options
//  - object-src 'none'; base-uri 'self'; form-action 'self'
// HSTS intentionally NOT set: no HTTPS in dev — belongs at the TLS-terminating layer in
// production (README-SECURITY.md / deployment config).
//
// DEV-ONLY CSP relaxation (POST-SHIP FIX 1, 2026-10-20): `next dev` compiles client chunks
// with eval-based source maps and runs React Refresh — without 'unsafe-eval' the browser
// blocks ALL client JS in dev (pages render server-side but never hydrate: the login form's
// submit handler and every other client interaction are dead). Verified live: main-app.js
// and page chunks contain eval(); with the strict policy the browser refused to run them.
// `connect-src` additionally needs ws: in dev for the HMR websocket. Production builds
// contain no eval and keep the strict policy — the relaxation is gated on NODE_ENV, never
// shipped.
const isDev = process.env.NODE_ENV !== "production";
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      isDev ? "connect-src 'self' ws: wss:" : "connect-src 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

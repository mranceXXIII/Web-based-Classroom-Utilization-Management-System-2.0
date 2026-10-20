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
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
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

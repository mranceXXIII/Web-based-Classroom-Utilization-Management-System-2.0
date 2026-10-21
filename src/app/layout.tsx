import type { Metadata } from "next";
import { RsuFooter } from "@/components/rsu-footer";
import "./globals.css";

/* Typeface: Poppins (the legacy PHP system's font, rsuHeader.php). NOTE: this
   host cannot reach fonts.googleapis.com, so next/font/google hangs the build —
   the font is consumed through the CSS stack in globals.css instead: machines
   with Poppins installed get it locally, everything else falls back to the
   system UI font. Zero network dependency, CSP untouched. */

export const metadata: Metadata = {
  title: "Classroom Utilization Management System",
  description:
    "Romblon State University Cajidiocan Campus — Education Department. Room and venue utilization tracking.",
};

// Runs before hydration so the theme never flashes.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-bg text-text">
        {/* educLogo watermark — fixed, behind all content (rsuHeader.php body::before) */}
        <div aria-hidden="true" className="rsu-watermark" />
        <div className="flex flex-1 flex-col">{children}</div>
        <RsuFooter />
      </body>
    </html>
  );
}

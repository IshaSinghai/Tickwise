import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { Providers } from "./providers";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Tickwise — The metered API for Uniswap v4 pools & positions",
  description:
    "Near-real-time Uniswap v4 pools and positions on Ethereum and Avalanche. Sign up, get an API key, start shipping in five minutes.",
  authors: [{ name: "Doryoku Labs" }],
  icons: [{ rel: "icon", url: "/favicon.ico", type: "image/x-icon" }],
  openGraph: {
    title: "Tickwise Dex API",
    description: "Near-real-time Uniswap v4 pools and positions. Built for teams.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  /*
   * suppressHydrationWarning on <html>: THEME_INIT_SCRIPT sets data-theme on that
   * element before React hydrates, so the server-rendered markup and the client's
   * differ by exactly that one attribute, by design.
   */
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        {/*
         * First child of <body>, not a child of <head>: the App Router reconciles
         * head children during hydration, and this is the placement Next
         * documents for a pre-paint script. It still runs before any page content
         * is painted — the stylesheet in <head> is already applied by this point —
         * so there is no flash of the wrong palette.
         *
         * The attribute it sets is re-asserted by ThemeProvider on mount, because
         * React strips unrecognised attributes from <html> when it hydrates. See
         * the note there; that is what makes the theme stick, not this placement.
         */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

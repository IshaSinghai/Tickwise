import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { Providers } from "./providers";

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
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

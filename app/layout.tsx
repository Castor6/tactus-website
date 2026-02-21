import type { Metadata } from "next";
import { IBM_Plex_Mono, Playfair_Display, Source_Sans_3 } from "next/font/google";
import AuthSessionProvider from "./session-provider";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Tactus - Agent Skills Browser AI Agent",
  description: "首个支持 Agent Skills 的浏览器 AI Agent 扩展",
  icons: {
    icon: [
      { url: "/16.png", sizes: "16x16", type: "image/png" },
      { url: "/32.png", sizes: "32x32", type: "image/png" },
      { url: "/48.png", sizes: "48x48", type: "image/png" },
      { url: "/128.png", sizes: "128x128", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${playfairDisplay.variable} ${sourceSans.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}

import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Vibe Directory",
    description: "A directory of Vibe projects",
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: "https://my-first-mini-app.vercel.app/splash.png",
        aspectRatio: "1:1",
        button: {
          title: "Launch app",
          action: {
            type: "launch_frame",
            name: "Vibe projects",
            url: "https://my-first-mini-app.vercel.app",
            splashImageUrl: "https://my-first-mini-app.vercel.app/splash.png",
            splashBackgroundColor: "#FFFFFF",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta name='fc:frame' content='{"version":"next","imageUrl":"https://my-first-mini-app.vercel.app/splash.png","aspectRatio":"1:1","button":{"title":"Launch app","action":{"type":"launch_frame","name":"Vibe projects","url":"https://my-first-mini-app.vercel.app","splashImageUrl":"https://my-first-mini-app.vercel.app/splash.png","splashBackgroundColor":"#FFFFFF"}}}' />
      </head>
      <body className="bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

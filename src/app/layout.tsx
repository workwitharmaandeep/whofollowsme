import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "WhoFollowsMe — Privacy-First Instagram Analytics",
  description:
    "100% in-browser Instagram relationship & unfollower analytics. Zero server calls, zero passwords, zero ban risk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen antialiased selection:bg-violet-500/20 selection:text-violet-600 dark:selection:text-violet-300">
        <div className="ambient-glow" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

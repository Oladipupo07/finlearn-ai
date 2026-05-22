import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/contexts/AuthContext";
import { StreakProvider } from "@/contexts/StreakContext";
import GlobalChatbot from "@/components/GlobalChatbot";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AtlasLearn AI - Your Finance Tutor",
  description: "AI-powered financial literacy platform for students",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <StreakProvider>
              {children}
              <div className="fixed bottom-6 left-6 z-40 bg-card/60 backdrop-blur-lg border border-border rounded-full shadow-2xl p-1 flex items-center justify-center">
                <ThemeToggle />
              </div>
              <GlobalChatbot />
              <PWAInstallPrompt />
            </StreakProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

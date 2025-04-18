import { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Providers } from "@/components/providers/providers";
import { Toaster } from "@/components/ui/toaster";
import IOSInstallPromptWrapper from "@/components/ios-install-prompt-wrapper";
import { AppInitializer } from "@/components/app-initializer";
import Script from "next/script";
import { NutritionProvider } from "@/components/providers/nutrition-provider";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  themeColor: "#3B82F6",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "CalorieWatcher",
  description:
    "Track your daily calorie intake and nutritional information with our easy-to-use app",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "32x32",
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/apple-icon-120x120.png", sizes: "120x120", type: "image/png" }
    ],
    other: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/maskable-icon.png", sizes: "512x512", type: "image/png" }
    ]
  },
  authors: [{ name: "CalorieWatcher Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CalorieWatcher",
    startupImage: [
      {
        url: "/icons/apple-splash-2048-2732.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      },
      {
        url: "/icons/apple-splash-1668-2388.png",
        media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      },
      {
        url: "/icons/apple-splash-1536-2048.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      },
      {
        url: "/icons/apple-splash-1125-2436.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      },
      {
        url: "/icons/apple-splash-1242-2688.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      },
      {
        url: "/icons/apple-splash-828-1792.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      },
      {
        url: "/icons/apple-splash-1242-2208.png",
        media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      },
      {
        url: "/icons/apple-splash-750-1334.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      },
      {
        url: "/icons/apple-splash-640-1136.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      }
    ]
  },
  applicationName: "CalorieWatcher",
  formatDetection: {
    telephone: false,
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        <link rel="preload" href="/icons/apple-touch-icon.png" as="image" />
        <link rel="preload" href="/favicon.svg" as="image" type="image/svg+xml" />
        
        <Script 
          id="prevent-flash"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const savedTheme = localStorage.getItem('theme') || 'light';
                document.documentElement.classList.add(savedTheme);
                
                // ตั้งค่า lang attribute ตาม language ที่บันทึกไว้
                const savedLanguage = localStorage.getItem('language') || 'en';
                document.documentElement.lang = savedLanguage;
                
                document.documentElement.style.visibility = 'visible';
              })();
            `
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem 
          themes={["light", "dark", "chocolate", "sweet", "broccoli", "watermelon", "honey", "blueberry"]}
          disableTransitionOnChange
        >
          <Providers>
            <NutritionProvider>
              <div className="min-h-screen">
                {/* Theme Decorations */}
                <div className="light-emoji-1"></div>
                <div className="light-emoji-2"></div>
                <div className="light-emoji-3"></div>
                <div className="light-emoji-4"></div>
                <div className="light-sparkle-1"></div>
                <div className="light-sparkle-2"></div>
                <div className="light-sparkle-3"></div>
                <div className="light-sparkle-4"></div>
                <div className="light-cloud-1"></div>
                <div className="light-cloud-2"></div>
                <div className="light-cloud-3"></div>
                <div className="light-cloud-4"></div>
                <div className="blueberry-emoji-1"></div>
                <div className="blueberry-emoji-2"></div>
                <div className="blueberry-emoji-3"></div>
                <div className="blueberry-emoji-4"></div>
                <div className="chocolate-emoji-1"></div>
                <div className="chocolate-emoji-2"></div>
                <div className="chocolate-small-1"></div>
                <div className="chocolate-small-2"></div>
                <div className="chocolate-small-3"></div>
                <div className="chocolate-small-4"></div>
                <div className="chocolate-small-5"></div>
                <div className="chocolate-small-6"></div>
                <div className="chocolate-small-7"></div>
                <div className="chocolate-small-8"></div>
                <div className="sweet-emoji-1"></div>
                <div className="sweet-emoji-2"></div>
                <div className="sweet-small-1"></div>
                <div className="sweet-small-2"></div>
                <div className="sweet-small-3"></div>
                <div className="sweet-small-4"></div>
                <div className="sweet-small-5"></div>
                <div className="sweet-small-6"></div>
                <div className="sweet-small-7"></div>
                <div className="sweet-small-8"></div>
                <div className="broccoli-emoji-1"></div>
                <div className="broccoli-emoji-2"></div>
                <div className="broccoli-small-1"></div>
                <div className="broccoli-small-2"></div>
                <div className="broccoli-small-3"></div>
                <div className="broccoli-small-4"></div>
                <div className="watermelon-emoji-1"></div>
                <div className="watermelon-emoji-2"></div>
                <div className="honey-emoji-1"></div>
                <div className="honey-emoji-2"></div>
                <div className="honey-small-1"></div>
                <div className="honey-small-2"></div>
                {/* Dark theme decorative elements */}
                <div className="dark-glow-1"></div>
                <div className="dark-glow-2"></div>
                <div className="dark-star-1"></div>
                <div className="dark-star-2"></div>
                <div className="dark-star-3"></div>
                <div className="dark-star-4"></div>
                <AppInitializer>
                  {children}
                </AppInitializer>
              </div>
            </NutritionProvider>
            <IOSInstallPromptWrapper />
            <Toaster />
          </Providers>
        </ThemeProvider>
        
        <Script
          id="performance-optimizations"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              const links = ['/dashboard', '/history', '/meals', '/settings', '/add'];
              links.forEach(link => {
                const preloadLink = document.createElement('link');
                preloadLink.rel = 'prefetch';
                preloadLink.href = link;
                document.head.appendChild(preloadLink);
              });
              
              const preloadImages = ['/icons/icon-192x192.png', '/images/logo.png'];
              preloadImages.forEach(src => {
                const img = new Image();
                img.src = src;
              });
            `
          }}
        />
      </body>
    </html>
  );
}

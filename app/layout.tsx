import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from "sonner";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: 'マラソンフォトシステム',
  description: 'マラソンイベントのリアルタイム撮影・画像処理システム',
  applicationName: 'マラソンフォトシステム',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'マラソンフォト',
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: '#000000',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
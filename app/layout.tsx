"use client";

import './globals.css';
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Loading } from "@/components/loading";
import { useState, useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <html lang="ja">
      <body className="font-sans">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <Loading key="loading" />
          ) : (
            children
          )}
        </AnimatePresence>
        <Toaster />
      </body>
    </html>
  );
}
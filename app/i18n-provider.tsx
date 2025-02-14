"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get browser language
    const browserLang = navigator.language.split("-")[0];
    // Check if language is supported
    const supportedLang = ["ja", "en"].includes(browserLang) ? browserLang : "ja";
    // Set language
    i18n.changeLanguage(supportedLang);
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by showing a blank page until mounted
  if (!mounted) {
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
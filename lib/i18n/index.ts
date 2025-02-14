"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import jaTranslation from "./locales/ja.json";
import enTranslation from "./locales/en.json";

// Initialize i18next only if it hasn't been initialized yet
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        ja: {
          translation: jaTranslation,
        },
        en: {
          translation: enTranslation,
        },
      },
      fallbackLng: "ja",
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
      },
    });
}

export default i18n;
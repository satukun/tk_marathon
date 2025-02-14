"use client";

import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = async () => {
    const newLang = i18n.language === "ja" ? "en" : "ja";
    await i18n.changeLanguage(newLang);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
      <Switch
        id="language-mode"
        checked={i18n.language === "en"}
        onCheckedChange={toggleLanguage}
      />
      <Label htmlFor="language-mode" className="text-sm font-medium">
        {i18n.language === "ja" ? "English" : "日本語"}
      </Label>
    </div>
  );
}
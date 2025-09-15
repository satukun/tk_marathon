"use client";

import { Camera } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/page-transition";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const router = useRouter();
  const [loadingRoute, setLoadingRoute] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleNavigation = (route: string) => {
    setLoadingRoute(route);
    router.push(route);
  };

  return (
    <PageTransition>
      <main className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="ipad-container">
          <header className="mb-12 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Camera className="w-12 h-12 text-primary" />
              <h1 className="text-5xl font-bold tracking-tight">{t('common.title')}</h1>
            </div>
            <p className="text-xl text-muted-foreground">{t('common.description')}</p>
          </header>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="ipad-card">
              <CardHeader>
                <CardTitle className="text-3xl">{t('home.runnerRegistration.title')}</CardTitle>
                <CardDescription className="text-lg">{t('home.runnerRegistration.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full ipad-button" 
                  onClick={() => handleNavigation("/runner")}
                  disabled={loadingRoute !== null}
                >
                  {loadingRoute === "/runner" ? t('common.loading') : t('home.runnerRegistration.button')}
                </Button>
              </CardContent>
            </Card>

            <Card className="ipad-card">
              <CardHeader>
                <CardTitle className="text-3xl">{t('home.runnerSearch.title')}</CardTitle>
                <CardDescription className="text-lg">{t('home.runnerSearch.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full ipad-button" 
                  variant="outline"
                  onClick={() => handleNavigation("/staff/search")}
                  disabled={loadingRoute !== null}
                >
                  {loadingRoute === "/staff/search" ? t('common.loading') : t('home.runnerSearch.button')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
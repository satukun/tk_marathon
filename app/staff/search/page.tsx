"use client";

import { useState } from "react";
import { Camera, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CameraPreview } from "@/components/staff/camera-preview";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

type Runner = {
  runnerId: string;
  nickname: string;
  language: string;
  targetTime: string;
  message: string;
  upperPhrase: string;
  lowerPhrase: string;
};

type View = "search" | "camera" | "confirming" | "complete";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

const runnerInfoVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

export default function StaffSearchPage() {
  const [searchId, setSearchId] = useState("");
  const [currentView, setCurrentView] = useState<View>("search");
  const [runner, setRunner] = useState<Runner | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { t, i18n } = useTranslation();

  const searchRunner = async () => {
    if (!searchId.trim()) {
      toast.error(t('search.error.emptyId'));
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/runners/${searchId}`);
      if (!response.ok) throw new Error(t('search.error.notFound'));
      
      const data = await response.json();
      setRunner(data);
      toast.success(t('search.success.found'));
    } catch (error) {
      toast.error(t('search.error.notFound'), {
        description: t('search.error.checkId'),
      });
      setRunner(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePhotoCapture = async (imageUrl: string) => {
    setCapturedImage(imageUrl);
    setCurrentView("confirming");
    
    // 3秒後に完了画面に遷移
    setTimeout(() => {
      setCurrentView("complete");
    }, 3000);
  };

  const handleRetake = () => {
    setCurrentView("camera");
    setCapturedImage(null);
  };

  const handleNewSearch = () => {
    setCurrentView("search");
    setSearchId("");
    setCapturedImage(null);
    setRunner(null);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <main className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
          <header className="mb-8 flex-shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Camera className="w-6 h-6" />
                <span className="text-lg font-semibold">{t('common.title')}</span>
              </Link>
            </div>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">{t('search.title')}</h1>
              <div className="space-x-2">
                {currentView !== "search" && (
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentView(currentView === "complete" ? "camera" : "search")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('common.back')}
                  </Button>
                )}
                <Link href="/" passHref>
                  <Button variant="ghost">{t('common.backToTop')}</Button>
                </Link>
              </div>
            </div>
          </header>

          <div className="max-w-4xl mx-auto flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {currentView === "search" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('search.title')}</CardTitle>
                        <CardDescription>{t('search.form.runnerId.label')}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-4">
                          <Input 
                            placeholder={t('search.form.runnerId.placeholder')}
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className="flex-1"
                            disabled={isSearching}
                          />
                          <Button 
                            onClick={searchRunner}
                            disabled={isSearching || !searchId.trim()}
                          >
                            {isSearching ? (
                              <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                {t('common.loading')}
                              </>
                            ) : (
                              <>
                                <Search className="w-4 h-4 mr-2" />
                                {t('common.search')}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <AnimatePresence mode="wait">
                      {runner && (
                        <motion.div
                          key={runner.runnerId}
                          variants={runnerInfoVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          <Card>
                            <CardHeader>
                              <CardTitle>{t('search.result.title')}</CardTitle>
                              <CardDescription>
                                {t('search.result.description', { id: runner.runnerId })}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                      {t('search.result.fields.nickname')}
                                    </p>
                                    <p className="text-lg">{runner.nickname}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                      {t('search.result.fields.targetTime')}
                                    </p>
                                    <p className="text-lg">{runner.targetTime}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                      {t('search.result.fields.language')}
                                    </p>
                                    <p className="text-lg">
                                      {runner.language === "en" 
                                        ? t('registration.form.language.english')
                                        : t('registration.form.language.japanese')}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                      {t('search.result.fields.message')}
                                    </p>
                                    <p className="text-lg">{runner.message}</p>
                                  </div>
                                </div>

                                <div className="space-y-2 border-t pt-4">
                                  <p className="text-sm font-medium text-muted-foreground">
                                    {t('registration.confirmation.generatedMessage')}
                                  </p>
                                  <div className="space-y-1">
                                    <p className="text-lg">{runner.upperPhrase}</p>
                                    <p className="text-lg">{runner.lowerPhrase}</p>
                                  </div>
                                </div>

                                <Button
                                  className="w-full"
                                  size="lg"
                                  onClick={() => setCurrentView("camera")}
                                >
                                  <Camera className="w-4 h-4 mr-2" />
                                  {t('search.camera.button.start')}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {currentView === "camera" && runner && (
                  <CameraPreview
                    autoInit={true}
                    runnerId={runner.runnerId}
                    onPhotoCapture={handlePhotoCapture}
                  />
                )}

                {currentView === "confirming" && runner && capturedImage && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('search.confirming.title')}</CardTitle>
                      <CardDescription>{t('search.confirming.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
                          <p className="text-lg font-semibold">{t('search.confirming.processing')}</p>
                          <p className="text-sm text-muted-foreground">{t('search.confirming.wait')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentView === "complete" && runner && capturedImage && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('search.complete.title')}</CardTitle>
                      <CardDescription>{t('search.complete.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-4">
                          <p className="text-3xl font-bold text-center">{runner.nickname}</p>
                          <div className="text-3xl text-center space-y-2">
                            <p>{runner.upperPhrase}</p>
                            <p>{runner.lowerPhrase}</p>
                          </div>
                          <p className="text-3xl text-center">
                            {t('search.complete.targetTime').replace('{time}', runner.targetTime)}
                          </p>
                        </div>
                        <div>
                          <img
                            src={capturedImage}
                            alt={t('search.complete.photoAlt')}
                            className="w-full rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleRetake}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {t('search.camera.button.retake')}
                        </Button>
                        <Button
                          variant="default"
                          className="w-full"
                          onClick={handleNewSearch}
                        >
                          <Search className="w-4 h-4 mr-2" />
                          {t('search.complete.newSearch')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
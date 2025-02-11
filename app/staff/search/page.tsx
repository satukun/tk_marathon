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

  const searchRunner = async () => {
    if (!searchId.trim()) {
      toast.error("ランナーIDを入力してください");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/runners/${searchId}`);
      if (!response.ok) throw new Error("ランナーが見つかりません");
      
      const data = await response.json();
      setRunner(data);
      toast.success("ランナーを見つけました！");
    } catch (error) {
      toast.error("ランナーが見つかりません", {
        description: "IDを確認して再度お試しください",
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
      <main className="min-h-screen bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Camera className="w-6 h-6" />
                <span className="text-lg font-semibold">マラソン写真システム</span>
              </Link>
            </div>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">ランナー検索</h1>
              <div className="space-x-2">
                {currentView !== "search" && (
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentView(currentView === "complete" ? "camera" : "search")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    戻る
                  </Button>
                )}
                <Link href="/" passHref>
                  <Button variant="ghost">トップに戻る</Button>
                </Link>
              </div>
            </div>
          </header>

          <div className="max-w-4xl mx-auto">
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
                        <CardTitle>ランナー検索</CardTitle>
                        <CardDescription>ランナーIDを入力してください</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-4">
                          <Input 
                            placeholder="ランナーIDを入力" 
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
                                検索中...
                              </>
                            ) : (
                              <>
                                <Search className="w-4 h-4 mr-2" />
                                検索
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
                              <CardTitle>ランナー情報</CardTitle>
                              <CardDescription>ランナー {runner.runnerId} の詳細情報</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">ニックネーム</p>
                                    <p className="text-lg">{runner.nickname}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">目標タイム</p>
                                    <p className="text-lg">{runner.targetTime}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">表示言語</p>
                                    <p className="text-lg">{runner.language === "en" ? "英語" : "日本語"}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">メッセージ</p>
                                    <p className="text-lg">{runner.message}</p>
                                  </div>
                                </div>

                                <div className="space-y-2 border-t pt-4">
                                  <p className="text-sm font-medium text-muted-foreground">生成されたメッセージ</p>
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
                                  撮影を開始する
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
                      <CardTitle>写真を確認中</CardTitle>
                      <CardDescription>写真を処理しています...</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
                          <p className="text-lg font-semibold">写真を確認中...</p>
                          <p className="text-sm text-muted-foreground">しばらくお待ちください</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentView === "complete" && runner && capturedImage && (
                  <Card>
                    <CardHeader>
                      <CardTitle>撮影完了</CardTitle>
                      <CardDescription>写真の確認</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-4">
                          <p className="text-3xl font-bold text-center">{runner.nickname}さん</p>
                          <div className="text-3xl text-center space-y-2">
                            <p>{runner.upperPhrase}</p>
                            <p>{runner.lowerPhrase}</p>
                          </div>
                          <p className="text-3xl text-center">目標タイム: {runner.targetTime}</p>
                        </div>
                        <div>
                          <img
                            src={capturedImage}
                            alt="撮影した写真"
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
                          撮り直す
                        </Button>
                        <Button
                          variant="default"
                          className="w-full"
                          onClick={handleNewSearch}
                        >
                          <Search className="w-4 h-4 mr-2" />
                          新しいランナーを検索
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
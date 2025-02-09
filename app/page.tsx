"use client";

import { Camera } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/page-transition";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [loadingRoute, setLoadingRoute] = useState<string | null>(null);

  const handleNavigation = (route: string) => {
    setLoadingRoute(route);
    router.push(route);
  };

  return (
    <PageTransition>
      <main className="min-h-screen bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Camera className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight">マラソン写真システム</h1>
            </div>
            <p className="text-muted-foreground">マラソンイベントのリアルタイム撮影・画像処理システム</p>
          </header>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>ランナー登録</CardTitle>
                <CardDescription>マラソン参加者の方はこちら</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => handleNavigation("/runner")}
                  disabled={loadingRoute !== null}
                >
                  {loadingRoute === "/runner" ? "読み込み中..." : "登録画面へ"}
                </Button>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle>カメラ操作</CardTitle>
                <CardDescription>撮影スタッフの方はこちら</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => handleNavigation("/staff/camera")}
                  disabled={loadingRoute !== null}
                >
                  {loadingRoute === "/staff/camera" ? "読み込み中..." : "カメラ操作へ"}
                </Button>
              </CardContent>
            </Card> */}

            <Card>
              <CardHeader>
                <CardTitle>ランナー検索</CardTitle>
                <CardDescription>写真確認・検索はこちら</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleNavigation("/staff/search")}
                  disabled={loadingRoute !== null}
                >
                  {loadingRoute === "/staff/search" ? "読み込み中..." : "検索画面へ"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
"use client";

import { Camera } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageTransition } from "@/components/page-transition";

export default function StaffPage() {
  return (
    <PageTransition>
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
              <h1 className="text-3xl font-bold">スタッフ画面</h1>
              <Link href="/" passHref>
                <Button variant="ghost">トップに戻る</Button>
              </Link>
            </div>
          </header>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ランナー検索</CardTitle>
                <CardDescription>ランナーIDで検索してください</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/staff/search" passHref>
                  <Button className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    検索画面へ
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
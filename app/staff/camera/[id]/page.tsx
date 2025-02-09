"use client";

import { Camera } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CameraPreview } from "@/components/staff/camera-preview";
import { PageTransition } from "@/components/page-transition";

export default function CameraPage({ params }: { params: { id: string } }) {
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
              <h1 className="text-3xl font-bold">ランナー撮影</h1>
              <div className="space-x-2">
                <Link href="/staff/search" passHref>
                  <Button variant="outline">検索に戻る</Button>
                </Link>
                <Link href="/" passHref>
                  <Button variant="ghost">トップに戻る</Button>
                </Link>
              </div>
            </div>
          </header>

          <div className="max-w-4xl mx-auto">
            <CameraPreview autoInit={true} runnerId={params.id} />
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
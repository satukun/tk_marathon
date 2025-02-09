"use client";

import { Camera, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageTransition } from "@/components/page-transition";

export default function CompletePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('image');

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `runner_${params.id}_photo.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
              <h1 className="text-3xl font-bold">写真完成</h1>
              <div className="space-x-2">
                <Link href={`/staff/camera/${params.id}`} passHref>
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    撮影に戻る
                  </Button>
                </Link>
                <Link href="/" passHref>
                  <Button variant="ghost">トップに戻る</Button>
                </Link>
              </div>
            </div>
          </header>

          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>完成した写真</CardTitle>
                <CardDescription>ランナー {params.id} の写真が完成しました</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {imageUrl ? (
                  <>
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt="完成した写真"
                        className="w-full h-auto"
                      />
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      写真をダウンロード
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    写真が見つかりません
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
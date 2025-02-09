import { Camera } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
      <div className="text-center">
        <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-8">ページが見つかりません</p>
        <Link href="/" passHref>
          <Button>トップページに戻る</Button>
        </Link>
      </div>
    </main>
  );
}
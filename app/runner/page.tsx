"use client";

import { RunnerRegistrationForm } from "@/components/runner/registration-form";
import { Camera } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";

export default function RunnerPage() {
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
              <h1 className="text-3xl font-bold">ランナー登録</h1>
              <Link href="/" passHref>
                <Button variant="ghost">トップに戻る</Button>
              </Link>
            </div>
          </header>

          <div className="max-w-2xl mx-auto">
            <RunnerRegistrationForm />
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  nickname: z.string().min(1, "ニックネームは1文字以上で入力してください"),
  language: z.string(),
  targetTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "時間は HH:MM:SS 形式で入力してください"),
  message: z.string(),
});

const messages = [
  "初挑戦！完走するぞ！",
  "自己ベストを更新するぞ！",
  "東京の街を走ることを楽しみます",
  "他の国のランナーたちと交流しながら走るのが楽しみです。"
] as const;

type RegistrationStep = "input" | "confirm" | "complete";

export function RunnerRegistrationForm() {
  const [step, setStep] = useState<RegistrationStep>("input");
  const [runnerId, setRunnerId] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      language: "ja",
      targetTime: "04:00:00",
      message: messages[0],
    },
  });

  const handleConfirm = form.handleSubmit(async (values) => {
    try {
      setIsRegistering(true);
      const response = await fetch("/api/runners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("登録に失敗しました");
      }

      const data = await response.json();
      setRunnerId(data.runnerId);
      setStep("complete");
      toast.success("ランナー登録が完了しました");
    } catch (error) {
      console.error("登録エラー:", error);
      toast.error("登録に失敗しました", {
        description: "もう一度お試しください",
      });
      setStep("input");
    } finally {
      setIsRegistering(false);
    }
  });

  if (step === "complete") {
    return (
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <CardTitle>登録完了</CardTitle>
          <CardDescription>ランナー登録が完了しました</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">あなたのランナーID</p>
            <p className="text-2xl font-bold">{runnerId}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>このIDは写真撮影時に必要となります。</p>
            <p>必ず控えておいてください。</p>
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              form.reset();
              setStep("input");
            }}
          >
            新しい登録へ
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "confirm") {
    const values = form.getValues();
    return (
      <Card>
        <CardHeader>
          <CardTitle>入力内容の確認</CardTitle>
          <CardDescription>以下の内容で登録を行います</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <p className="text-sm font-medium text-muted-foreground">ニックネーム</p>
              <p className="col-span-2">{values.nickname}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <p className="text-sm font-medium text-muted-foreground">表示言語</p>
              <p className="col-span-2">{values.language === "ja" ? "日本語" : "英語"}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <p className="text-sm font-medium text-muted-foreground">目標タイム</p>
              <p className="col-span-2">{values.targetTime}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <p className="text-sm font-medium text-muted-foreground">意気込み</p>
              <p className="col-span-2">{values.message}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep("input")}
              disabled={isRegistering}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              修正する
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleConfirm}
              disabled={isRegistering}
            >
              {isRegistering ? "登録中..." : "登録する"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ランナー登録</CardTitle>
        <CardDescription>マラソンイベントの参加情報を登録してください</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => setStep("confirm"))} className="space-y-6">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ニックネーム</FormLabel>
                  <FormControl>
                    <Input placeholder="ニックネームを入力" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>表示言語</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="言語を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="en">英語</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>目標タイム</FormLabel>
                  <FormControl>
                    <Input placeholder="HH:MM:SS" {...field} />
                  </FormControl>
                  <FormDescription>目標完走時間を入力してください（例：04:00:00）</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>意気込み</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="意気込みを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {messages.map((message) => (
                        <SelectItem key={message} value={message}>
                          {message}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">確認画面へ</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
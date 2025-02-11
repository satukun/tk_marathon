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
import messagesJa from "@/data/messages-array-ja";
import messagesEn from "@/data/messages-array-en";

const formSchema = z.object({
  nickname: z.string().min(1, "ニックネームは1文字以上で入力してください"),
  language: z.string(),
  targetTime: z.string(),
  targetTimeNumber: z.number().min(1).max(3),
  message: z.string(),
  messageNumber: z.number().min(1).max(5),
  upperPhrase: z.string(),
  lowerPhrase: z.string(),
});

const messages = [
  { id: 1, text: "初挑戦！完走するぞ！" },
  { id: 2, text: "自己ベストを更新するぞ！" },
  { id: 3, text: "東京の街を走ることを楽しみます" },
  { id: 4, text: "他の国のランナーたちと交流しながら走るのが楽しみです。" },
  { id: 5, text: "走ることを通じて社会に貢献したい" }
] as const;

const targetTimes = [
  { id: 1, text: "2時間台～3時間30分", value: "02:00:00-03:30:00" },
  { id: 2, text: "3時間30分～5時間", value: "03:30:00-05:00:00" },
  { id: 3, text: "5時間～", value: "05:00:00-06:00:00" }
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
      targetTime: targetTimes[1].value,
      targetTimeNumber: targetTimes[1].id,
      message: messages[0].text,
      messageNumber: messages[0].id,
      upperPhrase: "",
      lowerPhrase: "",
    },
  });

  const generateMessages = (language: string, messageNumber: number, targetTimeNumber: number) => {
    try {
      const messagesArray = language === "ja" ? messagesJa : messagesEn;
      const messageObj = messagesArray[messageNumber - 1];
      
      if (!messageObj) {
        console.error('Message object not found:', { messageNumber, targetTimeNumber });
        return { upperPhrase: "", lowerPhrase: "" };
      }

      const upperPhrase = messageObj.initial[Math.floor(Math.random() * messageObj.initial.length)];
      
      const timeArray = messageObj.time[targetTimeNumber - 1];
      if (!timeArray || !timeArray.length) {
        console.error('Time array not found:', { messageNumber, targetTimeNumber });
        return { upperPhrase, lowerPhrase: "" };
      }

      const lowerPhrase = timeArray[Math.floor(Math.random() * timeArray.length)];

      return { upperPhrase, lowerPhrase };
    } catch (error) {
      console.error('Error generating messages:', error);
      return { upperPhrase: "", lowerPhrase: "" };
    }
  };

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
    const selectedTime = targetTimes.find(t => t.value === values.targetTime);

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
              <p className="col-span-2">{selectedTime?.text}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <p className="text-sm font-medium text-muted-foreground">意気込み</p>
              <p className="col-span-2">{values.message}</p>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-2">生成されたメッセージ</p>
              <p className="text-lg mb-2">{values.upperPhrase}</p>
              <p className="text-lg">{values.lowerPhrase}</p>
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const { upperPhrase, lowerPhrase } = generateMessages(
      values.language,
      values.messageNumber,
      values.targetTimeNumber
    );
    
    form.setValue('upperPhrase', upperPhrase);
    form.setValue('lowerPhrase', lowerPhrase);
    
    setStep("confirm");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ランナー登録</CardTitle>
        <CardDescription>マラソンイベントの参加情報を登録してください</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <Select 
                    onValueChange={(value) => {
                      const selectedTime = targetTimes.find(t => t.value === value);
                      if (selectedTime) {
                        form.setValue('targetTime', value);
                        form.setValue('targetTimeNumber', selectedTime.id);
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="目標タイムを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {targetTimes.map((time) => (
                        <SelectItem key={time.id} value={time.value}>
                          {time.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select 
                    onValueChange={(value) => {
                      const selectedMessage = messages.find(m => m.text === value);
                      if (selectedMessage) {
                        form.setValue('message', value);
                        form.setValue('messageNumber', selectedMessage.id);
                      }
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="意気込みを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {messages.map((message) => (
                        <SelectItem key={message.id} value={message.text}>
                          {message.text}
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
import { NextResponse } from "next/server";
import { z } from "zod";
import { addRunner } from "@/lib/supabase";

const runnerSchema = z.object({
  nickname: z.string().min(1, "ニックネームは1文字以上で入力してください"),
  language: z.string(),
  targetTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "時間は HH:MM:SS 形式で入力してください"),
  message: z.string(),
});

function generateRunnerId(): string {
  // 00000から99999までのランダムな数字を生成
  const id = Math.floor(Math.random() * 100000);
  // 5桁になるように0埋め
  return id.toString().padStart(5, '0');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const runner = runnerSchema.parse(body);
    const runnerId = generateRunnerId();
    
    await addRunner({
      runner_id: runnerId,
      nickname: runner.nickname,
      language: runner.language,
      target_time: runner.targetTime,
      message: runner.message,
    });

    return NextResponse.json({ success: true, runnerId }, { status: 201 });
  } catch (error) {
    console.error("ランナー登録エラー:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "ランナーの登録に失敗しました" },
      { status: 500 }
    );
  }
}
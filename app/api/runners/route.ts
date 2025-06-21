import { NextResponse } from "next/server";
import { z } from "zod";
import { addRunner } from "@/lib/supabase";

const runnerSchema = z.object({
  nickname: z.string().min(1, "ニックネームは1文字以上で入力してください"),
  language: z.string(),
  targetTime: z.string(),
  targetTimeNumber: z.number().min(1).max(3),
  message: z.string(),
  messageNumber: z.number().min(1).max(5),
  upperPhrase: z.string(),
  lowerPhrase: z.string(),
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
      target_time_number: runner.targetTimeNumber,
      message: runner.message,
      message_number: runner.messageNumber,
      upper_phrase: runner.upperPhrase,
      lower_phrase: runner.lowerPhrase,
    });

    return NextResponse.json({ success: true, runnerId }, { status: 201 });
  } catch (error) {
    console.error("参加者登録エラー:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "参加者の登録に失敗しました" },
      { status: 500 }
    );
  }
}
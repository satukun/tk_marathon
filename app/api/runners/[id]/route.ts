import { NextResponse } from "next/server";
import { getRunner } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const runner = await getRunner(params.id);

    if (!runner) {
      return NextResponse.json(
        { error: "ランナーが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      runnerId: runner.runner_id,
      nickname: runner.nickname,
      language: runner.language,
      targetTime: runner.target_time,
      message: runner.message,
      upperPhrase: runner.upper_phrase,
      lowerPhrase: runner.lower_phrase,
      createdAt: runner.created_at
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Fetch runner error:", error);
    }
    
    return NextResponse.json(
      { error: "ランナー情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}
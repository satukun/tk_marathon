import { NextResponse } from "next/server";
import { getRunner, updateRunner } from "@/lib/supabase";

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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { age, gender } = body;

    if (!gender) {
      return NextResponse.json(
        { error: "性別の情報が必要です" },
        { status: 400 }
      );
    }

    // 年齢グループの判定
    let ageGroup = '80-';
    if (age < 20) ageGroup = '10-19';
    else if (age < 30) ageGroup = '20-29';
    else if (age < 40) ageGroup = '30-39';
    else if (age < 50) ageGroup = '40-49';
    else if (age < 60) ageGroup = '50-59';
    else if (age < 70) ageGroup = '60-69';
    else if (age < 80) ageGroup = '70-79';

    // ランナーの存在確認
    const runner = await getRunner(params.id);
    if (!runner) {
      return NextResponse.json(
        { error: "ランナーが見つかりません" },
        { status: 404 }
      );
    }

    await updateRunner(params.id, {
      age_group: ageGroup,
      gender: gender.toLowerCase()
    });

    return NextResponse.json({ 
      success: true,
      ageGroup,
      gender: gender.toLowerCase()
    });
  } catch (error) {
    console.error("Update runner error:", error);
    return NextResponse.json(
      { error: "ランナー情報の更新に失敗しました" },
      { status: 500 }
    );
  }
}
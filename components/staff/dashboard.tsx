"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Camera as CameraIcon } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

type Runner = {
  runnerId: string;
  nickname: string;
  language: string;
  targetTime: string;
  message: string;
};

export function StaffDashboard() {
  const [searchId, setSearchId] = useState("");
  const [runner, setRunner] = useState<Runner | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    // カメラの初期化
    initializeCamera();
    return () => {
      // コンポーネントのクリーンアップ時にカメラを停止
      stopCamera();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
          toast.success("カメラの準備が完了しました");
        };
      }
    } catch (error) {
      console.error('カメラの初期化エラー:', error);
      toast.error("カメラの初期化に失敗しました", {
        description: "カメラへのアクセスを許可してください"
      });
      setIsCameraReady(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraReady(false);
    }
  };

  const searchRunner = async () => {
    try {
      const response = await fetch(`/api/runners/${searchId}`);
      if (!response.ok) throw new Error("ランナーが見つかりません");
      
      const data = await response.json();
      setRunner(data);
      toast.success("ランナーを見つけました！");
    } catch (error) {
      toast.error("ランナーが見つかりません", {
        description: "IDを確認して再度お試しください",
      });
      setRunner(null);
    }
  };

  const startCapture = async () => {
    if (!runner || !isCameraReady) return;

    setIsCapturing(true);
    setCountdown(10);
    setCapturedImage(null);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          captureImage();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    toast.success("撮影を開始します", {
      description: "カウントダウンが始まります",
    });
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageUrl);
      setIsCapturing(false);
      toast.success("撮影完了！");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ランナー検索</CardTitle>
          <CardDescription>ランナーIDで検索してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="ランナーIDを入力"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
            <Button onClick={searchRunner}>
              <Search className="w-4 h-4 mr-2" />
              検索
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>カメラプレビュー</CardTitle>
          <CardDescription>
            {isCameraReady ? "撮影の準備ができています" : "カメラを初期化中..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden">
            {isCameraReady ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <CameraIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg opacity-75">カメラを初期化中...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {runner && (
        <Card>
          <CardHeader>
            <CardTitle>ランナー情報</CardTitle>
            <CardDescription>ランナー {runner.runnerId} の詳細情報</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ニックネーム</p>
                  <p className="text-lg">{runner.nickname}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">目標タイム</p>
                  <p className="text-lg">{runner.targetTime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">表示言語</p>
                  <p className="text-lg">{runner.language === "en" ? "英語" : "日本語"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">メッセージ</p>
                  <p className="text-lg">{runner.message}</p>
                </div>
              </div>

              {isCapturing && (
                <div className="space-y-2">
                  <Progress value={(10 - countdown) * 10} />
                  <p className="text-center text-lg font-semibold">
                    {countdown}秒後に撮影します
                  </p>
                </div>
              )}

              {capturedImage && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">撮影した画像</p>
                  <img
                    src={capturedImage}
                    alt="撮影画像"
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={startCapture}
                disabled={isCapturing || !isCameraReady}
              >
                <CameraIcon className="w-4 h-4 mr-2" />
                {!isCameraReady ? "カメラを初期化中..." : isCapturing ? "撮影準備中..." : "撮影開始"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
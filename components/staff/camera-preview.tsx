"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, RefreshCcw, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CameraPreviewProps {
  autoInit?: boolean;
  runnerId: string;
  onPhotoCapture?: (imageUrl: string) => void;
}

export function CameraPreview({ autoInit = false, runnerId = "", onPhotoCapture }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [autoTransition, setAutoTransition] = useState(false);

  const initCamera = async (deviceId?: string) => {
    try {
      setIsInitializing(true);
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });
        await videoRef.current.play();
        setIsCameraReady(true);
        setPermissionDenied(false);
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        
        if (!selectedDevice && videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
        
        toast.success("カメラの準備ができました");
      }
    } catch (error) {
      console.error("カメラの初期化エラー:", error);
      if ((error as Error).name === 'NotAllowedError') {
        setPermissionDenied(true);
        toast.error("カメラへのアクセスが拒否されました", {
          description: "設定からカメラへのアクセスを許可してください"
        });
      } else {
        toast.error("カメラの初期化に失敗しました", {
          description: "別のカメラを試すか、ページを再読み込みしてください"
        });
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraReady(false);
      toast.success("カメラを停止しました");
    }
  };

  const startCapture = () => {
    if (!isCameraReady) {
      toast.error("カメラが準備できていません");
      return;
    }

    setIsCapturing(true);
    setCountdown(5);
    setCapturedImage(null);

    toast.success("撮影を開始します", {
      description: "カウントダウンが始まります"
    });

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
  };

  const captureImage = () => {
    setIsCapturing(false);
    setIsAnalyzing(true);

    if (!videoRef.current || !canvasRef.current) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoRef.current.videoWidth;
    tempCanvas.height = videoRef.current.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx && videoRef.current) {
      tempCtx.drawImage(videoRef.current, 0, 0);
      const imageUrl = tempCanvas.toDataURL('image/jpeg');
      setCapturedImage(imageUrl);

      if (autoTransition) {
        // 自動遷移の場合は即座に写真を送信
        onPhotoCapture?.(imageUrl);
      } else {
        // 手動遷移の場合は分析中の表示のみ
        setTimeout(() => {
          setIsAnalyzing(false);
          toast.success("撮影完了！");
        }, 3000);
      }
    }
  };

  const retakePhoto = async () => {
    try {
      setCapturedImage(null);
      setIsCapturing(false);
      setIsAnalyzing(false);
      await initCamera(selectedDevice);
      toast.success("撮影をやり直します");
    } catch (error) {
      console.error("カメラの再初期化エラー:", error);
      toast.error("カメラの再起動に失敗しました");
    }
  };

  useEffect(() => {
    if (autoInit) {
      initCamera();
    }
  }, [autoInit]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>カメラプレビュー</CardTitle>
        <CardDescription>
          {!runnerId ? "ランナーを検索してください" :
           isCameraReady ? "撮影の準備ができています" : 
           permissionDenied ? "カメラへのアクセスが拒否されています" : 
           isInitializing ? "カメラを初期化中..." :
           "カメラを起動してください"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Select
            value={selectedDevice}
            onValueChange={(value) => {
              setSelectedDevice(value);
              if (isCameraReady) {
                stopCamera();
              }
            }}
            className="flex-1"
          >
            <SelectTrigger>
              <SelectValue placeholder="カメラを選択" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `カメラ ${device.deviceId.slice(0, 8)}...`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isCameraReady ? (
            <Button 
              onClick={() => initCamera(selectedDevice)}
              disabled={isInitializing || !runnerId}
            >
              <Camera className="w-4 h-4 mr-2" />
              カメラを起動
            </Button>
          ) : (
            <Button variant="outline" onClick={stopCamera}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              カメラを停止
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between space-x-2 py-2">
          <Label htmlFor="auto-transition" className="text-sm font-medium">
            撮影後に自動で確認画面へ遷移
          </Label>
          <Switch
            id="auto-transition"
            checked={autoTransition}
            onCheckedChange={setAutoTransition}
          />
        </div>

        <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden relative">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="撮影画像"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
          {!isCameraReady && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg opacity-75">
                  {!runnerId ? "ランナーを検索してください" :
                   permissionDenied ? "カメラへのアクセスが拒否されています" : 
                   isInitializing ? "カメラを初期化中..." :
                   "カメラを起動してください"}
                </p>
              </div>
            </div>
          )}
          {isCapturing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/75 text-white px-8 py-4 rounded-lg backdrop-blur-sm">
                <p className="text-4xl font-bold text-center">{countdown}</p>
              </div>
            </div>
          )}
          {isAnalyzing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-center text-white">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-semibold">写真を分析中...</p>
              </div>
            </div>
          )}
        </div>

        {isCapturing && (
          <div className="space-y-2">
            <Progress value={(5 - countdown) * 20} />
            <p className="text-center text-sm text-muted-foreground">
              {countdown}秒後に撮影します
            </p>
          </div>
        )}

        <div className="flex gap-4">
          {capturedImage && !isAnalyzing ? (
            <>
              <Button 
                variant="outline"
                className="flex-1" 
                onClick={retakePhoto}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                撮り直す
              </Button>
              {!autoTransition && (
                <Button 
                  className="flex-1"
                  onClick={() => onPhotoCapture?.(capturedImage)}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  この写真を使用
                </Button>
              )}
            </>
          ) : (
            <Button 
              className="w-full" 
              size="lg"
              onClick={startCapture}
              disabled={!isCameraReady || isCapturing || isAnalyzing || !runnerId}
            >
              <Camera className="w-4 h-4 mr-2" />
              {!runnerId ? "ランナーを検索してください" :
               !isCameraReady ? 
                (permissionDenied ? "カメラへのアクセスが必要です" : 
                 isInitializing ? "カメラを初期化中..." :
                 "カメラを起動してください") : 
                isCapturing ? `${countdown}秒後に撮影` :
                isAnalyzing ? "分析中..." : 
                "撮影開始"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
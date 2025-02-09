"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, RefreshCcw, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as faceapi from 'face-api.js';

type DetectionResult = {
  age: number;
  gender: 'male' | 'female';
  genderProbability: number;
};

type Runner = {
  runnerId: string;
  nickname: string;
  language: string;
  targetTime: string;
  message: string;
};

interface CameraPreviewProps {
  autoInit?: boolean;
  runnerId: string;
  onPhotoCapture?: (imageUrl: string) => void;
}

const MODEL_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';

export function CameraPreview({ autoInit = false, runnerId = "", onPhotoCapture }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionRef = useRef<number>();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [runner, setRunner] = useState<Runner | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoading(false);
        console.log('Face detection models loaded');
      } catch (error) {
        console.error('Error loading face detection models:', error);
        toast.error("顔認識モデルの読み込みに失敗しました", {
          description: "ネットワーク接続を確認してください"
        });
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    const fetchRunner = async () => {
      if (!runnerId) return;
      try {
        const response = await fetch(`/api/runners/${runnerId}`);
        if (!response.ok) throw new Error("ランナー情報の取得に失敗しました");
        const data = await response.json();
        setRunner(data);
      } catch (error) {
        console.error("Runner fetch error:", error);
        toast.error("ランナー情報の取得に失敗しました");
      }
    };
    fetchRunner();
  }, [runnerId]);

  const detectFace = async (imageElement: HTMLImageElement | HTMLVideoElement) => {
    try {
      const detections = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withAgeAndGender();

      if (detections) {
        setDetectionResult({
          age: Math.round(detections.age),
          gender: detections.gender as 'male' | 'female',
          genderProbability: detections.genderProbability
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Face detection error:', error);
      return false;
    }
  };

  const startDetection = () => {
    if (!videoRef.current || !isCameraReady || isModelLoading) return;

    const runDetection = async () => {
      if (videoRef.current && isCapturing) {
        await detectFace(videoRef.current);
        detectionRef.current = requestAnimationFrame(runDetection);
      }
    };

    runDetection();
  };

  const stopDetection = () => {
    if (detectionRef.current) {
      cancelAnimationFrame(detectionRef.current);
      detectionRef.current = undefined;
    }
  };

  useEffect(() => {
    return () => {
      stopDetection();
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
    setDetectionResult(null);
    startDetection();

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

  const captureImage = async () => {
    stopDetection();
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

      const img = new Image();
      img.src = imageUrl;
      await new Promise(resolve => { img.onload = resolve; });

      const detections = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withAgeAndGender();

      setIsAnalyzing(false);

      if (detections) {
        const result = {
          age: Math.round(detections.age),
          gender: detections.gender as 'male' | 'female',
          genderProbability: detections.genderProbability
        };
        setDetectionResult(result);
        toast.success("撮影完了！", {
          description: `推定年齢: ${result.age}歳, 性別: ${result.gender === 'male' ? '男性' : '女性'}`
        });
      } else {
        toast.error("顔を検出できませんでした", {
          description: "もう一度撮影してください"
        });
        setCapturedImage(null);
      }
    }
  };

  const retakePhoto = async () => {
    try {
      setCapturedImage(null);
      setDetectionResult(null);
      setIsCapturing(false);
      stopDetection();
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
           isModelLoading ? "顔認識モデルを読み込み中..." :
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
              disabled={isInitializing || isModelLoading || !runnerId}
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
                   isModelLoading ? "顔認識モデルを読み込み中..." :
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
          {detectionResult && (
            <div className="absolute top-4 right-4 bg-black/75 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
              <p className="text-sm">
                推定年齢: {detectionResult.age}歳
              </p>
              <p className="text-sm">
                性別: {detectionResult.gender === 'male' ? '男性' : '女性'} 
                ({Math.round(detectionResult.genderProbability * 100)}%)
              </p>
            </div>
          )}
          {isAnalyzing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-center text-white">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-semibold">解析中...</p>
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
          {capturedImage ? (
            <>
              <Button 
                variant="outline"
                className="flex-1" 
                onClick={retakePhoto}
                disabled={isAnalyzing}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                撮り直す
              </Button>
              <Button 
                className="flex-1"
                onClick={() => onPhotoCapture?.(capturedImage)}
                disabled={isAnalyzing}
              >
                <Camera className="w-4 h-4 mr-2" />
                この写真を使用
              </Button>
            </>
          ) : (
            <Button 
              className="w-full" 
              size="lg"
              onClick={startCapture}
              disabled={!isCameraReady || isCapturing || isModelLoading || !runnerId}
            >
              <Camera className="w-4 h-4 mr-2" />
              {!runnerId ? "ランナーを検索してください" :
               isModelLoading ? "顔認識モデルを読み込み中..." :
               !isCameraReady ? 
                (permissionDenied ? "カメラへのアクセスが必要です" : 
                 isInitializing ? "カメラを初期化中..." :
                 "カメラを起動してください") : 
                isCapturing ? `${countdown}秒後に撮影` : 
                "撮影開始"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
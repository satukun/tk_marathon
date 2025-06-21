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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
        
        toast.success(t('camera.success.ready'));
      }
    } catch (error) {
      console.error("Camera initialization error:", error);
      if ((error as Error).name === 'NotAllowedError') {
        setPermissionDenied(true);
        toast.error(t('camera.error.permissionDenied'), {
          description: t('camera.error.permissionRequired')
        });
      } else {
        toast.error(t('camera.error.initFailed'), {
          description: t('camera.error.tryAnotherCamera')
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
      toast.success(t('camera.success.stopped'));
    }
  };

  const startCapture = () => {
    if (!isCameraReady) {
      toast.error(t('camera.error.notReady'));
      return;
    }

    setIsCapturing(true);
    setCountdown(5);
    setCapturedImage(null);

    toast.success(t('camera.success.startCapture'), {
      description: t('camera.info.countdown')
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
        onPhotoCapture?.(imageUrl);
      } else {
        setTimeout(() => {
          setIsAnalyzing(false);
          toast.success(t('camera.success.captured'));
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
      toast.success(t('camera.success.retake'));
    } catch (error) {
      console.error("Camera reinitialization error:", error);
      toast.error(t('camera.error.reinitFailed'));
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
        <CardTitle>{t('search.camera.title')}</CardTitle>
        <CardDescription>
          {!runnerId ? t('camera.error.noParticipant') :
           isCameraReady ? t('search.camera.description') : 
           permissionDenied ? t('camera.error.permissionDenied') : 
           isInitializing ? t('camera.info.initializing') :
           t('camera.info.start')}
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
              <SelectValue placeholder={t('camera.select.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || t('camera.select.defaultLabel', { id: device.deviceId.slice(0, 8) })}
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
              {t('search.camera.button.start')}
            </Button>
          ) : (
            <Button variant="outline" onClick={stopCamera}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              {t('search.camera.button.stop')}
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between space-x-2 py-2">
          <Label htmlFor="auto-transition" className="text-sm font-medium">
            {t('camera.autoTransition.label')}
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
              alt={t('camera.image.alt')}
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
                  {!runnerId ? t('camera.error.noParticipant') :
                   permissionDenied ? t('camera.error.permissionDenied') : 
                   isInitializing ? t('camera.info.initializing') :
                   t('camera.info.start')}
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
                <p className="text-lg font-semibold">{t('camera.info.analyzing')}</p>
              </div>
            </div>
          )}
        </div>

        {isCapturing && (
          <div className="space-y-2">
            <Progress value={(5 - countdown) * 20} />
            <p className="text-center text-sm text-muted-foreground">
              {t('camera.info.countdown')}
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
                {t('search.camera.button.retake')}
              </Button>
              {!autoTransition && (
                <Button 
                  className="flex-1"
                  onClick={() => onPhotoCapture?.(capturedImage)}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {t('search.camera.button.use')}
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
              {!runnerId ? t('camera.error.noParticipant') :
               !isCameraReady ? 
                (permissionDenied ? t('camera.error.permissionRequired') : 
                 isInitializing ? t('camera.info.initializing') :
                 t('camera.info.start')) : 
                isCapturing ? t('camera.info.capturing', { seconds: countdown }) :
                isAnalyzing ? t('camera.info.analyzing') : 
                t('search.camera.button.capture')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
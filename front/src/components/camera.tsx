"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, CheckCircle } from "lucide-react";

interface CameraComponentProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({
  onCapture,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // カメラストリームの初期化
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user", // フロントカメラを使用
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        console.error("カメラへのアクセスに失敗しました:", err);
        setError("カメラへのアクセスに失敗しました。カメラの使用許可を確認してください。");
      }
    };

    initCamera();

    // クリーンアップ関数
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 写真を撮影
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // ビデオの表示サイズに合わせてキャンバスのサイズを設定
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // キャンバスに現在のビデオフレームを描画
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // キャンバスから画像データを取得
        const imageDataUrl = canvas.toDataURL("image/png");
        setCapturedImage(imageDataUrl);
      }
    }
  };

  // 撮影をやり直す
  const retakePhoto = () => {
    setCapturedImage(null);
  };

  // 撮影した画像を確定
  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  // キャンセル
  const handleCancel = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onCancel();
  };

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg">
      {error ? (
        <div className="text-error p-4 text-center">
          <p>{error}</p>
          <Button onClick={handleCancel} className="mt-4">
            戻る
          </Button>
        </div>
      ) : capturedImage ? (
        // 撮影後の確認画面
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border-2 border-gray-200 mb-4">
            <img
              src={capturedImage}
              alt="撮影した写真"
              className="w-full h-auto"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" onClick={retakePhoto}>
              <RefreshCw className="mr-2 h-4 w-4" />
              撮り直す
            </Button>
            <Button variant="success" onClick={confirmPhoto}>
              <CheckCircle className="mr-2 h-4 w-4" />
              この写真を使用
            </Button>
          </div>
        </div>
      ) : (
        // カメラのプレビュー画面
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border-2 border-gray-200 mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
            />
            <div className="absolute top-0 left-0 w-full h-full border-4 border-white/30 pointer-events-none"></div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" onClick={handleCancel}>
              キャンセル
            </Button>
            <Button onClick={capturePhoto}>
              <Camera className="mr-2 h-4 w-4" />
              撮影
            </Button>
          </div>
        </div>
      )}
      {/* オフスクリーンキャンバス - 画像処理用 */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default CameraComponent; 
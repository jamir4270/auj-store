"use client";

import { useEffect, useRef, useState, useId } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Html5Qrcode, Html5QrcodeCameraScanConfig, CameraDevice } from "html5-qrcode";
import { Camera, Flashlight, RefreshCw, X, AlertCircle } from "lucide-react";
import { playScanSound } from "@/hooks/use-barcode-scanner";

interface CameraScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
  title?: string;
  description?: string;
  continuous?: boolean;
}

export function CameraScannerModal({
  open,
  onOpenChange,
  onScan,
  title = "Scan Barcode",
  description = "Align the barcode within the camera viewfinder.",
  continuous = false,
}: CameraScannerModalProps) {
  const uniqueId = useId().replace(/:/g, "-");
  const readerElementId = `camera-scanner-viewfinder-${uniqueId}`;

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);

  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  // Initialize or restart camera
  useEffect(() => {
    if (!open) {
      stopScanning();
      return;
    }

    let mounted = true;
    setIsInitializing(true);
    setErrorMsg(null);

    async function initScanner() {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!mounted) return;

        if (!devices || devices.length === 0) {
          setErrorMsg("No camera device found on this device.");
          setIsInitializing(false);
          return;
        }

        setCameras(devices);

        // Prefer rear/environment camera if available
        const backCamera = devices.find((d) =>
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("rear") ||
          d.label.toLowerCase().includes("environment")
        );
        const activeId = backCamera ? backCamera.id : devices[0].id;
        setSelectedCameraId(activeId);

        await startScanner(activeId);
      } catch (err) {
        if (!mounted) return;
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Camera permission denied or camera unavailable."
        );
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    }

    // Delay slightly to ensure dialog DOM element is mounted
    const timer = setTimeout(() => {
      initScanner();
    }, 150);

    return () => {
      mounted = false;
      clearTimeout(timer);
      stopScanning();
    };
  }, [open]);

  async function startScanner(cameraId: string) {
    try {
      if (html5QrCodeRef.current) {
        await stopScanning();
      }

      const qrCodeInstance = new Html5Qrcode(readerElementId);
      html5QrCodeRef.current = qrCodeInstance;

      const config: Html5QrcodeCameraScanConfig = {
        fps: 15,
        qrbox: { width: 280, height: 160 },
        aspectRatio: 1.333333,
      };

      await qrCodeInstance.start(
        cameraId,
        config,
        (decodedText) => {
          playScanSound("success");
          onScan(decodedText);

          if (!continuous) {
            onOpenChange(false);
          }
        },
        () => {
          // Ignored per-frame decode failure
        }
      );

      isScanningRef.current = true;

      // Check for torch capability
      try {
        const capabilities = qrCodeInstance.getRunningTrackCapabilities();
        if (capabilities && "torch" in capabilities) {
          setHasTorch(true);
        } else {
          setHasTorch(false);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err) {
      console.error("Failed to start camera scanner:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to access camera stream."
      );
    }
  }

  async function stopScanning() {
    if (html5QrCodeRef.current && isScanningRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.warn("Error stopping camera scanner:", err);
      } finally {
        isScanningRef.current = false;
        html5QrCodeRef.current = null;
      }
    }
  }

  async function handleSwitchCamera() {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    setSelectedCameraId(nextCamera.id);
    await startScanner(nextCamera.id);
  }

  async function handleToggleTorch() {
    if (!html5QrCodeRef.current || !hasTorch) return;
    try {
      const nextTorch = !torchOn;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as MediaTrackConstraintSet],
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn("Failed to toggle torch:", err);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full aspect-4/3 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-border">
          <div id={readerElementId} className="w-full h-full object-cover" />

          {/* Reticle Overlay */}
          {!errorMsg && !isInitializing && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-64 h-36 border-2 border-primary/70 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                {/* Corner accents */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />

                {/* Animated Laser line */}
                <div className="w-full h-0.5 bg-rose-500/80 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              </div>
            </div>
          )}

          {isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white gap-2 p-4 text-center">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">Initializing camera feed...</p>
            </div>
          )}

          {errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white gap-3 p-6 text-center">
              <AlertCircle className="h-8 w-8 text-rose-500" />
              <p className="text-xs text-rose-200">{errorMsg}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedCameraId && startScanner(selectedCameraId)}
                className="text-xs mt-2"
              >
                Retry Camera
              </Button>
            </div>
          )}
        </div>

        {/* Controls toolbar */}
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            {cameras.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSwitchCamera}
                className="text-xs gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Switch Camera
              </Button>
            )}

            {hasTorch && (
              <Button
                type="button"
                variant={torchOn ? "default" : "outline"}
                size="sm"
                onClick={handleToggleTorch}
                className="text-xs gap-1.5"
              >
                <Flashlight className="h-3.5 w-3.5" />
                {torchOn ? "Torch On" : "Torch Off"}
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs gap-1"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

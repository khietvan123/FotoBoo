import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  Camera,
  ArrowLeft,
  Download,
  Check,
  Edit,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { toast } from "sonner";
import { PhotoStripEditor } from "./PhotoStripEditor";

interface PhotoBoothProps {
  onBackHome: () => void;
}

type CaptureState =
  | "ready"
  | "countdown"
  | "capturing"
  | "preview"
  | "selecting"
  | "complete"
  | "editing";

export function PhotoBooth({ onBackHome }: PhotoBoothProps) {
  const [state, setState] = useState<CaptureState>("ready");
  const [countdown, setCountdown] = useState(7);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<
    string[]
  >([]);
  const [selectedPhotos, setSelectedPhotos] = useState<
    number[]
  >([]);
  const [stream, setStream] = useState<MediaStream | null>(
    null,
  );
  const [cameraError, setCameraError] = useState<string | null>(
    null,
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewTimerRef = useRef<number | null>(null);

  // Attach stream to video whenever it changes
  useEffect(() => {
    const attach = async () => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          /* ignore autoplay rejection */
        }
      }
    };
    attach();
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewTimerRef.current) {
        window.clearTimeout(previewTimerRef.current);
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureVideoReady = async () => {
    const video = videoRef.current;
    if (!video) return false;

    // Make sure the element is actively playing
    try {
      if (video.paused) {
        await video.play();
      }
    } catch {
      /* ignore */
    }

    // Wait until the metadata/dimensions are available
    if (
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      await new Promise<void>((resolve) => {
        const onCanPlay = () => {
          video.removeEventListener(
            "loadedmetadata",
            onCanPlay,
          );
          video.removeEventListener("canplay", onCanPlay);
          resolve();
        };
        video.addEventListener("loadedmetadata", onCanPlay, {
          once: true,
        });
        video.addEventListener("canplay", onCanPlay, {
          once: true,
        });
      });
    }

    return true;
  };

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Ensure the stream is actively rendering frames
    const ready = await ensureVideoReady();
    if (!ready) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Safety: if dimensions are still zero, skip to avoid black frame
    if (video.videoWidth === 0 || video.videoHeight === 0)
      return;

    // Calculate the visible portion of the video (object-cover behavior)
    // The video container has 16:9 aspect ratio (aspect-video)
    const containerAspect = 16 / 9;
    const videoAspect = video.videoWidth / video.videoHeight;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = video.videoWidth;
    let sourceHeight = video.videoHeight;

    if (videoAspect > containerAspect) {
      // Video is wider than container - crop left/right
      sourceWidth = video.videoHeight * containerAspect;
      sourceX = (video.videoWidth - sourceWidth) / 2;
    } else {
      // Video is taller than container - crop top/bottom
      sourceHeight = video.videoWidth / containerAspect;
      sourceY = (video.videoHeight - sourceHeight) / 2;
    }

    // Set canvas to 16:9 aspect ratio with good quality
    // Using 1920x1080 for Full HD quality
    canvas.width = 1920;
    canvas.height = 1080;

    // Flip the image horizontally (mirror effect)
    context.save();
    context.scale(-1, 1);

    // Draw only the visible portion of the video
    context.drawImage(
      video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      -canvas.width,
      0,
      canvas.width,
      canvas.height,
    );
    context.restore();

    const photoData = canvas.toDataURL("image/png");

    setCapturedPhotos((prev) => [...prev, photoData]);
    setState("preview");

    // Keep the <video> mounted but hidden; ensure playback continues
    try {
      await video.play();
    } catch {
      /* ignore */
    }

    // Schedule next step
    if (previewTimerRef.current) {
      window.clearTimeout(previewTimerRef.current);
    }
    previewTimerRef.current = window.setTimeout(async () => {
      setCurrentPhotoIndex((idx) => {
        const next = idx + 1;
        if (next < 4) {
          setCountdown(7);
          // Make sure video is playing before next countdown starts
          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
          }
          setState("countdown");
        } else {
          setState("selecting");
          toast.success(
            "All photos captured! Select 4 for your photo strip.",
          );
        }
        return next;
      });
    }, 2000);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (state !== "countdown") return;
    if (countdown > 0) {
      const t = window.setTimeout(
        () => setCountdown((c) => c - 1),
        1000,
      );
      return () => window.clearTimeout(t);
    }
    // when countdown hits 0, take the shot
    capturePhoto();
  }, [countdown, state, capturePhoto]);

  const startCapture = async () => {
    // Reset any previous timers
    if (previewTimerRef.current) {
      window.clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }

    // Request camera access when user clicks start
    try {
      // If we already have a stream, reuse it
      let mediaStream = stream;
      if (!mediaStream) {
        mediaStream = await navigator.mediaDevices.getUserMedia(
          {
            video: {
              width: 640,
              height: 480,
              facingMode: "user",
            },
          },
        );
        setStream(mediaStream);
      }
      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraError(null);

      // Reset sequence
      setCapturedPhotos([]);
      setSelectedPhotos([]);
      setCurrentPhotoIndex(0);
      setCountdown(7);
      setState("countdown");
    } catch (error) {
      let errorMsg = "Unable to access camera.";
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMsg =
            "Camera permission denied. Please allow camera access and try again.";
        } else if (error.name === "NotFoundError") {
          errorMsg =
            "No camera found. Please connect a camera and try again.";
        } else if (error.name === "NotReadableError") {
          errorMsg =
            "Camera is in use by another app. Please close other apps and try again.";
        }
      }
      setCameraError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const removePhoto = (index: number) => {
    setCapturedPhotos((prev) =>
      prev.filter((_, i) => i !== index),
    );
    setSelectedPhotos((prev) => {
      const newSelected = prev.filter((i) => i !== index);
      return newSelected.map((i) => (i > index ? i - 1 : i));
    });
    toast.success("Photo removed");
  };

  const togglePhotoSelection = (index: number) => {
    setSelectedPhotos((prev) => {
      if (prev.includes(index))
        return prev.filter((i) => i !== index);
      if (prev.length < 4) return [...prev, index];
      toast.error("You can only select 4 photos");
      return prev;
    });
  };

  const retakeSinglePhoto = () => {
    if (previewTimerRef.current) {
      window.clearTimeout(previewTimerRef.current);
    }
    setCountdown(7);
    setState("countdown");
    setCurrentPhotoIndex(capturedPhotos.length);
  };

  const finishSelection = () => {
    if (selectedPhotos.length !== 4) {
      toast.error("Please select exactly 4 photos");
      return;
    }
    setState("complete");
  };

  const downloadPhotoStrip = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    // HIGH RESOLUTION - Using 5x scale for Full HD quality output
    const scale = 5;
    const padding = 30 * scale;
    const photoPadding = 15 * scale;
    const stripWidth = 400 * scale;
    const photoWidth = stripWidth - padding * 2;
    const photoHeight = 240 * scale;
    const bottomSpace = 60 * scale;
    const stripHeight =
      padding * 2 +
      photoHeight * 4 +
      photoPadding * 3 +
      bottomSpace;

    canvas.width = stripWidth;
    canvas.height = stripHeight;

    // Enable high-quality image smoothing
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, stripWidth, stripHeight);

    let loadedCount = 0;
    selectedPhotos.forEach((photoIndex, i) => {
      const img = new Image();
      img.src = capturedPhotos[photoIndex];
      img.onload = () => {
        const yPosition =
          padding + i * (photoHeight + photoPadding);
        context.drawImage(
          img,
          padding,
          yPosition,
          photoWidth,
          photoHeight,
        );

        loadedCount++;
        if (loadedCount === 4) {
          context.fillStyle = "#9333ea";
          context.font = `${28 * scale}px Pacifico, cursive`;
          context.textAlign = "center";
          context.fillText(
            "Fotoboo",
            stripWidth / 2,
            stripHeight - 25 * scale,
          );

          const link = document.createElement("a");
          link.download = `fotoboo-${Date.now()}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
          toast.success("Photo strip downloaded!");
        }
      };
    });
  };

  const retakePhotos = () => {
    if (previewTimerRef.current) {
      window.clearTimeout(previewTimerRef.current);
    }
    setCapturedPhotos([]);
    setSelectedPhotos([]);
    setCurrentPhotoIndex(0);
    if (stream) {
      setCountdown(7);
      setState("countdown");
    } else {
      setState("ready");
    }
  };

  const openEditor = () => setState("editing");
  const backFromEditor = () => setState("complete");

  if (state === "editing") {
    const selectedPhotoData = selectedPhotos.map(
      (i) => capturedPhotos[i],
    );
    return (
      <PhotoStripEditor
        photos={selectedPhotoData}
        onBack={backFromEditor}
      />
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBackHome}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl text-white">Fotoboo</h1>
          <div className="w-32" />
        </div>

        {/* Camera Error Alert */}
        {cameraError && (
          <Card className="p-4 bg-red-500/20 border-red-500/50 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">
                !
              </div>
              <div className="flex-1">
                <h3 className="text-white mb-1">
                  Camera Access Required
                </h3>
                <p className="text-white/90 text-sm">
                  {cameraError}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Camera/Preview Panel */}
          <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
            <div className="space-y-4">
              <h2 className="text-2xl text-white text-center">
                {state === "ready" && "Ready to Start"}
                {state === "countdown" &&
                  `Photo ${currentPhotoIndex + 1} of 4`}
                {state === "capturing" && "Capturing..."}
                {state === "preview" && "Photo Captured!"}
                {state === "selecting" && "Select Your Photos"}
                {state === "complete" && "Your Photo Strip"}
              </h2>

              {state === "countdown" && stream && (
                <div className="text-center mb-4">
                  <p className="text-white text-2xl">
                    Photo {currentPhotoIndex + 1} of 4 in{" "}
                    <span className="text-4xl animate-pulse">
                      {countdown}
                    </span>
                    s
                  </p>
                </div>
              )}

              {/* KEEP VIDEO MOUNTED — overlay preview instead of unmounting */}
              <div className="relative w-full aspect-video rounded-lg bg-black overflow-hidden">
                {/* Live camera */}
                {stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ transform: "scaleX(-1)" }}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      state === "preview"
                        ? "opacity-0"
                        : "opacity-100"
                    }`}
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full rounded-lg bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white/60">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>
                        Click "Start Capture" to enable camera
                      </p>
                    </div>
                  </div>
                )}

                {/* Preview overlay (only if we have at least one capture) */}
                {capturedPhotos.length > 0 && (
                  <img
                    src={
                      capturedPhotos[capturedPhotos.length - 1]
                    }
                    alt="Captured preview"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      state === "preview"
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                )}
              </div>

              {/* Progress */}
              {state === "countdown" && (
                <div className="space-y-2">
                  <Progress
                    value={((7 - countdown) / 7) * 100}
                    className="h-2"
                  />
                </div>
              )}

              {/* Start Button */}
              {state === "ready" && (
                <Button
                  onClick={startCapture}
                  className="w-full bg-white hover:bg-white/90 py-6 gap-2"
                  style={{ color: "#44318D" }}
                >
                  <Camera className="w-6 h-6" />
                  {stream
                    ? "Start Capture (4 Photos)"
                    : "Enable Camera & Start"}
                </Button>
              )}

              {/* Retake Button */}
              {(state === "selecting" ||
                state === "complete") && (
                <Button
                  onClick={retakePhotos}
                  className="w-full bg-white hover:bg-white/90 py-4"
                  style={{ color: "#44318D" }}
                >
                  Retake Photos
                </Button>
              )}
            </div>
          </Card>

          {/* Photos Panel */}
          <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
            <h3 className="text-xl text-white mb-4">
              Captured Photos
            </h3>

            {capturedPhotos.length === 0 && (
              <div className="text-center text-white/60 py-16">
                No photos captured yet
              </div>
            )}

            {capturedPhotos.length > 0 &&
              (state === "ready" ||
                state === "countdown" ||
                state === "preview" ||
                state === "selecting") && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {capturedPhotos.map((photo, index) => (
                      <div
                        key={index}
                        className={`relative rounded-lg overflow-hidden border-4 transition-all group ${
                          state === "selecting" &&
                          selectedPhotos.includes(index)
                            ? "border-green-400 scale-95"
                            : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`Captured ${index + 1}`}
                          className={`w-full ${state === "selecting" ? "cursor-pointer" : ""}`}
                          onClick={() =>
                            state === "selecting" &&
                            togglePhotoSelection(index)
                          }
                        />
                        {state === "selecting" && (
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {state === "selecting" &&
                          selectedPhotos.includes(index) && (
                            <div className="absolute inset-0 bg-green-400/30 flex items-center justify-center pointer-events-none">
                              <div className="bg-green-400 rounded-full p-2">
                                <Check className="w-6 h-6 text-white" />
                              </div>
                              <div className="absolute top-2 right-2 bg-green-400 text-white rounded-full w-8 h-8 flex items-center justify-center">
                                {selectedPhotos.indexOf(index) +
                                  1}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>

                  {state === "selecting" && (
                    <>
                      <div className="text-center text-white text-sm">
                        Selected: {selectedPhotos.length} / 4
                      </div>

                      <div className="space-y-2">
                        <Button
                          onClick={finishSelection}
                          disabled={selectedPhotos.length !== 4}
                          className="w-full bg-green-500 hover:bg-green-600 text-white py-6"
                          style={{
                            fontFamily: "Pacifico, cursive",
                          }}
                        >
                          Create Photo Strip
                        </Button>

                        <Button
                          onClick={retakeSinglePhoto}
                          className="w-full bg-white hover:bg-white/90 py-4"
                          style={{ color: "#44318D" }}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Capture Another Photo
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

            {state === "complete" && (
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg shadow-2xl max-w-xs mx-auto">
                  <div className="space-y-3">
                    {selectedPhotos.map((photoIndex, i) => (
                      <div key={i} className="w-full">
                        <img
                          src={capturedPhotos[photoIndex]}
                          alt={`Strip ${i + 1}`}
                          className="w-full rounded-sm"
                        />
                      </div>
                    ))}
                    <div className="pt-3 text-center">
                      <p className="text-purple-600">Fotoboo</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={openEditor}
                    className="flex-1 bg-white hover:bg-white/90 py-6 gap-2"
                    style={{ color: "#44318D" }}
                  >
                    <Edit className="w-6 h-6" />
                    Customize
                  </Button>
                  <Button
                    onClick={downloadPhotoStrip}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-6 gap-2"
                  >
                    <Download className="w-6 h-6" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Hidden canvas for photo capture and strip generation */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
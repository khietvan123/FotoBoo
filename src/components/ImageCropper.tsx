import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Crop,
  Check,
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Label } from "./ui/label";

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // width / height, default is 16/9 (1.7778)
  currentIndex?: number;
  totalImages?: number;
}

export function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 16 / 9,
  currentIndex,
  totalImages,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use refs to avoid stale closures in event handlers
  const cropAreaRef = useRef({
    x: 0,
    y: 0,
    width: 200,
    height: 200 / aspectRatio,
  });
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const resizeHandleRef = useRef<string | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 200 / aspectRatio,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<
    string | null
  >(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Sync refs with state
  useEffect(() => {
    cropAreaRef.current = cropArea;
  }, [cropArea]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    isResizingRef.current = isResizing;
  }, [isResizing]);

  useEffect(() => {
    resizeHandleRef.current = resizeHandle;
  }, [resizeHandle]);

  useEffect(() => {
    dragStartRef.current = dragStart;
  }, [dragStart]);

  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);

      // Initialize crop area to center using actual container dimensions
      const container = containerRef.current;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const initialWidth = Math.min(
          containerWidth * 0.8,
          img.width,
        );
        const initialHeight = initialWidth / aspectRatio;

        const newCropArea = {
          x: (containerWidth - initialWidth) / 2,
          y: (containerHeight - initialHeight) / 2,
          width: initialWidth,
          height: initialHeight,
        };
        
        setCropArea(newCropArea);
        cropAreaRef.current = newCropArea;
      }
    };
  }, [image, aspectRatio]);

  useEffect(() => {
    if (
      imageLoaded &&
      imageRef.current &&
      containerRef.current
    ) {
      drawCanvas();
    }
  }, [imageLoaded, cropArea, zoom, rotation]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const container = containerRef.current;

    if (!canvas || !img || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // Draw image with zoom and rotation
    ctx.save();
    ctx.translate(containerWidth / 2, containerHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const scale = Math.max(
      containerWidth / img.width,
      containerHeight / img.height,
    );
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;

    ctx.drawImage(
      img,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight,
    );
    ctx.restore();

    // Draw crop area overlay (darken outside, keep inside transparent)
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";

    // Draw overlay in 4 parts around the crop area
    // Top
    ctx.fillRect(0, 0, containerWidth, cropArea.y);
    // Bottom
    ctx.fillRect(
      0,
      cropArea.y + cropArea.height,
      containerWidth,
      containerHeight - (cropArea.y + cropArea.height),
    );
    // Left
    ctx.fillRect(0, cropArea.y, cropArea.x, cropArea.height);
    // Right
    ctx.fillRect(
      cropArea.x + cropArea.width,
      cropArea.y,
      containerWidth - (cropArea.x + cropArea.width),
      cropArea.height,
    );
    ctx.restore();

    // Draw crop area border (brighter when actively interacting)
    const isInteracting = isDragging || isResizing;
    ctx.strokeStyle = isInteracting ? "#10b981" : "#ffffff";
    ctx.lineWidth = isInteracting ? 3 : 2;
    ctx.strokeRect(
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
    );

    // Draw grid lines (more visible when interacting)
    ctx.strokeStyle = isInteracting
      ? "rgba(16, 185, 129, 0.6)"
      : "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;

    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(cropArea.x + cropArea.width / 3, cropArea.y);
    ctx.lineTo(
      cropArea.x + cropArea.width / 3,
      cropArea.y + cropArea.height,
    );
    ctx.moveTo(
      cropArea.x + (2 * cropArea.width) / 3,
      cropArea.y,
    );
    ctx.lineTo(
      cropArea.x + (2 * cropArea.width) / 3,
      cropArea.y + cropArea.height,
    );

    // Horizontal lines
    ctx.moveTo(cropArea.x, cropArea.y + cropArea.height / 3);
    ctx.lineTo(
      cropArea.x + cropArea.width,
      cropArea.y + cropArea.height / 3,
    );
    ctx.moveTo(
      cropArea.x,
      cropArea.y + (2 * cropArea.height) / 3,
    );
    ctx.lineTo(
      cropArea.x + cropArea.width,
      cropArea.y + (2 * cropArea.height) / 3,
    );
    ctx.stroke();

    // Draw corner handles (larger and more visible, especially on mobile)
    const isTouchDevice = "ontouchstart" in window;
    const handleSize = isTouchDevice ? 30 : 20;
    const handleThickness = isTouchDevice ? 4 : 3;
    ctx.strokeStyle = isInteracting ? "#10b981" : "#ffffff";
    ctx.lineWidth = handleThickness;
    ctx.fillStyle = isInteracting ? "#10b981" : "#ffffff";

    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(cropArea.x, cropArea.y + handleSize);
    ctx.lineTo(cropArea.x, cropArea.y);
    ctx.lineTo(cropArea.x + handleSize, cropArea.y);
    ctx.stroke();

    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(
      cropArea.x + cropArea.width - handleSize,
      cropArea.y,
    );
    ctx.lineTo(cropArea.x + cropArea.width, cropArea.y);
    ctx.lineTo(
      cropArea.x + cropArea.width,
      cropArea.y + handleSize,
    );
    ctx.stroke();

    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(
      cropArea.x,
      cropArea.y + cropArea.height - handleSize,
    );
    ctx.lineTo(cropArea.x, cropArea.y + cropArea.height);
    ctx.lineTo(
      cropArea.x + handleSize,
      cropArea.y + cropArea.height,
    );
    ctx.stroke();

    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(
      cropArea.x + cropArea.width - handleSize,
      cropArea.y + cropArea.height,
    );
    ctx.lineTo(
      cropArea.x + cropArea.width,
      cropArea.y + cropArea.height,
    );
    ctx.lineTo(
      cropArea.x + cropArea.width,
      cropArea.y + cropArea.height - handleSize,
    );
    ctx.stroke();
  };

  const getResizeHandle = (
    x: number,
    y: number,
  ): string | null => {
    // Larger hit area for mobile/touch devices (40px) vs desktop (20px)
    const isTouchDevice = "ontouchstart" in window;
    const handleSize = isTouchDevice ? 40 : 20;

    // Check corners first (priority)
    if (
      Math.abs(x - cropArea.x) < handleSize &&
      Math.abs(y - cropArea.y) < handleSize
    ) {
      return "nw"; // northwest (top-left)
    }
    if (
      Math.abs(x - (cropArea.x + cropArea.width)) <
        handleSize &&
      Math.abs(y - cropArea.y) < handleSize
    ) {
      return "ne"; // northeast (top-right)
    }
    if (
      Math.abs(x - cropArea.x) < handleSize &&
      Math.abs(y - (cropArea.y + cropArea.height)) < handleSize
    ) {
      return "sw"; // southwest (bottom-left)
    }
    if (
      Math.abs(x - (cropArea.x + cropArea.width)) <
        handleSize &&
      Math.abs(y - (cropArea.y + cropArea.height)) < handleSize
    ) {
      return "se"; // southeast (bottom-right)
    }

    return null;
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a resize handle
    const handle = getResizeHandle(x, y);
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({ x, y });
      return;
    }

    // Check if click is inside crop area for dragging
    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update cursor based on position
    if (!isDragging && !isResizing) {
      const handle = getResizeHandle(x, y);
      if (handle) {
        if (handle === "nw" || handle === "se") {
          canvas.style.cursor = "nwse-resize";
        } else {
          canvas.style.cursor = "nesw-resize";
        }
      } else if (
        x >= cropArea.x &&
        x <= cropArea.x + cropArea.width &&
        y >= cropArea.y &&
        y <= cropArea.y + cropArea.height
      ) {
        canvas.style.cursor = "move";
      } else {
        canvas.style.cursor = "default";
      }
    }

    if (isResizing && resizeHandle) {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;

      let newX = cropArea.x;
      let newY = cropArea.y;
      let newWidth = cropArea.width;
      let newHeight = cropArea.height;

      // Calculate new dimensions based on handle
      switch (resizeHandle) {
        case "nw": // top-left
          newX = cropArea.x + deltaX;
          newWidth = cropArea.width - deltaX;
          newHeight = newWidth / aspectRatio;
          newY = cropArea.y + cropArea.height - newHeight;
          break;
        case "ne": // top-right
          newWidth = cropArea.width + deltaX;
          newHeight = newWidth / aspectRatio;
          newY = cropArea.y + cropArea.height - newHeight;
          break;
        case "sw": // bottom-left
          newX = cropArea.x + deltaX;
          newWidth = cropArea.width - deltaX;
          newHeight = newWidth / aspectRatio;
          break;
        case "se": // bottom-right
          newWidth = cropArea.width + deltaX;
          newHeight = newWidth / aspectRatio;
          break;
      }

      // Enforce minimum size
      const minSize = 50;
      if (newWidth >= minSize && newHeight >= minSize) {
        // Ensure crop area stays within canvas bounds
        if (
          newX >= 0 &&
          newY >= 0 &&
          newX + newWidth <= canvas.width &&
          newY + newHeight <= canvas.height
        ) {
          setCropArea({
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          });
          setDragStart({ x, y });
        }
      }
    } else if (isDragging) {
      const newX = Math.max(
        0,
        Math.min(
          x - dragStart.x,
          canvas.width - cropArea.width,
        ),
      );
      const newY = Math.max(
        0,
        Math.min(
          y - dragStart.y,
          canvas.height - cropArea.height,
        ),
      );

      setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "default";
    }
  };

  // Touch event handlers for mobile support with refs to avoid stale closures
  const handleTouchStart = (
    e: React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Check if touching a resize handle
    const handle = getResizeHandle(x, y);
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({ x, y });
      
      // Add global touch move/end listeners using refs
      const handleGlobalTouchMove = (moveEvent: TouchEvent) => {
        moveEvent.preventDefault();
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const touch = moveEvent.touches[0];
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        if (isResizingRef.current && resizeHandleRef.current) {
          const deltaX = touchX - dragStartRef.current.x;
          const deltaY = touchY - dragStartRef.current.y;

          let newX = cropAreaRef.current.x;
          let newY = cropAreaRef.current.y;
          let newWidth = cropAreaRef.current.width;
          let newHeight = cropAreaRef.current.height;

          switch (resizeHandleRef.current) {
            case "nw":
              newX = cropAreaRef.current.x + deltaX;
              newWidth = cropAreaRef.current.width - deltaX;
              newHeight = newWidth / aspectRatio;
              newY = cropAreaRef.current.y + cropAreaRef.current.height - newHeight;
              break;
            case "ne":
              newWidth = cropAreaRef.current.width + deltaX;
              newHeight = newWidth / aspectRatio;
              newY = cropAreaRef.current.y + cropAreaRef.current.height - newHeight;
              break;
            case "sw":
              newX = cropAreaRef.current.x + deltaX;
              newWidth = cropAreaRef.current.width - deltaX;
              newHeight = newWidth / aspectRatio;
              break;
            case "se":
              newWidth = cropAreaRef.current.width + deltaX;
              newHeight = newWidth / aspectRatio;
              break;
          }

          const minSize = 50;
          if (newWidth >= minSize && newHeight >= minSize) {
            if (
              newX >= 0 &&
              newY >= 0 &&
              newX + newWidth <= canvas.width &&
              newY + newHeight <= canvas.height
            ) {
              setCropArea({
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
              });
              setDragStart({ x: touchX, y: touchY });
            }
          }
        }
      };
      
      const handleGlobalTouchEnd = () => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
        document.removeEventListener("touchmove", handleGlobalTouchMove);
        document.removeEventListener("touchend", handleGlobalTouchEnd);
        document.removeEventListener("touchcancel", handleGlobalTouchEnd);
      };
      
      document.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
      document.addEventListener("touchend", handleGlobalTouchEnd);
      document.addEventListener("touchcancel", handleGlobalTouchEnd);
      return;
    }

    // Check if touch is inside crop area for dragging
    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
      
      // Add global touch move/end listeners using refs
      const handleGlobalTouchMove = (moveEvent: TouchEvent) => {
        moveEvent.preventDefault();
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const touch = moveEvent.touches[0];
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        if (isDraggingRef.current) {
          const newX = Math.max(
            0,
            Math.min(
              touchX - dragStartRef.current.x,
              canvas.width - cropAreaRef.current.width,
            ),
          );
          const newY = Math.max(
            0,
            Math.min(
              touchY - dragStartRef.current.y,
              canvas.height - cropAreaRef.current.height,
            ),
          );

          setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
        }
      };
      
      const handleGlobalTouchEnd = () => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
        document.removeEventListener("touchmove", handleGlobalTouchMove);
        document.removeEventListener("touchend", handleGlobalTouchEnd);
        document.removeEventListener("touchcancel", handleGlobalTouchEnd);
      };
      
      document.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
      document.addEventListener("touchend", handleGlobalTouchEnd);
      document.addEventListener("touchcancel", handleGlobalTouchEnd);
    }
  };

  const handleTouchMove = (
    e: React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const container = containerRef.current;

    if (!canvas || !img || !container) return;

    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement("canvas");
    const ctx = cropCanvas.getContext("2d");
    if (!ctx) return;

    // Set crop canvas size to high resolution output (1920x1080 - Full HD)
    // This maintains the 16:9 aspect ratio for photo strip compatibility
    cropCanvas.width = 1920;
    cropCanvas.height = 1080;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Calculate the transformation from canvas to original image coordinates
    ctx.save();

    // We need to reverse the transformations to get the correct crop area from the original image
    const scale =
      Math.max(
        containerWidth / img.width,
        containerHeight / img.height,
      ) * zoom;

    // Calculate source rectangle in original image coordinates
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    // Transform crop area coordinates back to image space
    const cropCenterX = cropArea.x + cropArea.width / 2;
    const cropCenterY = cropArea.y + cropArea.height / 2;

    // Offset from center
    const offsetX = (cropCenterX - centerX) / scale;
    const offsetY = (cropCenterY - centerY) / scale;

    const sourceWidth = cropArea.width / scale;
    const sourceHeight = cropArea.height / scale;

    // Apply rotation to the crop canvas
    ctx.translate(cropCanvas.width / 2, cropCanvas.height / 2);
    ctx.rotate((-rotation * Math.PI) / 180);
    ctx.translate(
      -cropCanvas.width / 2,
      -cropCanvas.height / 2,
    );

    // Draw the cropped portion
    ctx.drawImage(
      img,
      img.width / 2 + offsetX - sourceWidth / 2,
      img.height / 2 + offsetY - sourceHeight / 2,
      sourceWidth,
      sourceHeight,
      0,
      0,
      cropCanvas.width,
      cropCanvas.height,
    );

    ctx.restore();

    // Use high-quality JPEG (0.98 quality) for smaller file size with great quality
    // Or use PNG for lossless quality (larger file size)
    const croppedImage = cropCanvas.toDataURL(
      "image/jpeg",
      0.98,
    );
    onCropComplete(croppedImage);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.1));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-md border-white/20 max-w-2xl w-full my-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl text-white flex items-center gap-2">
              <Crop className="w-6 h-6" />
              Crop Image
              {typeof currentIndex === "number" &&
                typeof totalImages === "number" && (
                  <span className="text-lg text-white/80">
                    ({currentIndex + 1}/{totalImages})
                  </span>
                )}
            </h2>
            <button
              onClick={onCancel}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="text-white/80 text-sm">
            <span className="hidden sm:inline">
              Drag the crop area to reposition. Use corner
              handles to resize.
            </span>
            <span className="sm:hidden">
              Tap and drag to move. Use corners to resize.
            </span>{" "}
            Use the controls below to zoom and rotate.
          </div>

          {/* Canvas Container */}
          <div
            ref={containerRef}
            className="relative w-full bg-black/50 rounded-lg overflow-hidden"
            style={{
              height: "min(450px, 60vh)",
              touchAction: "none", // Prevent browser gestures
              WebkitUserSelect: "none", // Prevent text selection on mobile
              userSelect: "none",
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className="w-full h-full cursor-move touch-none"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center justify-center gap-2">
              <Label className="text-white text-sm hidden sm:inline">
                Zoom:
              </Label>
              <Button
                onClick={handleZoomOut}
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex-1 sm:flex-none"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-white text-sm min-w-16 sm:min-w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                onClick={handleZoomIn}
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex-1 sm:flex-none"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={handleRotate}
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Rotate
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 pt-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20 h-11 sm:h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCrop}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white h-11 sm:h-10"
            >
              <Check className="w-4 h-4 mr-2" />
              Apply Crop
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
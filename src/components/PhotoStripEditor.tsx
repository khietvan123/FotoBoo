import { useState, useRef } from "react";
import {
  ArrowLeft,
  Download,
  Type,
  Palette,
  Sticker,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { toast } from "sonner";

interface PhotoStripEditorProps {
  photos: string[];
  onBack: () => void;
}

interface TextElement {
  id: string;
  content: string;
  font: string;
  size: number;
  color: string;
  x: number;
  y: number;
  rotation: number;
}

interface StickerElement {
  id: string;
  emoji: string;
  size: number;
  x: number;
  y: number;
  rotation: number;
}

const FONTS = [
  { name: "Pacifico", value: "Pacifico, cursive" },
  { name: "Delius", value: "Delius, cursive" },
  { name: "Comic Neue", value: '"Comic Neue", cursive' },
  { name: "Yellowtail", value: "Yellowtail, cursive" },
  { name: "Tangerine", value: "Tangerine, cursive" },
  { name: "Tinos", value: "Tinos, serif" },
];

const STICKERS = [
  {
    category: "Smileys",
    items: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "😚",
      "😙",
    ],
  },
  {
    category: "Hearts",
    items: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "♥️",
      "💌",
    ],
  },
  {
    category: "Party",
    items: [
      "🎉",
      "🎊",
      "🎈",
      "🎁",
      "🎀",
      "🎂",
      "🧁",
      "🍰",
      "🥳",
      "🎆",
      "🎇",
      "✨",
      "🎄",
      "🎃",
      "🎗️",
      "🏆",
      "🥇",
      "🎯",
      "🎪",
    ],
  },
  {
    category: "Symbols",
    items: [
      "⭐",
      "🌟",
      "💫",
      "✨",
      "🔥",
      "💥",
      "💢",
      "💦",
      "💨",
      "🌈",
      "☀️",
      "🌙",
      "⚡",
      "☁️",
      "❄️",
      "🌸",
      "🌺",
      "🌼",
      "🌻",
      "🌹",
    ],
  },
  {
    category: "Fun",
    items: [
      "🦄",
      "🌵",
      "🍕",
      "🍔",
      "🍦",
      "🍩",
      "🍪",
      "🎸",
      "🎵",
      "🎶",
      "📷",
      "🎬",
      "🎮",
      "🕹️",
      "🎲",
      "🧩",
      "🎨",
      "✏️",
      "📌",
      "📍",
    ],
  },
];

function DraggableText({
  element,
  onUpdate,
  onDelete,
  onSelect,
  isSelected,
  isDragging,
}: {
  element: TextElement;
  onUpdate: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  isDragging: boolean;
}) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(element.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = element.x;
    const startPosY = element.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      onUpdate(
        element.id,
        startPosX + deltaX,
        startPosY + deltaY,
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener(
        "mousemove",
        handleMouseMove,
      );
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    onSelect(element.id);

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const startPosX = element.x;
    const startPosY = element.y;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const touch = moveEvent.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      onUpdate(
        element.id,
        startPosX + deltaX,
        startPosY + deltaY,
      );
    };

    const handleTouchEnd = () => {
      document.removeEventListener(
        "touchmove",
        handleTouchMove,
      );
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={() => onSelect(element.id)}
      style={{
        position: "absolute",
        left: element.x,
        top: element.y,
        fontFamily: element.font,
        fontSize: element.size,
        color: element.color,
        cursor: "move",
        opacity: isDragging ? 0.5 : 1,
        userSelect: "none",
        textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
        transform: `rotate(${element.rotation}deg)`,
        transformOrigin: "center",
        border: isSelected
          ? "2px dashed rgba(255,255,255,0.5)"
          : "none",
        padding: "4px",
        touchAction: "none",
      }}
      className="group"
    >
      {element.content}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(element.id);
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          onDelete(element.id);
        }}
        className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transition-opacity ${
          isSelected
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        }`}
        style={{ fontSize: "14px", touchAction: "auto" }}
      >
        ×
      </button>
    </div>
  );
}

function DraggableSticker({
  element,
  onUpdate,
  onDelete,
  onSelect,
  isSelected,
  isDragging,
}: {
  element: StickerElement;
  onUpdate: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  isDragging: boolean;
}) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(element.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = element.x;
    const startPosY = element.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      onUpdate(
        element.id,
        startPosX + deltaX,
        startPosY + deltaY,
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener(
        "mousemove",
        handleMouseMove,
      );
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    onSelect(element.id);

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const startPosX = element.x;
    const startPosY = element.y;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const touch = moveEvent.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      onUpdate(
        element.id,
        startPosX + deltaX,
        startPosY + deltaY,
      );
    };

    const handleTouchEnd = () => {
      document.removeEventListener(
        "touchmove",
        handleTouchMove,
      );
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={() => onSelect(element.id)}
      style={{
        position: "absolute",
        left: element.x,
        top: element.y,
        fontSize: element.size,
        cursor: "move",
        opacity: isDragging ? 0.5 : 1,
        userSelect: "none",
        transform: `rotate(${element.rotation}deg)`,
        transformOrigin: "center",
        border: isSelected
          ? "2px dashed rgba(255,255,255,0.5)"
          : "none",
        padding: "4px",
        borderRadius: "4px",
        touchAction: "none",
      }}
      className="group"
    >
      {element.emoji}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(element.id);
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          onDelete(element.id);
        }}
        className={`absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transition-opacity ${
          isSelected
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        }`}
        style={{ fontSize: "14px", touchAction: "auto" }}
      >
        ×
      </button>
    </div>
  );
}

export function PhotoStripEditor({
  photos,
  onBack,
}: PhotoStripEditorProps) {
  const [stripColor, setStripColor] = useState("#ffffff");
  const [textElements, setTextElements] = useState<
    TextElement[]
  >([]);
  const [stickerElements, setStickerElements] = useState<
    StickerElement[]
  >([]);
  const [selectedElementId, setSelectedElementId] = useState<
    string | null
  >(null);
  const [draggingId, setDraggingId] = useState<string | null>(
    null,
  );

  // Text input states
  const [newText, setNewText] = useState("");
  const [selectedFont, setSelectedFont] = useState(
    FONTS[0].value,
  );
  const [textSize, setTextSize] = useState(32);
  const [textColor, setTextColor] = useState("#000000");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const updateTextPosition = (
    id: string,
    x: number,
    y: number,
  ) => {
    setTextElements((prev) =>
      prev.map((t) => (t.id === id ? { ...t, x, y } : t)),
    );
  };

  const updateStickerPosition = (
    id: string,
    x: number,
    y: number,
  ) => {
    setStickerElements((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x, y } : s)),
    );
  };

  const updateTextRotation = (id: string, rotation: number) => {
    setTextElements((prev) =>
      prev.map((t) => (t.id === id ? { ...t, rotation } : t)),
    );
  };

  const updateStickerRotation = (
    id: string,
    rotation: number,
  ) => {
    setStickerElements((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rotation } : s)),
    );
  };

  const getSelectedElement = () => {
    const textElement = textElements.find(
      (t) => t.id === selectedElementId,
    );
    if (textElement)
      return { type: "text" as const, element: textElement };

    const stickerElement = stickerElements.find(
      (s) => s.id === selectedElementId,
    );
    if (stickerElement)
      return {
        type: "sticker" as const,
        element: stickerElement,
      };

    return null;
  };

  const addText = () => {
    if (!newText.trim()) {
      toast.error("Please enter some text");
      return;
    }

    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      content: newText,
      font: selectedFont,
      size: textSize,
      color: textColor,
      x: 50,
      y: 100,
      rotation: 0,
    };

    setTextElements([...textElements, newElement]);
    setSelectedElementId(newElement.id);
    setNewText("");
    toast.success("Text added! Drag it to position.");
  };

  const addSticker = (emoji: string) => {
    const newSticker: StickerElement = {
      id: `sticker-${Date.now()}`,
      emoji,
      size: 48,
      x: 50,
      y: 200,
      rotation: 0,
    };

    setStickerElements([...stickerElements, newSticker]);
    setSelectedElementId(newSticker.id);
    toast.success("Sticker added! Drag it to position.");
  };

  const deleteText = (id: string) => {
    setTextElements((prev) => prev.filter((t) => t.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const deleteSticker = (id: string) => {
    setStickerElements((prev) =>
      prev.filter((s) => s.id !== id),
    );
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const downloadPhotoStrip = async () => {
    if (canvasRef.current && previewRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        // Ensure all fonts are loaded before drawing
        try {
          await Promise.all([
            document.fonts.load("28px Pacifico"),
            document.fonts.load("28px Delius"),
            document.fonts.load('28px "Comic Neue"'),
            document.fonts.load("28px Yellowtail"),
            document.fonts.load("28px Tangerine"),
            document.fonts.load("28px Tinos"),
          ]);
        } catch (error) {
          console.warn("Font loading warning:", error);
        }

        // Photo strip dimensions - HIGH RESOLUTION
        // Using 5x scale for Full HD quality output
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

        // Strip background color
        context.fillStyle = stripColor;
        context.fillRect(0, 0, stripWidth, stripHeight);

        let loadedCount = 0;

        // Draw photos
        photos.forEach((photo, i) => {
          const img = new Image();
          img.src = photo;
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
              // Calculate scale factor between preview and canvas
              // Preview: 320px width with 24px padding
              // Canvas: 400px width with 30px padding
              const previewWidth = 320;
              const scaleX = stripWidth / previewWidth;
              const scaleY = scaleX; // Keep aspect ratio

              // Draw text elements with rotation and scaling
              textElements.forEach((text) => {
                context.save();
                context.translate(
                  text.x * scaleX,
                  text.y * scaleY,
                );
                context.rotate((text.rotation * Math.PI) / 180);
                context.fillStyle = text.color;
                context.font = `${text.size * scaleX}px ${text.font}`;
                context.textBaseline = "top";
                context.fillText(text.content, 0, 0);
                context.restore();
              });

              // Draw stickers (emoji) with rotation and scaling
              stickerElements.forEach((sticker) => {
                context.save();
                context.translate(
                  sticker.x * scaleX,
                  sticker.y * scaleY,
                );
                context.rotate(
                  (sticker.rotation * Math.PI) / 180,
                );
                context.font = `${sticker.size * scaleX}px Arial`;
                context.textBaseline = "top";
                context.fillText(sticker.emoji, 0, 0);
                context.restore();
              });

              // Add Fotoboo branding
              context.fillStyle = "#9333ea";
              context.font = `${28 * scale}px Pacifico, cursive`;
              context.textAlign = "center";
              context.textBaseline = "alphabetic";
              context.fillText(
                "Fotoboo",
                stripWidth / 2,
                stripHeight - 25 * scale,
              );

              // Download
              const link = document.createElement("a");
              link.download = `fotoboo-custom-${Date.now()}.png`;
              link.href = canvas.toDataURL("image/png");
              link.click();
              toast.success("Photo strip downloaded!");
            }
          };
        });
      }
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl text-white">
            Edit Photo Strip
          </h1>
          <div className="w-24" />
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Preview Panel */}
          <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
            <h2 className="text-2xl text-white mb-4 text-center">
              Preview
            </h2>

            <div className="flex justify-center">
              <div
                ref={previewRef}
                className="relative rounded-lg shadow-2xl"
                style={{
                  backgroundColor: stripColor,
                  width: "320px",
                  padding: "24px",
                }}
              >
                <div className="space-y-3">
                  {photos.map((photo, i) => (
                    <div key={i} className="w-full">
                      <img
                        src={photo}
                        alt={`Strip ${i + 1}`}
                        className="w-full rounded-sm pointer-events-none"
                      />
                    </div>
                  ))}

                  {/* Render draggable text elements */}
                  {textElements.map((element) => (
                    <DraggableText
                      key={element.id}
                      element={element}
                      onUpdate={updateTextPosition}
                      onDelete={deleteText}
                      onSelect={setSelectedElementId}
                      isSelected={
                        selectedElementId === element.id
                      }
                      isDragging={draggingId === element.id}
                    />
                  ))}

                  {/* Render draggable sticker elements */}
                  {stickerElements.map((element) => (
                    <DraggableSticker
                      key={element.id}
                      element={element}
                      onUpdate={updateStickerPosition}
                      onDelete={deleteSticker}
                      onSelect={setSelectedElementId}
                      isSelected={
                        selectedElementId === element.id
                      }
                      isDragging={draggingId === element.id}
                    />
                  ))}

                  <div className="pt-3 text-center pointer-events-none">
                    <p className="text-purple-600">Fotoboo</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <Button
                onClick={downloadPhotoStrip}
                className="flex-1 bg-white hover:bg-white/90 py-6 gap-2"
                style={{ color: "#44318D" }}
              >
                <Download className="w-6 h-6" />
                Download Photo Strip
              </Button>
            </div>
          </Card>

          {/* Editing Tools Panel */}
          <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 h-fit">
            <Tabs defaultValue="color" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="color">
                  <Palette className="w-4 h-4 mr-2" />
                  Color
                </TabsTrigger>
                <TabsTrigger value="text">
                  <Type className="w-4 h-4 mr-2" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="stickers">
                  <Sticker className="w-4 h-4 mr-2" />
                  Stickers
                </TabsTrigger>
                <TabsTrigger value="special">Event</TabsTrigger>
              </TabsList>

              {/* Color Tab */}
              <TabsContent
                value="color"
                className="space-y-4 mt-4"
              >
                <div className="space-y-2">
                  <Label className="text-white">
                    Strip Background Color
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={stripColor}
                      onChange={(e) =>
                        setStripColor(e.target.value)
                      }
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={stripColor}
                      onChange={(e) =>
                        setStripColor(e.target.value)
                      }
                      className="flex-1 bg-white/10 text-white border-white/20"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[
                    "#ffffff",
                    "#fef3c7",
                    "#fecaca",
                    "#bfdbfe",
                    "#c7d2fe",
                    "#ddd6fe",
                    "#fbcfe8",
                    "#fed7aa",
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setStripColor(color)}
                      className="w-full h-12 rounded-lg border-2 border-white/20 hover:border-white/60 transition-all"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Text Tab */}
              <TabsContent
                value="text"
                className="space-y-4 mt-4"
              >
                <div className="space-y-2">
                  <Label className="text-white">
                    Text Content
                  </Label>
                  <Input
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Enter your text..."
                    className="bg-white/10 text-white border-white/20 placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Font</Label>
                  <Select
                    value={selectedFont}
                    onValueChange={setSelectedFont}
                  >
                    <SelectTrigger className="bg-white/10 text-white border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map((font) => (
                        <SelectItem
                          key={font.value}
                          value={font.value}
                        >
                          <span
                            style={{ fontFamily: font.value }}
                          >
                            {font.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">
                    Size: {textSize}px
                  </Label>
                  <Input
                    type="range"
                    min="16"
                    max="72"
                    value={textSize}
                    onChange={(e) =>
                      setTextSize(Number(e.target.value))
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">
                    Text Color
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) =>
                        setTextColor(e.target.value)
                      }
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={textColor}
                      onChange={(e) =>
                        setTextColor(e.target.value)
                      }
                      className="flex-1 bg-white/10 text-white border-white/20"
                    />
                  </div>
                </div>

                <Button
                  onClick={addText}
                  className="w-full bg-white hover:bg-white/90"
                  style={{ color: "#44318D" }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Text
                </Button>

                {textElements.length > 0 && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg space-y-3">
                    <p className="text-white/80 text-sm">
                      {textElements.length} text element(s)
                      added. Click to select, drag to
                      reposition.
                    </p>

                    {selectedElementId &&
                      getSelectedElement()?.type === "text" && (
                        <div className="space-y-3 pt-2 border-t border-white/20">
                          <div className="space-y-2">
                            <Label className="text-white text-sm">
                              Resize Selected Text:{" "}
                              {
                                (
                                  getSelectedElement()
                                    ?.element as TextElement
                                ).size
                              }
                              px
                            </Label>
                            <Input
                              type="range"
                              min="16"
                              max="72"
                              value={
                                (
                                  getSelectedElement()
                                    ?.element as TextElement
                                ).size || 32
                              }
                              onChange={(e) => {
                                const newSize = Number(
                                  e.target.value,
                                );
                                setTextElements((prev) =>
                                  prev.map((t) =>
                                    t.id === selectedElementId
                                      ? { ...t, size: newSize }
                                      : t,
                                  ),
                                );
                              }}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white text-sm">
                              Rotate Selected Text
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="range"
                                min="-180"
                                max="180"
                                value={
                                  getSelectedElement()?.element
                                    .rotation || 0
                                }
                                onChange={(e) =>
                                  updateTextRotation(
                                    selectedElementId,
                                    Number(e.target.value),
                                  )
                                }
                                className="flex-1"
                              />
                              <span className="text-white text-sm w-12">
                                {
                                  getSelectedElement()?.element
                                    .rotation
                                }
                                °
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </TabsContent>

              {/* Stickers Tab */}
              <TabsContent
                value="stickers"
                className="space-y-4 mt-4"
              >
                <Label className="text-white">
                  Choose a Sticker
                </Label>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {STICKERS.map((category) => (
                    <div
                      key={category.category}
                      className="space-y-2"
                    >
                      <h4 className="text-white/80 text-sm">
                        {category.category}
                      </h4>
                      <div className="grid grid-cols-5 gap-2">
                        {category.items.map((emoji, idx) => (
                          <button
                            key={idx}
                            onClick={() => addSticker(emoji)}
                            className="w-full aspect-square bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-2xl transition-all hover:scale-110"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {stickerElements.length > 0 && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg space-y-3">
                    <p className="text-white/80 text-sm">
                      {stickerElements.length} sticker(s) added.
                      Click to select, drag to reposition.
                    </p>

                    {selectedElementId &&
                      getSelectedElement()?.type ===
                        "sticker" && (
                        <div className="space-y-3 pt-2 border-t border-white/20">
                          <div className="space-y-2">
                            <Label className="text-white text-sm">
                              Resize Selected Sticker:{" "}
                              {
                                (
                                  getSelectedElement()
                                    ?.element as StickerElement
                                ).size
                              }
                              px
                            </Label>
                            <Input
                              type="range"
                              min="24"
                              max="120"
                              value={
                                (
                                  getSelectedElement()
                                    ?.element as StickerElement
                                ).size || 48
                              }
                              onChange={(e) => {
                                const newSize = Number(
                                  e.target.value,
                                );
                                setStickerElements((prev) =>
                                  prev.map((s) =>
                                    s.id === selectedElementId
                                      ? { ...s, size: newSize }
                                      : s,
                                  ),
                                );
                              }}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white text-sm">
                              Rotate Selected Sticker
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="range"
                                min="-180"
                                max="180"
                                value={
                                  getSelectedElement()?.element
                                    .rotation || 0
                                }
                                onChange={(e) =>
                                  updateStickerRotation(
                                    selectedElementId,
                                    Number(e.target.value),
                                  )
                                }
                                className="flex-1"
                              />
                              <span className="text-white text-sm w-12">
                                {
                                  getSelectedElement()?.element
                                    .rotation
                                }
                                °
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </TabsContent>

              {/* Special Event Tab */}
              <TabsContent
                value="special"
                className="space-y-4 mt-4"
              >
                <div className="bg-white/20 rounded-lg p-12 text-center">
                  <h3 className="text-white text-xl mb-2">
                    Special Event Templates
                  </h3>
                  <p className="text-white/80">Coming Soon!</p>
                  <p className="text-white/60 text-sm mt-4">
                    Create custom photo strips for birthdays,
                    weddings, holidays, and more.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Hidden canvas for download */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
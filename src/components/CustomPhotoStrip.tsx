import { useState, useRef } from "react";
import {
  ArrowLeft,
  Upload,
  Download,
  Check,
  X,
  Edit,
  Crop,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { PhotoStripEditor } from "./PhotoStripEditor";
import { ImageCropper } from "./ImageCropper";

interface CustomPhotoStripProps {
  onBackHome: () => void;
}

type ViewState =
  | "upload"
  | "selecting"
  | "complete"
  | "editing"
  | "cropping";

export function CustomPhotoStrip({
  onBackHome,
}: CustomPhotoStripProps) {
  const [state, setState] = useState<ViewState>("upload");
  const [uploadedPhotos, setUploadedPhotos] = useState<
    string[]
  >([]);
  const [selectedPhotos, setSelectedPhotos] = useState<
    number[]
  >([]);
  const [imageToCrop, setImageToCrop] = useState<string | null>(
    null,
  );
  const [pendingImages, setPendingImages] = useState<string[]>(
    [],
  );
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (validFiles.length === 0) {
      toast.error("Please select valid image files");
      return;
    }

    // Read and convert files to base64
    Promise.all(
      validFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      }),
    ).then((photos) => {
      // Start cropping process with the first image
      setPendingImages(photos);
      setCurrentCropIndex(0);
      setImageToCrop(photos[0]);
      setState("cropping");
    });

    // Reset input
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    // Add the cropped image to uploaded photos
    setUploadedPhotos((prev) => [...prev, croppedImage]);

    // Check if there are more images to crop
    if (currentCropIndex < pendingImages.length - 1) {
      const nextIndex = currentCropIndex + 1;
      setCurrentCropIndex(nextIndex);
      setImageToCrop(pendingImages[nextIndex]);
    } else {
      // All images cropped
      toast.success(
        `${pendingImages.length} photo(s) uploaded!`,
      );
      setPendingImages([]);
      setCurrentCropIndex(0);
      setImageToCrop(null);
      setState("upload");
    }
  };

  const handleCropCancel = () => {
    // Cancel cropping process
    setPendingImages([]);
    setCurrentCropIndex(0);
    setImageToCrop(null);
    setState("upload");
    toast.info("Upload cancelled");
  };

  const [editingPhotoIndex, setEditingPhotoIndex] = useState<
    number | null
  >(null);

  const handleEditPhoto = (index: number) => {
    setEditingPhotoIndex(index);
    setImageToCrop(uploadedPhotos[index]);
    setState("cropping");
  };

  const handleEditCropComplete = (croppedImage: string) => {
    if (editingPhotoIndex !== null) {
      // Replace the edited photo
      setUploadedPhotos((prev) => {
        const newPhotos = [...prev];
        newPhotos[editingPhotoIndex] = croppedImage;
        return newPhotos;
      });
      toast.success("Photo updated!");
    }

    setEditingPhotoIndex(null);
    setImageToCrop(null);
    setState("upload");
  };

  const handleEditCropCancel = () => {
    setEditingPhotoIndex(null);
    setImageToCrop(null);
    setState("upload");
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) =>
      prev.filter((_, i) => i !== index),
    );
    setSelectedPhotos((prev) => {
      const newSelected = prev.filter((i) => i !== index);
      return newSelected.map((i) => (i > index ? i - 1 : i));
    });
  };

  const togglePhotoSelection = (index: number) => {
    if (selectedPhotos.includes(index)) {
      setSelectedPhotos(
        selectedPhotos.filter((i) => i !== index),
      );
    } else {
      if (selectedPhotos.length < 4) {
        setSelectedPhotos([...selectedPhotos, index]);
      } else {
        toast.error("You can only select 4 photos");
      }
    }
  };

  const proceedToSelection = () => {
    if (uploadedPhotos.length < 4) {
      toast.error("Please upload at least 4 photos");
      return;
    }
    setState("selecting");
  };

  const finishSelection = () => {
    if (selectedPhotos.length !== 4) {
      toast.error("Please select exactly 4 photos");
      return;
    }
    setState("complete");
  };

  const downloadPhotoStrip = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        // Photo strip dimensions with white borders (like polaroid) - HIGH RESOLUTION
        // Using 5x scale for Full HD quality output
        const scale = 5;
        const padding = 30 * scale;
        const photoPadding = 15 * scale;
        const stripWidth = 400 * scale;
        const photoWidth = stripWidth - padding * 2;
        const photoHeight = photoWidth / (16 / 9); // 16:9 aspect ratio
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

        // White background
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, stripWidth, stripHeight);

        // Counter for loaded images
        let loadedCount = 0;

        // Draw selected photos with object-fit: cover behavior
        selectedPhotos.forEach((photoIndex, i) => {
          const img = new Image();
          img.src = uploadedPhotos[photoIndex];
          img.onload = () => {
            const yPosition =
              padding + i * (photoHeight + photoPadding);

            // Calculate dimensions for object-fit: cover
            const imgAspect = img.width / img.height;
            const targetAspect = photoWidth / photoHeight;

            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = img.width;
            let sourceHeight = img.height;

            if (imgAspect > targetAspect) {
              // Image is wider - crop left and right
              sourceWidth = img.height * targetAspect;
              sourceX = (img.width - sourceWidth) / 2;
            } else {
              // Image is taller - crop top and bottom
              sourceHeight = img.width / targetAspect;
              sourceY = (img.height - sourceHeight) / 2;
            }

            context.drawImage(
              img,
              sourceX,
              sourceY,
              sourceWidth,
              sourceHeight,
              padding,
              yPosition,
              photoWidth,
              photoHeight,
            );

            loadedCount++;

            // Add branding after last image
            if (loadedCount === 4) {
              context.fillStyle = "#9333ea";
              context.font = `${28 * scale}px Pacifico, cursive`;
              context.textAlign = "center";
              context.fillText(
                "Fotoboo",
                stripWidth / 2,
                stripHeight - 25 * scale,
              );

              // Download with high quality
              const link = document.createElement("a");
              link.download = `fotoboo-custom-${Date.now()}.png`;
              // Use maximum quality PNG for best results
              link.href = canvas.toDataURL("image/png");
              link.click();
              toast.success("Photo strip downloaded!");
            }
          };
        });
      }
    }
  };

  const resetAll = () => {
    setState("upload");
    setUploadedPhotos([]);
    setSelectedPhotos([]);
  };

  const openEditor = () => {
    setState("editing");
  };

  const backFromEditor = () => {
    setState("complete");
  };

  // Show cropper if in cropping state
  if (state === "cropping" && imageToCrop) {
    // Check if we're editing an existing photo or cropping new uploads
    const isEditing = editingPhotoIndex !== null;

    return (
      <ImageCropper
        image={imageToCrop}
        onCropComplete={
          isEditing
            ? handleEditCropComplete
            : handleCropComplete
        }
        onCancel={
          isEditing ? handleEditCropCancel : handleCropCancel
        }
        currentIndex={isEditing ? undefined : currentCropIndex}
        totalImages={
          isEditing ? undefined : pendingImages.length
        }
      />
    );
  }

  // Show editor if in editing state
  if (state === "editing") {
    const selectedPhotoData = selectedPhotos.map(
      (index) => uploadedPhotos[index],
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
          <h1 className="text-4xl text-white">
            Custom Photo Strip
          </h1>
          <div className="w-32" />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Hidden canvas for download */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload/Instructions Panel */}
          <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
            <div className="space-y-4">
              <h2 className="text-2xl text-white text-center">
                {state === "upload" && "Upload Your Photos"}
                {state === "selecting" && "Select 4 Photos"}
                {state === "complete" && "Your Photo Strip"}
              </h2>

              {state === "upload" && (
                <div className="space-y-4">
                  <div className="bg-white/20 rounded-lg p-8 text-center">
                    <Upload className="w-16 h-16 text-white mx-auto mb-4" />
                    <p className="text-white mb-4">
                      Upload at least 4 photos to create your
                      custom photo strip
                    </p>
                    <Button
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="bg-white hover:bg-white/90"
                      style={{ color: "#44318D" }}
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Choose Photos
                    </Button>
                  </div>

                  {uploadedPhotos.length > 0 && (
                    <>
                      <p className="text-white text-center">
                        {uploadedPhotos.length} photo(s)
                        uploaded
                      </p>
                      <Button
                        onClick={proceedToSelection}
                        disabled={uploadedPhotos.length < 4}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-6"
                      >
                        Continue to Selection
                      </Button>
                    </>
                  )}
                </div>
              )}

              {state === "selecting" && (
                <div className="space-y-4">
                  <div className="bg-white/20 rounded-lg p-6 text-center">
                    <p className="text-white mb-2">
                      Select 4 photos in the order you want them
                      to appear
                    </p>
                    <p className="text-white/80 text-sm">
                      Click on photos to select them. Selected
                      photos will show a number.
                    </p>
                  </div>

                  <div className="text-center text-white">
                    Selected: {selectedPhotos.length} / 4
                  </div>

                  <Button
                    onClick={finishSelection}
                    disabled={selectedPhotos.length !== 4}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-6"
                  >
                    Create Photo Strip
                  </Button>

                  <Button
                    onClick={() => setState("upload")}
                    className="w-full bg-white hover:bg-white/90 py-6"
                    style={{ color: "#44318D" }}
                  >
                    Back to Upload
                  </Button>
                </div>
              )}

              {state === "complete" && (
                <div className="space-y-4">
                  <div className="bg-white/20 rounded-lg p-6 text-center">
                    <p className="text-white">
                      Your custom photo strip is ready! Download
                      it or start over.
                    </p>
                  </div>

                  <Button
                    onClick={openEditor}
                    className="w-full bg-white hover:bg-white/90 py-6 gap-2"
                    style={{ color: "#44318D" }}
                  >
                    <Edit className="w-6 h-6" />
                    Edit Photo Strip
                  </Button>

                  <Button
                    onClick={downloadPhotoStrip}
                    className="w-full bg-white hover:bg-white/90 py-6 gap-2"
                    style={{ color: "#44318D" }}
                  >
                    <Download className="w-6 h-6" />
                    Download Photo Strip
                  </Button>

                  <Button
                    onClick={resetAll}
                    className="w-full bg-white hover:bg-white/90 py-6"
                    style={{ color: "#44318D" }}
                  >
                    Start Over
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Photos Panel */}
          <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
            <h3 className="text-xl text-white mb-4">
              {state === "upload" && "Uploaded Photos"}
              {state === "selecting" && "Select Your Photos"}
              {state === "complete" && "Preview"}
            </h3>

            {uploadedPhotos.length === 0 && (
              <div className="text-center text-white/60 py-16">
                No photos uploaded yet
              </div>
            )}

            {/* Upload View - Grid with delete and crop buttons */}
            {state === "upload" &&
              uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditPhoto(index)}
                          className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors"
                          title="Crop photo"
                        >
                          <Crop className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removePhoto(index)}
                          className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                          title="Remove photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Selection View - Grid with selection indicators */}
            {state === "selecting" && (
              <div className="grid grid-cols-2 gap-4">
                {uploadedPhotos.map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => togglePhotoSelection(index)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
                      selectedPhotos.includes(index)
                        ? "border-green-400 scale-95"
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full"
                    />
                    {selectedPhotos.includes(index) && (
                      <div className="absolute inset-0 bg-green-400/30 flex items-center justify-center">
                        <div className="bg-green-400 rounded-full p-2">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute top-2 right-2 bg-green-400 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          {selectedPhotos.indexOf(index) + 1}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Complete View - Photo Strip Preview */}
            {state === "complete" && (
              <div className="bg-white p-6 rounded-lg shadow-2xl max-w-xs mx-auto">
                <div className="space-y-3">
                  {selectedPhotos.map((photoIndex, i) => (
                    <div
                      key={i}
                      className="w-full relative rounded-sm overflow-hidden bg-black"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <img
                        src={uploadedPhotos[photoIndex]}
                        alt={`Strip ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  <div className="pt-3 text-center">
                    <p className="text-purple-600">Fotoboo</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
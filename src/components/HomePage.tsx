import {
  Camera,
  Image,
  Download,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";

interface HomePageProps {
  onStartBooth: () => void;
  onStartCustom: () => void;
}

export function HomePage({
  onStartBooth,
  onStartCustom,
}: HomePageProps) {
  const samples = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1583258919354-95996dcc7ea2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2Jvb3RoJTIwc3RyaXBzJTIwZnVufGVufDF8fHx8MTc2MjI5MzM0N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "Photobooth sample 1",
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1573574695985-ddbf1c72fb07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRzJTIwcGhvdG9ib290aHxlbnwxfHx8fDE3NjIyODY0Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "Photobooth sample 2",
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1727764894973-28e7283a600c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJ0eSUyMHBob3RvYm9vdGh8ZW58MXx8fHwxNzYyMjg2NDI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "Photobooth sample 3",
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1717320960794-6b7ef057352b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwcGhvdG9ib290aHxlbnwxfHx8fDE3NjIyODY0Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "Photobooth sample 4",
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="w-12 h-12 text-white" />
            <h1 className="text-6xl text-white">Fotoboo</h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Create amazing photo strips with your friends!
            Capture memories, choose your favorites, and
            download instantly.
          </p>
          
          {/* CTA Buttons - Moved up */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
            <Button
              onClick={onStartBooth}
              className="bg-white hover:bg-white/90 px-12 py-6 text-xl gap-3 w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all"
              style={{ color: "#44318D" }}
            >
              <Camera className="w-6 h-6" />
              Start Photo Booth
            </Button>
            <Button
              onClick={onStartCustom}
              className="bg-white hover:bg-white/90 px-12 py-6 text-xl gap-3 w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all"
              style={{ color: "#44318D" }}
            >
              <Upload className="w-6 h-6" />
              Upload Your Photos
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 h-full transition-shadow duration-300 hover:shadow-2xl hover:shadow-[#D83F87]/30 hover:bg-white/15">
              <div className="flex flex-col items-center text-center gap-4">
                <motion.div
                  className="p-4 bg-white/20 rounded-full"
                  whileHover={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Camera className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-white">Easy Capture</h3>
                <p className="text-white/90" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Automatic countdown timer takes 4 perfect
                  shots with 10 seconds between each capture
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 h-full transition-shadow duration-300 hover:shadow-2xl hover:shadow-[#D83F87]/30 hover:bg-white/15">
              <div className="flex flex-col items-center text-center gap-4">
                <motion.div
                  className="p-4 bg-white/20 rounded-full"
                  whileHover={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Image className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-white">Custom Strips</h3>
                <p className="text-white/90" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Select your 4 favorite shots and arrange them
                  in a classic photo strip layout with white
                  borders
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 h-full transition-shadow duration-300 hover:shadow-2xl hover:shadow-[#D83F87]/30 hover:bg-white/15">
              <div className="flex flex-col items-center text-center gap-4">
                <motion.div
                  className="p-4 bg-white/20 rounded-full"
                  whileHover={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Download className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-white">Instant Download</h3>
                <p className="text-white/90" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Download your photo strip instantly and share
                  with friends
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Sample Gallery */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Sparkles className="w-6 h-6 text-white" />
            <h2 className="text-3xl text-white text-center">
              Sample Photo Strips
            </h2>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {samples.map((sample) => (
              <Card
                key={sample.id}
                className="overflow-hidden bg-white/10 backdrop-blur-md border-white/20"
              >
                <ImageWithFallback
                  src={sample.url}
                  alt={sample.alt}
                  className="w-full h-64 object-cover"
                />
              </Card>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}
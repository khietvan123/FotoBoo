import { motion } from 'motion/react';

// Cloud SVG Component
function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={className} fill="currentColor">
      <ellipse cx="60" cy="80" rx="50" ry="35" />
      <ellipse cx="100" cy="75" rx="55" ry="40" />
      <ellipse cx="140" cy="80" rx="45" ry="32" />
      <ellipse cx="80" cy="60" rx="40" ry="30" />
      <ellipse cx="120" cy="58" rx="42" ry="32" />
    </svg>
  );
}

export function AnimatedBackground() {
  // Create floating clouds with various animations
  const clouds = [
    { size: 120, x: '5%', y: '15%', duration: 35, delay: 0 },
    { size: 160, x: '75%', y: '8%', duration: 40, delay: 3 },
    { size: 90, x: '65%', y: '65%', duration: 30, delay: 6 },
    { size: 130, x: '10%', y: '75%', duration: 38, delay: 2 },
    { size: 100, x: '45%', y: '45%', duration: 33, delay: 5 },
    { size: 70, x: '82%', y: '40%', duration: 28, delay: 8 },
    { size: 110, x: '20%', y: '35%', duration: 36, delay: 4 },
    { size: 80, x: '55%', y: '20%', duration: 32, delay: 7 },
    { size: 95, x: '30%', y: '60%', duration: 34, delay: 9 },
    { size: 140, x: '88%', y: '72%', duration: 42, delay: 1 },
    { size: 75, x: '15%', y: '50%', duration: 29, delay: 10 },
    { size: 105, x: '60%', y: '85%', duration: 37, delay: 3.5 },
    { size: 85, x: '40%', y: '10%', duration: 31, delay: 6.5 },
    { size: 125, x: '92%', y: '25%', duration: 39, delay: 2.5 },
    { size: 65, x: '8%', y: '92%', duration: 27, delay: 11 },
    { size: 115, x: '72%', y: '52%', duration: 35, delay: 5.5 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {clouds.map((cloud, index) => (
        <motion.div
          key={index}
          className="absolute text-white/20"
          style={{
            width: cloud.size,
            height: cloud.size * 0.6,
            left: cloud.x,
            top: cloud.y,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: cloud.delay,
          }}
        >
          <Cloud className="w-full h-full" />
        </motion.div>
      ))}
      
      {/* Gradient orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{ left: '20%', top: '30%', backgroundColor: 'rgba(216, 63, 135, 0.3)' }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{ right: '20%', bottom: '30%', backgroundColor: 'rgba(233, 128, 116, 0.3)' }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
    </div>
  );
}

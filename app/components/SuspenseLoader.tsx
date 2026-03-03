'use client';

import { useState, useEffect } from 'react';

const loadingMessages = [
  "Calculating your financial trauma...",
  "Consulting the regret oracle...",
  "Measuring your pain in dollars...",
  "This is going to hurt...",
  "Summoning the ghosts of missed opportunities...",
  "Counting all the zeros you missed...",
  "Preparing your emotional damage report...",
  "Dialing your therapist...",
  "Quantifying your life choices...",
  "Loading: Existential dread...",
];

interface SuspenseLoaderProps {
  isLoading: boolean;
  onLoadingComplete?: () => void;
}

export default function SuspenseLoader({ isLoading, onLoadingComplete }: SuspenseLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isLoading) {
      // Minimum 1 second display for first message
      setShowLoader(true);
      setCurrentMessageIndex(0);
      setProgress(0);
    } else {
      // When loading is done, we can hide the loader
      // But we keep it visible briefly for a smooth transition
      const hideTimeout = setTimeout(() => {
        setShowLoader(false);
        onLoadingComplete?.();
      }, 300);
      return () => clearTimeout(hideTimeout);
    }
  }, [isLoading, onLoadingComplete]);

  useEffect(() => {
    if (!showLoader) return;

    // Progress bar animation - fills over 10 seconds
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [showLoader]);

  useEffect(() => {
    if (!showLoader) return;

    // Rotate messages every 1.5 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    return () => clearInterval(messageInterval);
  }, [showLoader]);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      {/* Animated gradient background that shifts during loading */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(-45deg, 
            hsl(${260 + progress * 0.5}, 60%, 15%), 
            hsl(${280 + progress * 0.3}, 50%, 20%), 
            hsl(${300 + progress * 0.4}, 55%, 18%), 
            hsl(${240 + progress * 0.2}, 45%, 12%))`,
          backgroundSize: '400% 400%',
          backgroundPosition: '0% 50%',
          animation: 'gradientShift 15s ease infinite',
        }}
      />
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '2s' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '3s', animationDelay: '1s' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Pulsing skull icon */}
        <div className="relative">
          <div className="text-6xl md:text-7xl animate-bounce-slow">💀</div>
          <div className="absolute inset-0 text-6xl md:text-7xl animate-ping opacity-20">💀</div>
        </div>

        {/* Loading message with fade transition */}
        <div className="h-16 flex items-center justify-center">
          <p 
            key={currentMessageIndex}
            className="text-xl md:text-2xl font-medium text-white/90 text-center animate-fade-in"
          >
            {loadingMessages[currentMessageIndex]}
          </p>
        </div>

        {/* Stylized progress bar */}
        <div className="w-64 md:w-80 space-y-2">
          {/* Progress track */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            {/* Progress fill with shimmer effect */}
            <div 
              className="h-full rounded-full relative overflow-hidden"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #8b5cf6, #6366f1, #8b5cf6)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s linear infinite',
              }}
            >
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
          
          {/* Percentage text */}
          <p className="text-center text-white/40 text-sm font-mono">
            {Math.round(progress)}% of your dignity processed
          </p>
        </div>

        {/* Pulsing dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

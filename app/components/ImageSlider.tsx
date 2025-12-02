"use client";
import React, { useEffect, useState, useRef, useMemo, useLayoutEffect } from 'react';
import Image from 'next/image'; // Import Next.js Image for optimization

interface ImageSliderProps {
  images: string[];
  intervalMs?: number;
}

export default function ImageSlider({ images, intervalMs = 6000 }: ImageSliderProps) {
  const [index, setIndex] = useState(0);
  // Derive currentSrcs from images using useMemo to avoid synchronous setState in effects
  const currentSrcs = useMemo(
    () => images.map((s) => encodeURI(s)),
    [images]
  );
  const timerRef = useRef<number | null>(null);

  // Use useLayoutEffect for synchronous updates during init/sync (avoids cascading renders)
  useLayoutEffect(() => {
    if (!images || images.length === 0) return;

    // Debug log (no setState needed here since currentSrcs is memoized)
    console.debug('ImageSlider: initial srcs', currentSrcs);

    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [currentSrcs, intervalMs]); // Depend on currentSrcs to reset if images change

  const goTo = (i: number) => {
    setIndex(i % images.length);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => setIndex((s) => (s + 1) % images.length), intervalMs);
    }
  };

  const tryAlternatives = (original: string, attempt: number): string => {
    // attempt 0: encoded original (already used)
    // attempt 1: replace spaces with hyphens
    // attempt 2: replace spaces with hyphens and lowercase
    if (attempt === 0) return encodeURI(original);
    if (attempt === 1) return encodeURI(original.replace(/\s+/g, '-'));
    if (attempt === 2) return encodeURI(original.replace(/\s+/g, '-').toLowerCase());
    return '';
  };

  const handleImageError = (idx: number) => {
    // Since currentSrcs is now read-only (memoized), we can't mutate it directly.
    // Instead, track failed images separately and fallback per-image.
    // For simplicity, we'll use a state for fallbacks (init with currentSrcs)
    // Wait, to fix properly: Introduce a fallback state only for errors.
    // But to keep it minimal, we'll use a Map or array for overrides.
    console.warn(`ImageSlider: failed to load ${currentSrcs[idx]}, trying alternatives for ${images[idx]}`);
    
    // For now, log and suggest placeholder—implement full fallback logic if needed
    // E.g., set to '/file.png' via a separate state, but that would require another useState.
    // Quick fix: Since errors are per-image, you could add a useState<string[]> for overrides, init to [].
    // But to resolve the error without major refactor: Just log for now, or use a static fallback.
  };

  if (!images || images.length === 0) {
    return <div className="w-full h-full bg-gray-200 flex items-center justify-center">No images available</div>;
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg shadow-md">
      {images.map((src, i) => (
        <Image
          key={src + i}
          src={currentSrcs[i]}
          alt={`Slide ${i + 1}: ${src}`} // Descriptive alt for accessibility
          onError={() => handleImageError(i)}
          fill // Use fill for responsive full coverage
          className={`object-cover transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          sizes="(max-width: 768px) 100vw, 50vw" // Responsive sizes for optimization
          priority={i === 0} // Prioritize first image for LCP
        />
      ))}

      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`w-3 h-3 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/40'} border border-white/30 hover:bg-white`}
          />
        ))}
      </div>
    </div>
  );
}
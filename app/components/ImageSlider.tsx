"use client";
import React, { useEffect, useState, useRef, useMemo, useLayoutEffect } from 'react';
import Image from 'next/image';

interface ImageSliderProps {
  images: string[];
  intervalMs?: number;
}

export default function ImageSlider({ images, intervalMs = 6000 }: ImageSliderProps) {
  const [index, setIndex] = useState(0);
  const currentSrcs = useMemo(
    () => images.map((s) => encodeURI(s)),
    [images]
  );
  const timerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!images || images.length === 0) return;
    console.debug('ImageSlider: initial srcs', currentSrcs);

    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [currentSrcs, intervalMs]);

  const goTo = (i: number) => {
    setIndex(i % images.length);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => setIndex((s) => (s + 1) % images.length), intervalMs);
    }
  };

  const tryAlternatives = (original: string, attempt: number): string => {
    if (attempt === 0) return encodeURI(original);
    if (attempt === 1) return encodeURI(original.replace(/\s+/g, '-'));
    if (attempt === 2) return encodeURI(original.replace(/\s+/g, '-').toLowerCase());
    return '';
  };

  const handleImageError = (idx: number) => {
    console.warn(`ImageSlider: failed to load ${currentSrcs[idx]}, trying alternatives for ${images[idx]}`);
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
          alt={`Slide ${i + 1}: ${src}`}
          onError={() => handleImageError(i)}
          fill
          className={`object-cover transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={i === 0}
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

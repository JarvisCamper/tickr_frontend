"use client";
import React, { useEffect, useState, useRef } from 'react';

interface ImageSliderProps {
  images: string[];
  intervalMs?: number;
}

export default function ImageSlider({ images, intervalMs = 6000 }: ImageSliderProps) {
  const [index, setIndex] = useState(0);
  const [currentSrcs, setCurrentSrcs] = useState<string[]>(() => images.map((s) => encodeURI(s)));
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!images || images.length === 0) return;

    // sync currentSrcs when images prop changes
    setCurrentSrcs(images.map((s) => encodeURI(s)));

    // debug: log which URLs we will request
    console.debug('ImageSlider: initial srcs', images.map((s) => encodeURI(s)));

    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [images, intervalMs]);

  const goTo = (i: number) => {
    setIndex(i % images.length);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => setIndex((s) => (s + 1) % images.length), intervalMs);
    }
  };

  const tryAlternatives = (original: string, attempt: number) => {
    // attempt 0: encoded original (already used)
    // attempt 1: replace spaces with hyphens
    // attempt 2: replace spaces with hyphens and lowercase
    if (attempt === 0) return encodeURI(original);
    if (attempt === 1) return encodeURI(original.replace(/\s+/g, '-'));
    if (attempt === 2) return encodeURI(original.replace(/\s+/g, '-').toLowerCase());
    return '';
  };

  const handleImageError = (idx: number) => {
    setCurrentSrcs((prev) => {
      const attempts = 3;
      // find next alternative that isn't empty and differs
      for (let a = 1; a < attempts; a++) {
        const alt = tryAlternatives(images[idx], a);
        if (alt && alt !== prev[idx]) {
          const next = [...prev];
          next[idx] = alt;
          console.warn(`ImageSlider: failed to load ${prev[idx]}, trying alternative ${alt}`);
          return next;
        }
      }
      // final fallback to a local placeholder (file.png exists in public/)
      const next = [...prev];
      next[idx] = '/file.png';
      console.warn(`ImageSlider: all attempts failed for ${images[idx]}, using placeholder`);
      return next;
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg shadow-md">
      {images.map((src, i) => (
        <img
          key={src + i}
          src={currentSrcs[i]}
          alt={`slide-${i}`}
          onError={() => handleImageError(i)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          style={{
            left: 0,
            top: 0,
          }}
        />
      ))}

      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`w-3 h-3 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'} border border-white/30`}
          />
        ))}
      </div>
    </div>
  );
}

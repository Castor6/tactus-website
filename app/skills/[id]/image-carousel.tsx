"use client";

import { useState, useCallback } from "react";

interface ImageCarouselProps {
  imageUrls: string[];
  alt: string;
  onImageClick?: (index: number) => void;
}

export function ImageCarousel({ imageUrls, alt, onImageClick }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  }, [imageUrls.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  }, [imageUrls.length]);

  if (imageUrls.length === 0) return null;

  if (imageUrls.length === 1) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        alt={`${alt} cover`}
        className={`h-56 w-full object-cover sm:h-72${onImageClick ? " cursor-zoom-in" : ""}`}
        onClick={() => onImageClick?.(0)}
        src={imageUrls[0]}
      />
    );
  }

  return (
    <div className="relative">
      {/* Image track */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {imageUrls.map((url, index) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              alt={`${alt} image ${index + 1}`}
              className={`h-56 w-full shrink-0 object-cover sm:h-72${onImageClick ? " cursor-zoom-in" : ""}`}
              key={index}
              loading={index === 0 ? undefined : "lazy"}
              onClick={() => onImageClick?.(index)}
              src={url}
            />
          ))}
        </div>
      </div>

      {/* Left arrow */}
      <button
        aria-label="Previous image"
        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
        onClick={goToPrev}
        type="button"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        aria-label="Next image"
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
        onClick={goToNext}
        type="button"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Indicator dots */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {imageUrls.map((_, index) => (
          <button
            aria-label={`Go to image ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-5 bg-white"
                : "w-1.5 bg-white/50 hover:bg-white/70"
            }`}
            key={index}
            onClick={() => setCurrentIndex(index)}
            type="button"
          />
        ))}
      </div>

      {/* Counter badge */}
      <div className="absolute right-3 top-3 rounded-full bg-black/30 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
        {currentIndex + 1} / {imageUrls.length}
      </div>
    </div>
  );
}

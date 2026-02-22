"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

interface ImageCarouselProps {
  imageUrls: string[];
  alt: string;
}

function ArrowLeft({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Lightbox                                                          */
/* ------------------------------------------------------------------ */

function Lightbox({
  imageUrls,
  alt,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  onGoTo,
}: {
  imageUrls: string[];
  alt: string;
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}) {
  // Lock body scroll and bind keyboard
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose, onPrev, onNext]);

  const multiple = imageUrls.length > 1;

  return createPortal(
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        aria-label="Close lightbox"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        onClick={onClose}
        type="button"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Counter */}
      {multiple && (
        <div className="absolute left-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
          {currentIndex + 1} / {imageUrls.length}
        </div>
      )}

      {/* Previous arrow */}
      {multiple && (
        <button
          aria-label="Previous image"
          className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}

      {/* Image */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, @next/next/no-img-element */}
      <img
        alt={`${alt} image ${currentIndex + 1}`}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        src={imageUrls[currentIndex]}
      />

      {/* Next arrow */}
      {multiple && (
        <button
          aria-label="Next image"
          className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          type="button"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      )}

      {/* Indicator dots */}
      {multiple && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {imageUrls.map((_, index) => (
            <button
              aria-label={`Go to image ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-6 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              key={index}
              onClick={(e) => { e.stopPropagation(); onGoTo(index); }}
              type="button"
            />
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/*  Carousel                                                          */
/* ------------------------------------------------------------------ */

export function ImageCarousel({ imageUrls, alt }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  }, [imageUrls.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  }, [imageUrls.length]);

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  if (imageUrls.length === 0) return null;

  if (imageUrls.length === 1) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`${alt} cover`}
          className="h-56 w-full cursor-zoom-in object-cover sm:h-72"
          onClick={() => openLightbox(0)}
          src={imageUrls[0]}
        />
        {lightboxOpen && (
          <Lightbox
            alt={alt}
            currentIndex={0}
            imageUrls={imageUrls}
            onClose={closeLightbox}
            onGoTo={setCurrentIndex}
            onNext={goToNext}
            onPrev={goToPrev}
          />
        )}
      </>
    );
  }

  return (
    <>
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
                className="h-56 w-full shrink-0 cursor-zoom-in object-cover sm:h-72"
                key={index}
                loading={index === 0 ? undefined : "lazy"}
                onClick={() => openLightbox(index)}
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
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Right arrow */}
        <button
          aria-label="Next image"
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          onClick={goToNext}
          type="button"
        >
          <ArrowRight className="h-4 w-4" />
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

      {lightboxOpen && (
        <Lightbox
          alt={alt}
          currentIndex={currentIndex}
          imageUrls={imageUrls}
          onClose={closeLightbox}
          onGoTo={setCurrentIndex}
          onNext={goToNext}
          onPrev={goToPrev}
        />
      )}
    </>
  );
}

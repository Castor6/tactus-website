"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
/*  Lightbox  – zoom, pan, scroll through long images                 */
/* ------------------------------------------------------------------ */

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;

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
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset zoom/pan when switching images
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [currentIndex]);

  // Clamp translation so image doesn't go out of bounds
  const clampTranslate = useCallback(
    (tx: number, ty: number, s: number) => {
      if (s <= 1) return { x: 0, y: 0 };
      const img = imgRef.current;
      const container = containerRef.current;
      if (!img || !container) return { x: tx, y: ty };

      const imgRect = img.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      // Displayed size at current scale
      const displayW = (imgRect.width / scale) * s;
      const displayH = (imgRect.height / scale) * s;

      const maxX = Math.max(0, (displayW - cRect.width) / 2);
      const maxY = Math.max(0, (displayH - cRect.height) / 2);

      return {
        x: Math.min(maxX, Math.max(-maxX, tx)),
        y: Math.min(maxY, Math.max(-maxY, ty)),
      };
    },
    [scale],
  );

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

  // Wheel zoom / scroll long image
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.stopPropagation();

      if (e.ctrlKey || e.metaKey) {
        // Pinch-zoom gesture (trackpad) or Ctrl+Wheel
        e.preventDefault();
        const delta = -e.deltaY * 0.01;
        setScale((prev) => {
          const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta));
          if (next <= 1) setTranslate({ x: 0, y: 0 });
          return next;
        });
      } else if (scale > 1) {
        // When zoomed in, scroll pans the image
        e.preventDefault();
        setTranslate((prev) => {
          return clampTranslate(prev.x - e.deltaX, prev.y - e.deltaY, scale);
        });
      } else {
        // At scale=1, scroll vertically to pan long images up/down
        e.preventDefault();
        setTranslate((prev) => {
          return clampTranslate(prev.x, prev.y - e.deltaY, scale);
        });
      }
    },
    [scale, clampTranslate],
  );

  // When scale=1, auto-fit long images: allow vertical overflow scrolling
  // by checking if image is taller than viewport
  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    // If the natural image is tall (long screenshot), start with it
    // visible from the top by setting the initial translate to show the top
    setTranslate({ x: 0, y: 0 });
  }, []);

  // Single-click to toggle zoom (skip if user was dragging)
  const handleImageClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasDragged.current) return;

      if (scale > 1) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      } else {
        // Zoom into the clicked point
        const img = imgRef.current;
        if (img) {
          const rect = img.getBoundingClientRect();
          const offsetX = e.clientX - rect.left - rect.width / 2;
          const offsetY = e.clientY - rect.top - rect.height / 2;
          setScale(DOUBLE_TAP_SCALE);
          setTranslate(
            clampTranslate(
              -offsetX * (DOUBLE_TAP_SCALE - 1),
              -offsetY * (DOUBLE_TAP_SCALE - 1),
              DOUBLE_TAP_SCALE,
            ),
          );
        } else {
          setScale(DOUBLE_TAP_SCALE);
        }
      }
    },
    [scale, clampTranslate],
  );

  // Mouse drag to pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale <= 1 && !(imgRef.current && imgRef.current.naturalHeight / imgRef.current.naturalWidth > 1.5)) return;
      e.preventDefault();
      isDragging.current = true;
      hasDragged.current = false;
      dragStart.current = { x: e.clientX, y: e.clientY };
      translateStart.current = { ...translate };
    },
    [scale, translate],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasDragged.current = true;
      }
      setTranslate(
        clampTranslate(translateStart.current.x + dx, translateStart.current.y + dy, scale),
      );
    },
    [scale, clampTranslate],
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const multiple = imageUrls.length > 1;
  const isZoomed = scale > 1;

  return createPortal(
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={isZoomed ? undefined : onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      ref={containerRef}
    >
      {/* Close button */}
      <button
        aria-label="Close lightbox"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
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

      {/* Zoom indicator */}
      {isZoomed && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* Previous arrow */}
      {multiple && !isZoomed && (
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
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl select-none"
        draggable={false}
        onClick={handleImageClick}
        onLoad={handleImageLoad}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        ref={imgRef}
        src={imageUrls[currentIndex]}
        style={{
          transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
          cursor: isZoomed ? "grab" : "zoom-in",
          transition: isDragging.current ? "none" : "transform 0.2s ease-out",
        }}
      />

      {/* Next arrow */}
      {multiple && !isZoomed && (
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
      {multiple && !isZoomed && (
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
          className="max-h-[32rem] w-full cursor-zoom-in object-contain bg-black/5 dark:bg-white/5"
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
                className="max-h-[32rem] w-full shrink-0 cursor-zoom-in object-contain bg-black/5 dark:bg-white/5"
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

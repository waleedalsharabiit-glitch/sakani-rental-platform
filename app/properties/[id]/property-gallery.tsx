"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";

type PropertyImage = {
  id: string;
  url: string;
  alt: string | null;
};

export function PropertyGallery({
  images,
  title,
}: {
  images: PropertyImage[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-800">
            <ImageIcon className="h-10 w-10 text-slate-600" />
          </div>

          <p className="mt-4 text-sm text-slate-500">
            لا توجد صور لهذا العقار
          </p>
        </div>
      </div>
    );
  }

  const activeImage = images[activeIndex];

  const previousImage = () => {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  };

  const nextImage = () => {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  };

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          className="group relative aspect-[16/9] cursor-zoom-in overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
          onClick={() => setIsFullscreen(true)}
        >
          <Image
            src={activeImage.url}
            alt={activeImage.alt || title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 70vw"
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

          {/* Counter */}
          <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            {activeIndex + 1} / {images.length}
          </div>

          {/* Previous */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="الصورة السابقة"
                onClick={(event) => {
                  event.stopPropagation();
                  previousImage();
                }}
                className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 hover:bg-sky-500"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Next */}
              <button
                type="button"
                aria-label="الصورة التالية"
                onClick={(event) => {
                  event.stopPropagation();
                  nextImage();
                }}
                className="absolute left-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 hover:bg-sky-500"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition ${
                  activeIndex === index
                    ? "border-sky-400 ring-2 ring-sky-400/20"
                    : "border-white/10 opacity-60 hover:border-white/30 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.alt || `${title} - ${index + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setIsFullscreen(false)}
            className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative h-[85vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={activeImage.url}
              alt={activeImage.alt || title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="الصورة السابقة"
                onClick={previousImage}
                className="absolute right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-sky-500"
              >
                <ChevronRight />
              </button>

              <button
                type="button"
                aria-label="الصورة التالية"
                onClick={nextImage}
                className="absolute left-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-sky-500"
              >
                <ChevronLeft />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
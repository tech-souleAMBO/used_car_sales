'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { VehicleImage } from '@/lib/types';

export function VehicleGallery({ images, alt }: { images: VehicleImage[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded border border-line bg-line/40 text-ink/40">
        Aucune photo disponible
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-line bg-line/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[activeIndex].url}
          alt={`${alt} — photo ${activeIndex + 1}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-6 gap-2">
          {images.map((image, idx) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Voir la photo ${idx + 1}`}
              aria-current={idx === activeIndex}
              className={clsx(
                'relative aspect-square overflow-hidden rounded border',
                idx === activeIndex ? 'border-ink' : 'border-line opacity-70 hover:opacity-100',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

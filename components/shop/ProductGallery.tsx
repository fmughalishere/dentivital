"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [""];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-dv-line bg-dv-mint-100">
        {list[active] ? (
          <Image
            src={list[active]}
            alt={`${name} — image ${active + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-contain p-8"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-dv-ink-soft">
            No image available
          </div>
        )}
      </div>

      {list.length > 1 && (
        <div className="dv-no-scrollbar mt-3 flex gap-3 overflow-x-auto">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-dv-mint-100 transition-colors ${
                i === active ? "border-dv-teal-500" : "border-transparent hover:border-dv-line-strong"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { Facebook, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  async function copyLink() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur Facebook"
        className="flex h-9 w-9 items-center justify-center rounded border border-line text-ink/60 hover:border-ink hover:text-ink"
      >
        <Facebook size={15} />
      </a>
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copier le lien"
        className="flex h-9 w-9 items-center justify-center rounded border border-line text-ink/60 hover:border-ink hover:text-ink"
      >
        <LinkIcon size={15} />
      </button>
      {copied && <span className="text-xs text-ink/50">Lien copié !</span>}
    </div>
  );
}

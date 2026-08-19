import Link from 'next/link';
import Image from 'next/image';
import { Heart, Scale } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="Vente de voiture d'occasion — accueil">
          <Image
            src="/logo-full.png"
            alt="Vente de voiture d'occasion"
            width={1200}
            height={431}
            priority
            className="h-10 w-auto sm:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink/70 md:flex">
          <Link href="/" className="hover:text-ink">
            Catalogue
          </Link>
          <Link href="/comparateur" className="hover:text-ink">
            Comparateur
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/comparateur"
            aria-label="Comparateur de véhicules"
            className="flex h-9 w-9 items-center justify-center rounded border border-line text-ink/70 hover:border-ink hover:text-ink"
          >
            <Scale size={16} />
          </Link>
          <Link
            href="/favoris"
            aria-label="Mes favoris"
            className="flex h-9 w-9 items-center justify-center rounded border border-line text-ink/70 hover:border-ink hover:text-ink"
          >
            <Heart size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}

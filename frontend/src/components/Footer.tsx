import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-paper/70">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-paper p-1.5">
                <Image src="/logo-icon.png" alt="" width={600} height={455} className="h-full w-full object-contain" />
              </span>
              <p className="font-display text-base font-bold leading-tight text-paper">
                Vente de voiture
                <br />
                d&apos;occasion
              </p>
            </div>
            <p className="mt-3 max-w-xs text-sm">
              La plateforme française de véhicules d&apos;occasion, vérifiés et prêts à rouler.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-paper/50">
              Navigation
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-paper">
                  Catalogue
                </Link>
              </li>
              <li>
                <Link href="/comparateur" className="hover:text-paper">
                  Comparateur
                </Link>
              </li>
              <li>
                <Link href="/favoris" className="hover:text-paper">
                  Favoris
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-paper/50">
              Informations légales
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/mentions-legales" className="hover:text-paper">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-paper">
                  Politique de confidentialité (RGPD)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-paper/10 pt-6 text-xs text-paper/40">
          © {new Date().getFullYear()} Vente de voiture d&apos;occasion. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

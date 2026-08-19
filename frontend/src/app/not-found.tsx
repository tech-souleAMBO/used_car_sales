import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-5xl font-bold text-ink/20">404</p>
      <h1 className="mt-4 font-display text-xl font-medium text-ink">
        Cette annonce n&apos;existe plus ou a été retirée.
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Le véhicule que vous recherchez a peut-être déjà trouvé preneur.
      </p>
      <Link href="/" className="btn-accent mt-6">
        Retour au catalogue
      </Link>
    </div>
  );
}

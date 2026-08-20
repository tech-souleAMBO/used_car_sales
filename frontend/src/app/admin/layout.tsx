'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Car, Tag, Mail, History, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { isAuthenticated } from '@/lib/auth';
import { api, refreshAccessToken } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/vehicules', label: 'Véhicules', icon: Car },
  { href: '/admin/marques', label: 'Marques', icon: Tag },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
  { href: '/admin/journal', label: "Journal d'activité", icon: History },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const isLoginPage = pathname === '/admin';
  const isPublicPage = isLoginPage || pathname === '/admin/forgot-password' || pathname.startsWith('/admin/reset-password');

  useEffect(() => {
    async function checkSession() {
      // L'access token en mémoire ne survit pas à un rechargement de page : on tente donc
      // systématiquement un rafraîchissement silencieux via le cookie httpOnly de refresh
      // token avant de décider si la session admin est valide.
      if (!isAuthenticated()) {
        await refreshAccessToken();
      }

      if (!isPublicPage && !isAuthenticated()) {
        router.replace('/admin');
        return;
      }
      setChecked(true);
    }
    checkSession();
  }, [isPublicPage, router]);

  async function handleLogout() {
    await api.auth.logout().catch(() => undefined);
    router.push('/admin');
  }

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (!checked) {
    return <div className="p-10 text-center text-ink/50">Vérification de la session...</div>;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
      <aside>
        <div className="mb-6 flex items-center gap-2.5 px-3">
          <Image src="/logo-icon.png" alt="" width={600} height={455} className="h-8 w-auto" />
          <span className="font-display text-xs font-medium uppercase tracking-wide text-ink/50">
            Espace admin
          </span>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-2.5 rounded px-3 py-2 text-sm font-medium',
                pathname === href ? 'bg-ink text-paper' : 'text-ink/70 hover:bg-line/50',
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm font-medium text-danger hover:bg-danger/5"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </nav>
      </aside>

      <main>{children}</main>
    </div>
  );
}

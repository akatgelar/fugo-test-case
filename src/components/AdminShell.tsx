'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { logout } from '@/actions/auth';

const items = [
  { href: '/admin/briefs', label: 'Briefs', icon: 'briefs' },
  { href: '/admin/pipeline', label: 'Pipeline AI', icon: 'pipeline' },
  { href: '/admin/settings', label: 'Pengaturan', icon: 'settings' },
  { href: '/admin/users', label: 'User', icon: 'users' },
];

function MenuIcon({ name }: { name: string }) {
  if (name === 'pipeline') {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3v3.5M11 15.5V19M3 11h3.5M15.5 11H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="11" cy="11" r="3.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  if (name === 'settings') {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 14.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17.5 11c0-.4-.03-.79-.1-1.17l1.55-1.2-1.6-2.77-1.86.74a6.6 6.6 0 0 0-2.03-1.17L13.2 3.3h-3.2l-.26 2.13A6.6 6.6 0 0 0 7.71 6.6L5.85 5.86l-1.6 2.77 1.55 1.2a6.7 6.7 0 0 0 0 2.34l-1.55 1.2 1.6 2.77 1.86-.74c.6.5 1.28.9 2.03 1.17l.26 2.13h3.2l.26-2.13a6.6 6.6 0 0 0 2.03-1.17l1.86.74 1.6-2.77-1.55-1.2c.07-.38.1-.77.1-1.17Z" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    );
  }
  if (name === 'users') {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="9" cy="7.5" r="3.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 18c0-2.8 2.7-4.5 6-4.5s6 1.7 6 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16.2 5.4a2.6 2.6 0 0 1 0 5M17.2 13.9c1.6.6 2.6 1.9 2.6 3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 5.5C4 4.67 4.67 4 5.5 4h11c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5h-11A1.5 1.5 0 0 1 4 16.5v-11Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 8.5h7M7.5 11.5h7M7.5 14.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminShell({ userName, userEmail, children }: { userName: string; userEmail: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('fugo_dark') === '1';
    setDark(saved);
    document.documentElement.classList.toggle('dark', saved);
  }, []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setProfileOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('fugo_dark', next ? '1' : '0');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="sidebar hidden h-screen w-[290px] shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white px-5 lg:flex dark:border-gray-800 dark:bg-black">
        <div className="flex items-center gap-2 pt-8 pb-7">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">FG</span>
          <span className="text-lg font-semibold tracking-tight text-gray-800 dark:text-white">Fugo Creative</span>
        </div>
        <h3 className="mb-4 text-xs uppercase leading-5 text-gray-400">Menu</h3>
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link href={item.href} className={`menu-item group ${active ? 'menu-item-active' : 'menu-item-inactive'}`}>
                  <span className={active ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}>
                    <MenuIcon name={item.icon} />
                  </span>
                  <span className="menu-item-text">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul> 
      </aside>

      <div className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <header className="sticky top-0 z-99999 flex w-full items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:px-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen((value) => !value)}
              aria-label="Buka menu"
              aria-expanded={mobileNavOpen}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold text-white">FG</span>
          </div>
          <div className="hidden text-sm text-gray-500 lg:block dark:text-gray-400"></div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleDark}
              aria-label="Ganti tema"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              {dark ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 2v1.5M10 16.5V18M18 10h-1.5M3.5 10H2M15.6 4.4l-1 1M5.4 14.6l-1 1M15.6 15.6l-1-1M5.4 5.4l-1-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M16.5 12.2A6.8 6.8 0 0 1 7.8 3.5a6.8 6.8 0 1 0 8.7 8.7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                aria-label="Menu profil"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                className={`flex h-10 items-center gap-2 rounded-full border px-1.5 pr-3 transition ${
                  profileOpen
                    ? 'border-brand-300 bg-brand-50 dark:border-brand-800 dark:bg-brand-500/10'
                    : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-white/5'
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">{initials}</span>
                <span className="hidden max-w-[120px] truncate text-xs font-medium text-gray-700 sm:block dark:text-gray-300">{userName}</span>
                <svg
                  className={`shrink-0 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {profileOpen && (
                <div role="menu" className="absolute right-0 mt-2 flex w-[240px] flex-col rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark">
                  <div className="border-b border-gray-100 px-3 py-2.5 dark:border-gray-800">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{userName}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
                  </div>
                  <form action={logout} className="mt-1">
                    <button
                      type="submit"
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-error-600 transition hover:bg-error-50 dark:text-error-500 dark:hover:bg-error-500/10"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M12.5 6.5V4.5A1.5 1.5 0 0 0 11 3H4.5A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17H11a1.5 1.5 0 0 0 1.5-1.5v-2M8 10h9M17 10l-3-3M17 10l-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Keluar
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
          {mobileNavOpen && (
            <div className="absolute left-0 right-0 top-full z-99999 border-b border-gray-200 bg-white p-3 shadow-theme-md lg:hidden dark:border-gray-800 dark:bg-gray-900">
              <nav className="flex flex-col gap-1">
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        active
                          ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
                          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className={active ? 'text-brand-500' : 'text-gray-400'}>
                        <MenuIcon name={item.icon} />
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

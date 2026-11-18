import Link from 'next/link';
import PublicBriefForm from '@/components/PublicBriefForm';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">FG</span>
          <span className="text-lg font-semibold tracking-tight text-gray-800 dark:text-white">Fugo Creative</span>
        </div>
        <Link href="/login" className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5">
          Login tim
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl px-5 pb-12 sm:px-8">
        <section className="w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-sm sm:p-8 dark:border-gray-800 dark:bg-white/[0.03]">
          <PublicBriefForm />
        </section> 
      </main>
    </div>
  );
}

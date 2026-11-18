import Link from 'next/link';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-5 py-10 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">FG</span>
          <span className="text-lg font-semibold tracking-tight text-gray-800 dark:text-white">Fugo Creative</span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm sm:p-8 dark:border-gray-800 dark:bg-white/[0.03]">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Masuk ke dashboard</h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">Satu akun admin dipakai untuk seluruh tim sales.</p>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          <Link href="/" className="text-brand-500 hover:underline">
            ← Kembali ke form publik
          </Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUser } from '@/actions/users';

const initial = { name: '', email: '', password: '' };
const inputClass =
  'dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';

export default function AddUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createUser, {});
  const [values, setValues] = useState(initial);

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      setValues(initial);
      router.refresh();
    }
  }, [state, router]);

  function update(key: keyof typeof initial, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function errorFor(key: string) {
    return state.fieldErrors?.[key]?.[0];
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Tambah user
      </button>

      {open && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Tambah user</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Tutup" className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form className="space-y-4 p-5" action={action} noValidate>
              <div>
                <label htmlFor="newName" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Nama <span className="text-error-500">*</span>
                </label>
                <input id="newName" name="name" value={values.name} onChange={(event) => update('name', event.target.value)} placeholder="Nama lengkap" className={`${inputClass} ${errorFor('name') ? 'border-error-500' : 'border-gray-300 dark:border-gray-700'}`} />
                {errorFor('name') && <p className="mt-1.5 text-xs text-error-500">{errorFor('name')}</p>}
              </div>

              <div>
                <label htmlFor="newEmail" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Email <span className="text-error-500">*</span>
                </label>
                <input id="newEmail" name="email" type="email" value={values.email} onChange={(event) => update('email', event.target.value)} placeholder="nama@fugocreative.com" className={`${inputClass} ${errorFor('email') ? 'border-error-500' : 'border-gray-300 dark:border-gray-700'}`} />
                {errorFor('email') && <p className="mt-1.5 text-xs text-error-500">{errorFor('email')}</p>}
              </div>

              <div>
                <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Password awal <span className="text-error-500">*</span>
                </label>
                <input id="newPassword" name="password" type="password" value={values.password} onChange={(event) => update('password', event.target.value)} placeholder="Minimal 8 karakter" autoComplete="new-password" className={`${inputClass} ${errorFor('password') ? 'border-error-500' : 'border-gray-300 dark:border-gray-700'}`} />
                {errorFor('password') && <p className="mt-1.5 text-xs text-error-500">{errorFor('password')}</p>}
              </div>

              {state.error && <p className="text-sm text-error-500">{state.error}</p>}

              <div className="flex justify-end gap-2.5 border-t border-gray-100 pt-4 dark:border-gray-800">
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  Batal
                </button>
                <button type="submit" disabled={pending} className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-70">
                  {pending ? 'Menyimpan…' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

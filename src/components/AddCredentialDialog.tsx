'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCredential } from '@/actions/settings';

const initial = { baseUrl: '', apiKey: '', model: '' };
const inputClass =
  'dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';

export default function AddCredentialDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createCredential, {});
  const [values, setValues] = useState(initial);
  const [showKey, setShowKey] = useState(false);

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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Tambah
      </button>

      {open && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Tambah API key</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Tutup" className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form className="space-y-4 p-5" action={action} noValidate>
              <div>
                <label htmlFor="baseUrl" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  URL API <span className="text-error-500">*</span>
                </label>
                <input
                  id="baseUrl"
                  name="baseUrl"
                  value={values.baseUrl}
                  onChange={(event) => update('baseUrl', event.target.value)}
                  placeholder="https://api.deepseek.com/v1"
                  className={`${inputClass} ${errorFor('baseUrl') ? 'border-error-500' : 'border-gray-300 dark:border-gray-700'}`}
                />
                {errorFor('baseUrl') && <p className="mt-1.5 text-xs text-error-500">{errorFor('baseUrl')}</p>}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                    API key <span className="text-error-500">*</span>
                  </label>
                  <button type="button" onClick={() => setShowKey((value) => !value)} className="text-xs font-medium text-brand-500 hover:underline">
                    {showKey ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
                <input
                  id="apiKey"
                  name="apiKey"
                  type={showKey ? 'text' : 'password'}
                  value={values.apiKey}
                  onChange={(event) => update('apiKey', event.target.value)}
                  placeholder="sk-…"
                  autoComplete="off"
                  spellCheck={false}
                  className={`${inputClass} ${errorFor('apiKey') ? 'border-error-500' : 'border-gray-300 dark:border-gray-700'}`}
                />
                {errorFor('apiKey') && <p className="mt-1.5 text-xs text-error-500">{errorFor('apiKey')}</p>}
              </div>

              <div>
                <label htmlFor="model" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Nama model <span className="text-error-500">*</span>
                </label>
                <input
                  id="model"
                  name="model"
                  value={values.model}
                  onChange={(event) => update('model', event.target.value)}
                  placeholder="deepseek-chat"
                  className={`${inputClass} ${errorFor('model') ? 'border-error-500' : 'border-gray-300 dark:border-gray-700'}`}
                />
                {errorFor('model') && <p className="mt-1.5 text-xs text-error-500">{errorFor('model')}</p>}
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

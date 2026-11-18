'use client';

import { useActionState, useState } from 'react';
import { submitBrief } from '@/actions/briefs';
import { BUDGET_VALUES, budgetLabels, briefInputSchema, fieldErrorsFrom } from '@/lib/validation';
import SelectField from '@/components/SelectField';

const initial = {
  name: '',
  email: '',
  company: '',
  needDescription: '',
  budgetRange: '',
  targetTimeline: '',
};

const inputClass =
  'dark:bg-dark-900 shadow-theme-xs h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';
const okBorder = 'border-gray-300 dark:border-gray-700';
const badBorder = 'border-error-500 focus:border-error-500 focus:ring-error-500/10';

export default function PublicBriefForm() {
  const [state, action, pending] = useActionState(submitBrief, {});
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

  function update(key: keyof typeof initial, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function errorFor(key: string) {
    return errors[key]?.[0] ?? state.fieldErrors?.[key]?.[0];
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const parsed = briefInputSchema.safeParse({ ...values, website: '' });
    if (!parsed.success) {
      event.preventDefault();
      setErrors(fieldErrorsFrom(parsed.error));
      return;
    }
    setErrors({});
  }

  if (state.ok) {
    return (
      <div className="py-6 text-center sm:py-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/15">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path d="M6 15.5L12 21.5L24 8.5" stroke="#12B76A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-gray-800 dark:text-white">Brief Anda sudah masuk</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Terima kasih, {values.name.split(' ')[0] || 'Bapak/Ibu'}. Tim kami meninjau brief Anda dan menghubungi lewat email.
        </p>
        <div className="mx-auto mt-6 w-full max-w-xs rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-wide text-gray-400">Nomor referensi</p>
          <p className="mt-1 text-lg font-semibold tracking-[0.08em] text-gray-800 dark:text-white">{state.ref}</p>
        </div>
        <a href="/" className="mt-8 inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600">
          Kirim brief lain
        </a>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-1 text-2xl font-semibold text-gray-800 dark:text-white">Kirim brief proyek</h2>
      <hr className="my-5 border-gray-200 dark:border-gray-800" />

      <form className="mt-7 space-y-5" action={action} onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Nama lengkap <span className="text-error-500">*</span>
            </label>
            <input id="name" name="name" value={values.name} onChange={(e) => update('name', e.target.value)} placeholder="Nama Anda" className={`${inputClass} ${errorFor('name') ? badBorder : okBorder}`} />
            {errorFor('name') && <p className="mt-1.5 text-xs text-error-500">{errorFor('name')}</p>}
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Email <span className="text-error-500">*</span>
            </label>
            <input id="email" name="email" type="email" value={values.email} onChange={(e) => update('email', e.target.value)} placeholder="nama@perusahaan.com" className={`${inputClass} ${errorFor('email') ? badBorder : okBorder}`} />
            {errorFor('email') && <p className="mt-1.5 text-xs text-error-500">{errorFor('email')}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Nama perusahaan <span className="text-error-500">*</span>
          </label>
          <input id="company" name="company" value={values.company} onChange={(e) => update('company', e.target.value)} placeholder="PT Contoh Sejahtera" className={`${inputClass} ${errorFor('company') ? badBorder : okBorder}`} />
          {errorFor('company') && <p className="mt-1.5 text-xs text-error-500">{errorFor('company')}</p>}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="needDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Jenis kebutuhan <span className="text-error-500">*</span>
            </label>
            <span className="text-xs text-gray-400">{values.needDescription.length}/2000</span>
          </div>
          <textarea
            id="needDescription"
            name="needDescription"
            rows={5}
            maxLength={2000}
            value={values.needDescription}
            onChange={(e) => update('needDescription', e.target.value)}
            placeholder="Misal: butuh redesign website company profile, 8 halaman, ada katalog produk, target rilis kuartal depan."
            className={`dark:bg-dark-900 shadow-theme-xs w-full rounded-lg border bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${errorFor('needDescription') ? badBorder : okBorder}`}
          />
          {errorFor('needDescription') ? (
            <p className="mt-1.5 text-xs text-error-500">{errorFor('needDescription')}</p>
          ) : (
            <p className="mt-1.5 text-xs text-gray-400">Semakin spesifik, semakin akurat prioritas yang kami berikan.</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="budgetRange" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Rentang budget <span className="text-error-500">*</span>
            </label>
            <SelectField
              id="budgetRange"
              name="budgetRange"
              value={values.budgetRange}
              invalid={Boolean(errorFor('budgetRange'))}
              onChange={(e) => update('budgetRange', e.target.value)}
            >
              <option value="" disabled>
                Pilih rentang
              </option>
              {BUDGET_VALUES.map((value) => (
                <option key={value} value={value}>
                  {budgetLabels[value]}
                </option>
              ))}
            </SelectField>
            {errorFor('budgetRange') && <p className="mt-1.5 text-xs text-error-500">{errorFor('budgetRange')}</p>}
          </div>
          <div>
            <label htmlFor="targetTimeline" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Target timeline <span className="text-error-500">*</span>
            </label>
            <input
              id="targetTimeline"
              name="targetTimeline"
              type="date"
              min={today}
              value={values.targetTimeline}
              onChange={(e) => update('targetTimeline', e.target.value)}
              className={`${inputClass} ${errorFor('targetTimeline') ? badBorder : okBorder}`}
            />
            {errorFor('targetTimeline') ? (
              <p className="mt-1.5 text-xs text-error-500">{errorFor('targetTimeline')}</p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-400">Tanggal tidak boleh di masa lalu.</p>
            )}
          </div>
        </div>

        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" value="" readOnly />

        <div className="rounded-xl bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
          Dengan mengirim brief, Anda setuju data ini digunakan untuk menindaklanjuti kebutuhan proyek.
        </div>

        {state.error && (
          <div className="rounded-xl border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/25 dark:bg-error-500/10 dark:text-error-500">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? 'Mengirim…' : 'Kirim brief'}
        </button>
      </form>
    </div>
  );
}

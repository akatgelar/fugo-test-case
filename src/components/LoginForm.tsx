'use client';

import { useActionState, useState } from 'react';
import { login } from '@/actions/auth';

const inputClass =
  'dark:bg-dark-900 shadow-theme-xs h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  return (
    <form className="mt-6 space-y-5" action={action}>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Email
        </label>
        <input id="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} required />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            Password
          </label>
          <button type="button" onClick={() => setShow((value) => !value)} className="text-xs font-medium text-brand-500 hover:underline">
            {show ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        </div>
        <input
          id="password"
          name="password"
          type={show ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
          placeholder="••••••••"
          required
        />
      </div>

      {state.error && <p className="text-sm text-error-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? 'Memeriksa…' : 'Masuk'}
      </button>
 
    </form>
  );
}

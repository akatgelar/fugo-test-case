'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { createSession, destroySession, verifyPassword } from '@/lib/auth';
import type { FormState } from '@/lib/validation';

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'Email dan password wajib diisi.' };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return { error: 'Email atau password belum benar.' };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: 'Email atau password belum benar.' };

  await createSession(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  redirect('/admin/briefs');
}

export async function logout() {
  await destroySession();
  redirect('/login');
}

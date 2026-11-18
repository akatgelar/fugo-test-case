'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireUser, hashPassword } from '@/lib/auth';
import { fieldErrorsFrom, userInputSchema, type FormState } from '@/lib/validation';

export async function createUser(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = userInputSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { fieldErrors: { email: ['Email ini sudah terdaftar.'] } };

  await prisma.user.create({
    data: { name: parsed.data.name, email, passwordHash: await hashPassword(parsed.data.password) },
  });

  revalidatePath('/admin/users');
  return { ok: true };
}

export async function toggleUser(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;

  if (user.isActive) {
    const otherActive = await prisma.user.count({ where: { isActive: true, id: { not: id } } });
    if (otherActive === 0) redirect('/admin/users?error=last_admin');
    await prisma.user.update({ where: { id }, data: { isActive: false } });
    await prisma.session.deleteMany({ where: { userId: id } });
  } else {
    await prisma.user.update({ where: { id }, data: { isActive: true } });
  }

  revalidatePath('/admin/users');
}

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { credentialInputSchema, fieldErrorsFrom, type FormState } from '@/lib/validation';

export async function createCredential(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = credentialInputSchema.safeParse({
    baseUrl: formData.get('baseUrl'),
    apiKey: formData.get('apiKey'),
    model: formData.get('model'),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const duplicate = await prisma.aiCredential.findFirst({
    where: { baseUrl: parsed.data.baseUrl, model: parsed.data.model },
  });
  if (duplicate) return { fieldErrors: { baseUrl: ['Kombinasi URL dan model ini sudah ada.'] } };

  const active = await prisma.aiCredential.findFirst({ where: { isActive: true } });
  await prisma.aiCredential.create({
    data: { ...parsed.data, isActive: !active, createdById: user.id },
  });

  revalidatePath('/admin/settings');
  return { ok: true };
}

export async function activateCredential(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await prisma.$transaction([
    prisma.aiCredential.updateMany({ where: { isActive: true }, data: { isActive: false } }),
    prisma.aiCredential.update({ where: { id }, data: { isActive: true } }),
  ]);
  revalidatePath('/admin/settings');
}

export async function deactivateCredential(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await prisma.aiCredential.update({ where: { id }, data: { isActive: false } });
  revalidatePath('/admin/settings');
}

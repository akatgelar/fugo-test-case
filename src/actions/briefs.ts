'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { processBrief } from '@/lib/ai';
import { briefInputSchema, fieldErrorsFrom, PIPELINE_VALUES, type FormState } from '@/lib/validation';
import { pipelineTransitions } from '@/lib/pipeline';

const attempts = new Map<string, number[]>();

function allowSubmission(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < 60 * 60 * 1000);
  if (recent.length >= 5) return false;
  recent.push(now);
  attempts.set(ip, recent);
  return true;
}

async function nextRef() {
  for (let i = 0; i < 10; i += 1) {
    const ref = `FG-${Math.floor(1000 + Math.random() * 9000)}`;
    const exists = await prisma.brief.findUnique({ where: { ref } });
    if (!exists) return ref;
  }
  throw new Error('Gagal membuat nomor referensi.');
}

export async function submitBrief(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = briefInputSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    company: formData.get('company'),
    needDescription: formData.get('needDescription'),
    budgetRange: formData.get('budgetRange'),
    targetTimeline: formData.get('targetTimeline'),
    website: formData.get('website') ?? '',
  });

  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };
  if (parsed.data.website) return { error: 'Pengiriman ditolak.' };

  const requestHeaders = await headers();
  const ip = (requestHeaders.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || 'local';
  if (!allowSubmission(ip)) return { error: 'Terlalu banyak pengiriman. Coba lagi nanti.' };

  const ref = await nextRef();
  const brief = await prisma.brief.create({
    data: {
      ref,
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company,
      needDescription: parsed.data.needDescription,
      budgetRange: parsed.data.budgetRange,
      targetTimeline: new Date(`${parsed.data.targetTimeline}T00:00:00+07:00`),
    },
  });

  after(() => processBrief(brief.id));

  return { ok: true, ref };
}

export async function updatePipeline(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('id') ?? '');
  const to = String(formData.get('to') ?? '');
  if (!id || !PIPELINE_VALUES.includes(to as (typeof PIPELINE_VALUES)[number])) return;

  const brief = await prisma.brief.findUnique({ where: { id } });
  if (!brief) return;
  if (!(pipelineTransitions[brief.pipelineStatus] ?? []).some((status) => status === to)) return;

  await prisma.$transaction([
    prisma.brief.update({ where: { id }, data: { pipelineStatus: to as (typeof PIPELINE_VALUES)[number] } }),
    prisma.pipelineEvent.create({
      data: {
        briefId: id,
        fromStatus: brief.pipelineStatus,
        toStatus: to as (typeof PIPELINE_VALUES)[number],
        changedById: user.id,
      },
    }),
  ]);

  revalidatePath(`/admin/briefs/${id}`);
  revalidatePath('/admin/briefs');
  revalidatePath('/admin/pipeline');
}

export async function reprocessBrief(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const brief = await prisma.brief.findUnique({ where: { id } });
  if (!brief || brief.aiStatus === 'processing') return;

  await prisma.brief.update({ where: { id }, data: { aiStatus: 'pending', aiLastError: null } });
  after(() => processBrief(id));

  revalidatePath(`/admin/briefs/${id}`);
  revalidatePath('/admin/briefs');
  revalidatePath('/admin/pipeline');
}

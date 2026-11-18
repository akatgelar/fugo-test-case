import { z } from 'zod';

export const BUDGET_VALUES = ['under_10', 'from_10_25', 'from_25_50', 'from_50_100', 'above_100'] as const;
export const CATEGORY_VALUES = ['branding', 'website', 'mobile_app', 'ai_automation', 'social_media', 'other'] as const;
export const PRIORITY_VALUES = ['high', 'medium', 'low'] as const;
export const AI_STATUS_VALUES = ['pending', 'processing', 'succeeded', 'failed'] as const;
export const PIPELINE_VALUES = ['new', 'contacted', 'proposal', 'won', 'lost'] as const;

export const budgetLabels: Record<(typeof BUDGET_VALUES)[number], string> = {
  under_10: '< Rp 10 juta',
  from_10_25: 'Rp 10 – 25 juta',
  from_25_50: 'Rp 25 – 50 juta',
  from_50_100: 'Rp 50 – 100 juta',
  above_100: '> Rp 100 juta',
};

export const categoryLabels: Record<(typeof CATEGORY_VALUES)[number], string> = {
  branding: 'Branding',
  website: 'Website',
  mobile_app: 'Mobile App',
  ai_automation: 'AI Automation',
  social_media: 'Social Media',
  other: 'Lainnya',
};

export const priorityLabels: Record<(typeof PRIORITY_VALUES)[number], string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const aiStatusLabels: Record<(typeof AI_STATUS_VALUES)[number], string> = {
  pending: 'Menunggu',
  processing: 'Diproses',
  succeeded: 'Berhasil',
  failed: 'Gagal',
};

export const pipelineLabels: Record<(typeof PIPELINE_VALUES)[number], string> = {
  new: 'New',
  contacted: 'Contacted',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function todayWIB(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
}

export const briefInputSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(100, 'Nama maksimal 100 karakter.'),
  email: z.string().trim().regex(emailRegex, 'Format email belum benar.').max(254, 'Email terlalu panjang.'),
  company: z.string().trim().min(2, 'Nama perusahaan wajib diisi.').max(150, 'Nama perusahaan terlalu panjang.'),
  needDescription: z
    .string()
    .trim()
    .min(10, 'Ceritakan kebutuhan minimal 10 karakter.')
    .max(2000, 'Kebutuhan maksimal 2000 karakter.'),
  budgetRange: z.enum(BUDGET_VALUES, { error: 'Pilih salah satu rentang budget.' }),
  targetTimeline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target timeline wajib diisi.')
    .refine((value) => value >= todayWIB(), 'Tanggal tidak boleh di masa lalu.'),
  website: z.string().optional(),
});

export type BriefInput = z.infer<typeof briefInputSchema>;

export const credentialInputSchema = z.object({
  baseUrl: z
    .string()
    .trim()
    .regex(/^https?:\/\/[^\s]+$/i, 'URL harus diawali http:// atau https://.')
    .max(300, 'URL terlalu panjang.'),
  apiKey: z.string().trim().min(8, 'API key minimal 8 karakter.').max(300, 'API key terlalu panjang.'),
  model: z.string().trim().min(1, 'Nama model wajib diisi.').max(100, 'Nama model terlalu panjang.'),
});

export const userInputSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(100, 'Nama maksimal 100 karakter.'),
  email: z.string().trim().regex(emailRegex, 'Format email belum benar.').max(254, 'Email terlalu panjang.'),
  password: z.string().min(8, 'Password minimal 8 karakter.').max(100, 'Password terlalu panjang.'),
});

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  ref?: string;
  message?: string;
};

export function fieldErrorsFrom(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    out[key] = [...(out[key] ?? []), issue.message];
  }
  return out;
}

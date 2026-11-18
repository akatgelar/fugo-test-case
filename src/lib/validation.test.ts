import { describe, expect, it } from 'vitest';
import { briefInputSchema, credentialInputSchema, todayWIB, userInputSchema } from './validation';

const base = {
  name: 'Andi Pratama',
  email: 'andi@nusantara.co.id',
  company: 'Nusantara Food',
  needDescription: 'Butuh redesign website company profile 8 halaman.',
  budgetRange: 'from_25_50',
  targetTimeline: todayWIB(),
  website: '',
};

describe('briefInputSchema', () => {
  it('menerima brief valid dengan tanggal hari ini', () => {
    expect(briefInputSchema.safeParse(base).success).toBe(true);
  });

  it('menolak email tidak valid', () => {
    const result = briefInputSchema.safeParse({ ...base, email: 'bukan-email' });
    expect(result.success).toBe(false);
  });

  it('menolak tanggal di masa lalu', () => {
    const result = briefInputSchema.safeParse({ ...base, targetTimeline: '2000-01-01' });
    expect(result.success).toBe(false);
  });

  it('menolak budget di luar pilihan', () => {
    const result = briefInputSchema.safeParse({ ...base, budgetRange: 'banyak' });
    expect(result.success).toBe(false);
  });

  it('menolak kebutuhan yang terlalu pendek', () => {
    const result = briefInputSchema.safeParse({ ...base, needDescription: 'web' });
    expect(result.success).toBe(false);
  });
});

describe('credentialInputSchema', () => {
  it('menerima kredensial valid', () => {
    expect(
      credentialInputSchema.safeParse({ baseUrl: 'https://api.deepseek.com/v1', apiKey: 'sk-1234567890', model: 'deepseek-chat' }).success,
    ).toBe(true);
  });

  it('menolak URL tanpa http', () => {
    expect(
      credentialInputSchema.safeParse({ baseUrl: 'api.deepseek.com', apiKey: 'sk-1234567890', model: 'deepseek-chat' }).success,
    ).toBe(false);
  });

  it('menolak API key pendek', () => {
    expect(
      credentialInputSchema.safeParse({ baseUrl: 'https://api.deepseek.com/v1', apiKey: 'sk-1', model: 'deepseek-chat' }).success,
    ).toBe(false);
  });
});

describe('userInputSchema', () => {
  it('menolak password pendek', () => {
    expect(userInputSchema.safeParse({ name: 'Rina', email: 'rina@fugo.co', password: '123' }).success).toBe(false);
  });
});

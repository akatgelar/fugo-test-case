import { describe, expect, it } from 'vitest';
import { parseModelJson } from './ai';

const valid = {
  summary: 'Klien membutuhkan redesign website company profile dengan katalog produk.',
  service_category: 'website',
  priority: 'high',
  priority_reason: 'Budget menengah dan timeline dekat.',
  missing_info: ['Referensi visual', 'PIC teknis'],
};

describe('parseModelJson', () => {
  it('menerima JSON valid', () => {
    const result = parseModelJson(JSON.stringify(valid));
    expect(result.ok).toBe(true);
  });

  it('menerima JSON yang dibungkus markdown fence', () => {
    const result = parseModelJson('```json\n' + JSON.stringify(valid) + '\n```');
    expect(result.ok).toBe(true);
  });

  it('menolak teks non-JSON', () => {
    const result = parseModelJson('Berikut hasilnya: bagus');
    expect(result.ok).toBe(false);
  });

  it('menolak field yang hilang', () => {
    const { summary, ...rest } = valid;
    const result = parseModelJson(JSON.stringify(rest));
    expect(result.ok).toBe(false);
  });

  it('menolak enum di luar daftar', () => {
    const result = parseModelJson(JSON.stringify({ ...valid, service_category: 'web_design' }));
    expect(result.ok).toBe(false);
  });

  it('menolak field tambahan (strict)', () => {
    const result = parseModelJson(JSON.stringify({ ...valid, extra: true }));
    expect(result.ok).toBe(false);
  });

  it('menolak missing_info lebih dari 5 item', () => {
    const result = parseModelJson(
      JSON.stringify({ ...valid, missing_info: ['a1', 'b2', 'c3', 'd4', 'e5', 'f6'] }),
    );
    expect(result.ok).toBe(false);
  });
});

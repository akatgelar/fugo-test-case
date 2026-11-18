import Link from 'next/link';
import type { AiStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireAdminPage } from '@/lib/auth';
import { reprocessBrief } from '@/actions/briefs';
import { aiStatusClass, aiStatusDot, aiStatusLabels, formatDateTime } from '@/lib/ui';
import { AI_STATUS_VALUES } from '@/lib/validation';

const PAGE_SIZE = 10;

const tabs: { key: 'all' | AiStatus; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Menunggu' },
  { key: 'processing', label: 'Diproses' },
  { key: 'failed', label: 'Gagal' },
  { key: 'succeeded', label: 'Berhasil' },
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PipelinePage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage();
  const params = await searchParams;
  const rawAi = typeof params.ai === 'string' ? params.ai : '';
  const filter = AI_STATUS_VALUES.includes(rawAi as (typeof AI_STATUS_VALUES)[number]) ? (rawAi as AiStatus) : 'all';
  const requestedPage = Number(typeof params.page === 'string' ? params.page : '') || 1;

  const where: Prisma.BriefWhereInput = filter === 'all' ? {} : { aiStatus: filter };

  const [grouped, total] = await Promise.all([
    prisma.brief.groupBy({ by: ['aiStatus'], _count: { _all: true } }),
    prisma.brief.count({ where }),
  ]);

  const counts: Record<AiStatus, number> = { pending: 0, processing: 0, succeeded: 0, failed: 0 };
  for (const row of grouped) counts[row.aiStatus] = row._count._all;
  const totalAll = Object.values(counts).reduce((sum, value) => sum + value, 0);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), pageCount);

  const briefs = await prisma.brief.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  function hrefFor(target: number, ai: string) {
    const search = new URLSearchParams();
    if (ai !== 'all') search.set('ai', ai);
    search.set('page', String(target));
    return `/admin/pipeline?${search.toString()}`;
  }

  return (
    <div className="mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Pipeline AI</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Riwayat pemrosesan AI tiap brief. Tanpa queue — proses berjalan setelah form dikirim.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success-500" />
          Pemroses siap
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Link href="/admin/pipeline?ai=pending" className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Menunggu</p>
          <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">{counts.pending}</p>
          <p className="mt-1 text-xs text-gray-400">belum diproses</p>
        </Link>
        <Link href="/admin/pipeline?ai=processing" className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Diproses</p>
          <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">{counts.processing}</p>
          <p className="mt-1 text-xs text-brand-500">sedang berjalan</p>
        </Link>
        <Link href="/admin/pipeline?ai=failed" className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Gagal</p>
          <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">{counts.failed}</p>
          <p className="mt-1 text-xs text-error-600 dark:text-error-500">perlu proses ulang</p>
        </Link>
        <Link href="/admin/pipeline?ai=succeeded" className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Berhasil</p>
          <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">{counts.succeeded}</p>
          <p className="mt-1 text-xs text-success-600 dark:text-success-500">analisis tersimpan</p>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-1.5 dark:border-gray-800 dark:bg-white/[0.03]">
        {tabs.map((tab) => {
          const active = filter === tab.key;
          const count = tab.key === 'all' ? totalAll : counts[tab.key as AiStatus];
          return (
            <Link
              key={tab.key}
              href={hrefFor(1, tab.key)}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                active ? 'bg-brand-500 text-white shadow-theme-xs' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'}`}>{count}</span>
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[940px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Brief', 'Status AI', 'Percobaan', 'Model', 'Terakhir', 'Error', ''].map((label, index) => (
                  <th key={label || index} className="px-5 py-3 text-left sm:px-6">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">{label}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {briefs.map((brief) => (
                <tr key={brief.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <td className="px-5 py-4 sm:px-6">
                    <Link href={`/admin/briefs/${brief.id}`} className="block">
                      <p className="font-medium text-gray-800 text-theme-sm hover:text-brand-500 dark:text-white/90">{brief.company}</p>
                      <p className="font-mono text-xs text-gray-400">{brief.ref}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${aiStatusClass(brief.aiStatus)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${aiStatusDot(brief.aiStatus)}`} />
                      {aiStatusLabels[brief.aiStatus]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 sm:px-6">{brief.aiAttemptCount}</td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-500 dark:text-gray-400 sm:px-6">{brief.aiModel ?? '—'}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500 dark:text-gray-400 sm:px-6">
                    {formatDateTime(brief.aiProcessedAt ?? brief.updatedAt)}
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    {brief.aiLastError ? (
                      <p className="max-w-[220px] truncate text-[11px] text-error-600 dark:text-error-500" title={brief.aiLastError}>
                        {brief.aiLastError}
                      </p>
                    ) : (
                      <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right sm:px-6">
                    <form action={reprocessBrief}>
                      <input type="hidden" name="id" value={brief.id} />
                      <button
                        type="submit"
                        disabled={brief.aiStatus === 'processing'}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <path d="M2.5 8a5.5 5.5 0 1 1 1.6 3.9M2.5 8V4.5M2.5 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Proses ulang
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {briefs.length === 0 && (
          <div className="px-6 py-14 text-center">
            <p className="font-medium text-gray-800 dark:text-white/90">Tidak ada job di filter ini</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Coba pilih tab lain atau kirim brief baru.</p>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-3.5 dark:border-gray-800 sm:flex-row sm:px-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Menampilkan {rangeStart}–{rangeEnd} dari {total} brief
          </p>
          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Link href={hrefFor(page - 1, filter)} className="flex h-8 items-center rounded-lg border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Sebelumnya
              </Link>
            ) : (
              <span className="flex h-8 items-center rounded-lg border border-gray-200 px-2.5 text-xs font-medium text-gray-300 dark:border-gray-800 dark:text-gray-600">Sebelumnya</span>
            )}
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <Link
                key={number}
                href={hrefFor(number, filter)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium ${
                  number === page
                    ? 'bg-brand-500 text-white'
                    : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {number}
              </Link>
            ))}
            {page < pageCount ? (
              <Link href={hrefFor(page + 1, filter)} className="flex h-8 items-center rounded-lg border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Berikutnya
              </Link>
            ) : (
              <span className="flex h-8 items-center rounded-lg border border-gray-200 px-2.5 text-xs font-medium text-gray-300 dark:border-gray-800 dark:text-gray-600">Berikutnya</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

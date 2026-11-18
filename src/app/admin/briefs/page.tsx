import Link from 'next/link';
import type { AiPriority, AiStatus, Prisma, ServiceCategory } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireAdminPage } from '@/lib/auth';
import {
  aiStatusClass,
  aiStatusDot,
  aiStatusLabels,
  categoryLabels,
  formatDate,
  initials,
  pipelineClass,
  pipelineLabels,
  priorityClass,
  priorityLabels,
} from '@/lib/ui';
import { AI_STATUS_VALUES, CATEGORY_VALUES, PRIORITY_VALUES } from '@/lib/validation';
import SelectField from '@/components/SelectField';

const PAGE_SIZE = 10;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pick(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : '';
}

export default async function BriefsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage();
  const params = await searchParams;

  const q = pick(params.q).trim();
  const priority = pick(params.priority);
  const category = pick(params.category);
  const ai = pick(params.ai);
  const requestedPage = Number(pick(params.page)) || 1;

  const where: Prisma.BriefWhereInput = {};
  if (q) {
    where.OR = [
      { company: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (PRIORITY_VALUES.includes(priority as (typeof PRIORITY_VALUES)[number])) {
    where.aiPriority = priority as AiPriority;
  }
  if (CATEGORY_VALUES.includes(category as (typeof CATEGORY_VALUES)[number])) {
    where.aiServiceCategory = category as ServiceCategory;
  }
  if (AI_STATUS_VALUES.includes(ai as (typeof AI_STATUS_VALUES)[number])) {
    where.aiStatus = ai as AiStatus;
  }

  const [total, totalBriefs, highCount, failedCount, pendingCount] = await Promise.all([
    prisma.brief.count({ where }),
    prisma.brief.count(),
    prisma.brief.count({ where: { aiPriority: 'high' } }),
    prisma.brief.count({ where: { aiStatus: 'failed' } }),
    prisma.brief.count({ where: { aiStatus: { in: ['pending', 'processing'] } } }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), pageCount);

  const briefs = await prisma.brief.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  function hrefFor(nextPage: number) {
    const search = new URLSearchParams();
    if (q) search.set('q', q);
    if (priority) search.set('priority', priority);
    if (category) search.set('category', category);
    if (ai) search.set('ai', ai);
    search.set('page', String(nextPage));
    return `/admin/briefs?${search.toString()}`;
  }

  return (
    <div className="mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Briefs</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Semua brief masuk, terurut dari yang terbaru.</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          Buka form publik
        </a>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total brief</p>
          <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">{totalBriefs}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Prioritas High</p>
          <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">{highCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Menunggu AI</p>
          <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">AI gagal</p>
          <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">{failedCount}</p>
        </div>
      </div>

      <form method="get" className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari perusahaan atau email…"
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          <div className="xl:col-span-2">
            <SelectField name="priority" defaultValue={priority}>
              <option value="">Semua prioritas</option>
              {PRIORITY_VALUES.map((value) => (
                <option key={value} value={value}>
                  {priorityLabels[value]}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="xl:col-span-2">
            <SelectField name="category" defaultValue={category}>
              <option value="">Semua kategori</option>
              {CATEGORY_VALUES.map((value) => (
                <option key={value} value={value}>
                  {categoryLabels[value]}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="xl:col-span-2">
            <SelectField name="ai" defaultValue={ai}>
              <option value="">Semua status AI</option>
              {AI_STATUS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {aiStatusLabels[value]}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="flex gap-2 xl:col-span-2">
            <button type="submit" className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-brand-500 px-3 text-sm font-medium text-white hover:bg-brand-600">
              Terapkan
            </button>
            <Link href="/admin/briefs" className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Reset
            </Link>
          </div>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[1080px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Perusahaan', 'Kategori', 'Prioritas', 'Status AI', 'Pipeline', 'Masuk', ''].map((label, index) => (
                  <th key={label || index} className="px-5 py-3 text-left sm:px-6">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">{label}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {briefs.map((brief) => (
                <tr key={brief.id} className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]">
                  <td className="px-5 py-4 sm:px-6">
                    <Link href={`/admin/briefs/${brief.id}`} className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
                        {initials(brief.company)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-gray-800 text-theme-sm dark:text-white/90">{brief.company}</span>
                        <span className="block truncate text-gray-500 text-theme-xs dark:text-gray-400">
                          {brief.name} · {brief.email}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    {brief.aiServiceCategory ? (
                      <span className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">
                        {categoryLabels[brief.aiServiceCategory]}
                      </span>
                    ) : (
                      <span className="text-xs italic text-gray-400">Belum dianalisis</span>
                    )}
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    {brief.aiPriority ? (
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityClass(brief.aiPriority)}`}>
                        {priorityLabels[brief.aiPriority]}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${aiStatusClass(brief.aiStatus)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${aiStatusDot(brief.aiStatus)}`} />
                      {aiStatusLabels[brief.aiStatus]}
                    </span>
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${pipelineClass(brief.pipelineStatus)}`}>
                      {pipelineLabels[brief.pipelineStatus]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500 dark:text-gray-400 sm:px-6">{formatDate(brief.createdAt)}</td>
                  <td className="px-5 py-4 text-right sm:px-6">
                    <Link href={`/admin/briefs/${brief.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M7.5 4L13 10l-5.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {briefs.length === 0 && (
          <div className="px-6 py-14 text-center">
            <p className="font-medium text-gray-800 dark:text-white/90">Tidak ada brief yang cocok</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ubah filter atau kirim brief dari form publik.</p>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-3.5 dark:border-gray-800 sm:flex-row sm:px-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Menampilkan {rangeStart}–{rangeEnd} dari {total} brief
          </p>
          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Link href={hrefFor(page - 1)} className="flex h-8 items-center rounded-lg border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Sebelumnya
              </Link>
            ) : (
              <span className="flex h-8 items-center rounded-lg border border-gray-200 px-2.5 text-xs font-medium text-gray-300 dark:border-gray-800 dark:text-gray-600">Sebelumnya</span>
            )}
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <Link
                key={number}
                href={hrefFor(number)}
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
              <Link href={hrefFor(page + 1)} className="flex h-8 items-center rounded-lg border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
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

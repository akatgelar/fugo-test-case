import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PipelineStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireAdminPage } from '@/lib/auth';
import {
  aiStatusClass,
  aiStatusDot,
  aiStatusLabels,
  categoryLabels,
  formatDate,
  formatDateTime,
  initials,
  pipelineClass,
  pipelineLabels,
  priorityClass,
  priorityLabels,
} from '@/lib/ui';
import { pipelineActionLabels, pipelineTransitions } from '@/lib/pipeline';
import { reprocessBrief, updatePipeline } from '@/actions/briefs';

export default async function BriefDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;

  const brief = await prisma.brief.findUnique({
    where: { id },
    include: {
      runs: { orderBy: { createdAt: 'desc' }, take: 10 },
      events: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });

  if (!brief) notFound();

  const nextStatuses = pipelineTransitions[brief.pipelineStatus];
  const missing = Array.isArray(brief.aiMissingInfo) ? (brief.aiMissingInfo as string[]) : [];

  return (
    <div className="mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6">
      <nav className="mb-4">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/admin/briefs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              Briefs
              <svg className="stroke-current" width="17" height="16" viewBox="0 0 17 16" fill="none">
                <path d="M6.08 12.67L10.24 8.5L6.08 4.33" stroke="" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </li>
          <li className="text-sm text-gray-800 dark:text-white/90">{brief.ref}</li>
        </ol>
      </nav>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-base font-semibold text-brand-500 dark:bg-brand-500/15">
            {initials(brief.company)}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">{brief.company}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {brief.name} · <a href={`mailto:${brief.email}`} className="text-brand-500 hover:underline">{brief.email}</a>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {brief.aiPriority && (
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityClass(brief.aiPriority)}`}>
                  Prioritas {priorityLabels[brief.aiPriority]}
                </span>
              )}
              {brief.aiServiceCategory && (
                <span className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">
                  {categoryLabels[brief.aiServiceCategory]}
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${aiStatusClass(brief.aiStatus)}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${aiStatusDot(brief.aiStatus)}`} />
                AI {aiStatusLabels[brief.aiStatus]}
              </span>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${pipelineClass(brief.pipelineStatus)}`}>
                {pipelineLabels[brief.pipelineStatus]}
              </span>
            </div>
          </div>
        </div>
        <Link href="/admin/briefs" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Kembali
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
              <h2 className="text-base font-medium text-gray-800 dark:text-white/90">Data brief asli</h2>
              <span className="text-xs text-gray-400">Masuk {formatDateTime(brief.createdAt)}</span>
            </div>
            <div className="p-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Nama</dt>
                  <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">{brief.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Email</dt>
                  <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">{brief.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Perusahaan</dt>
                  <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">{brief.company}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Rentang budget</dt>
                  <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">{budgetLabel(brief.budgetRange)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Target timeline</dt>
                  <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">{formatDate(brief.targetTimeline)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Nomor referensi</dt>
                  <dd className="mt-1 font-mono text-sm text-gray-800 dark:text-white/90">{brief.ref}</dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Jenis kebutuhan</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">{brief.needDescription}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
              <h2 className="text-base font-medium text-gray-800 dark:text-white/90">Hasil analisis AI</h2>
              {brief.aiModel && <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">{brief.aiModel}</span>}
            </div>

            <div className="p-5 sm:p-6">
              {brief.aiStatus === 'succeeded' ? (
                <>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Ringkasan</p>
                  <p className="mt-2 text-base leading-relaxed text-gray-800 dark:text-white/90">{brief.aiSummary}</p>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Kategori layanan</p>
                      <p className="mt-1.5 text-sm font-medium text-gray-800 dark:text-white/90">
                        {brief.aiServiceCategory ? categoryLabels[brief.aiServiceCategory] : '—'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Prioritas</p>
                      <span className={`mt-1.5 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityClass(brief.aiPriority)}`}>
                        {brief.aiPriority ? priorityLabels[brief.aiPriority] : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Alasan prioritas</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{brief.aiPriorityReason}</p>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Informasi yang masih kurang</p>
                      <span className="rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-warning-500">{missing.length} item</span>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {missing.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 rounded-lg border border-warning-50 bg-warning-50/50 px-3 py-2.5 dark:border-warning-500/20 dark:bg-warning-500/10">
                          <svg className="mt-0.5 shrink-0 text-warning-600 dark:text-warning-500" width="15" height="15" viewBox="0 0 16 16" fill="none">
                            <path d="M8 5v3.2M8 11h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                        </li>
                      ))}
                      {missing.length === 0 && <li className="text-sm text-gray-500 dark:text-gray-400">Tidak ada informasi yang kurang.</li>}
                    </ul>
                  </div>

                  {brief.aiProcessedAt && (
                    <p className="mt-6 border-t border-gray-100 pt-4 text-xs text-gray-400 dark:border-gray-800">Diproses {formatDateTime(brief.aiProcessedAt)}</p>
                  )}
                </>
              ) : brief.aiStatus === 'failed' ? (
                <div className="rounded-xl border border-error-500/20 bg-error-50 p-4 dark:border-error-500/25 dark:bg-error-500/10">
                  <p className="text-sm font-medium text-error-700 dark:text-error-500">Analisis AI gagal</p>
                  <p className="mt-1 text-xs leading-relaxed text-error-600/80 dark:text-error-500/80">{brief.aiLastError || 'Tidak diketahui.'}</p>
                  <form action={reprocessBrief} className="mt-3">
                    <input type="hidden" name="id" value={brief.id} />
                    <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3.5 py-2 text-xs font-medium text-white hover:bg-brand-600">
                      Proses ulang sekarang
                    </button>
                  </form>
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                  {brief.aiStatus === 'processing' ? 'Sedang diproses AI…' : 'Menunggu diproses AI.'} Muat ulang halaman untuk melihat status terbaru.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
              <h2 className="text-base font-medium text-gray-800 dark:text-white/90">Riwayat proses AI</h2>
            </div>
            <div className="max-w-full overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['Percobaan', 'Waktu', 'Model', 'Durasi', 'Hasil'].map((label) => (
                      <th key={label} className="px-5 py-3 text-left sm:px-6">
                        <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">{label}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {brief.runs.map((run) => (
                    <tr key={run.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                      <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300 sm:px-6">#{run.attempt}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 sm:px-6">{formatDateTime(run.createdAt)}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500 dark:text-gray-400 sm:px-6">{run.model}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 sm:px-6">{(run.latencyMs / 1000).toFixed(1)}s</td>
                      <td className="px-5 py-3.5 sm:px-6">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${run.status === 'succeeded' ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500' : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${run.status === 'succeeded' ? 'bg-success-500' : 'bg-error-500'}`} />
                          {run.status === 'succeeded' ? 'Berhasil' : 'Gagal'}
                        </span>
                        {run.error && <p className="mt-1 max-w-[280px] truncate text-[11px] text-error-600 dark:text-error-500" title={run.error}>{run.error}</p>}
                      </td>
                    </tr>
                  ))}
                  {brief.runs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400 sm:px-6">
                        Belum ada percobaan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
              <h2 className="text-base font-medium text-gray-800 dark:text-white/90">Status pipeline</h2>
              <p className="mt-1 text-xs text-gray-400">Hanya transisi yang diizinkan yang ditampilkan.</p>
            </div>
            <div className="space-y-2 p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Saat ini</span>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${pipelineClass(brief.pipelineStatus)}`}>{pipelineLabels[brief.pipelineStatus]}</span>
              </div>
              {nextStatuses.map((status: PipelineStatus, index: number) => (
                <form key={status} action={updatePipeline}>
                  <input type="hidden" name="id" value={brief.id} />
                  <input type="hidden" name="to" value={status} />
                  <button
                    type="submit"
                    className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm font-medium transition ${
                      index === 0
                        ? 'border-brand-500 bg-brand-500 text-white hover:bg-brand-600'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    <span>{pipelineActionLabels[status]}</span>
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M13 8l-4-4M13 8l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </form>
              ))}
              {nextStatuses.length === 0 && <p className="rounded-lg bg-gray-50 px-3.5 py-2.5 text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">Status final. Tidak ada transisi lanjutan.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
              <h2 className="text-base font-medium text-gray-800 dark:text-white/90">Aksi</h2>
            </div>
            <div className="space-y-2.5 p-5 sm:p-6">
              <form action={reprocessBrief}>
                <input type="hidden" name="id" value={brief.id} />
                <button
                  type="submit"
                  disabled={brief.aiStatus === 'processing'}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2.5 8a5.5 5.5 0 1 1 1.6 3.9M2.5 8V4.5M2.5 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Proses ulang AI
                </button>
              </form>
              <p className="text-xs leading-relaxed text-gray-400">Proses ulang memakai kredensial AI yang sedang aktif di Pengaturan.</p>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">Riwayat status</h2>
            <ul className="mt-3 space-y-3">
              {brief.events.map((event) => (
                <li key={event.id} className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{event.fromStatus ? pipelineLabels[event.fromStatus] : '—'}</span>
                  {' → '}
                  <span className="font-medium text-gray-700 dark:text-gray-300">{pipelineLabels[event.toStatus]}</span>
                  <span className="block text-gray-400">{formatDateTime(event.createdAt)}</span>
                </li>
              ))}
              {brief.events.length === 0 && <li className="text-xs text-gray-400">Belum ada perubahan status.</li>}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function budgetLabel(value: string) {
  const labels: Record<string, string> = {
    under_10: '< Rp 10 juta',
    from_10_25: 'Rp 10 – 25 juta',
    from_25_50: 'Rp 25 – 50 juta',
    from_50_100: 'Rp 50 – 100 juta',
    above_100: '> Rp 100 juta',
  };
  return labels[value] ?? value;
}

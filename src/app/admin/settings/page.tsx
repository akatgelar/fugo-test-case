import { prisma } from '@/lib/db';
import { requireAdminPage } from '@/lib/auth';
import { activateCredential, deactivateCredential } from '@/actions/settings';
import AddCredentialDialog from '@/components/AddCredentialDialog';
import { formatDateTime, maskKey } from '@/lib/ui';

export default async function SettingsPage() {
  await requireAdminPage();
  const credentials = await prisma.aiCredential.findMany({ orderBy: { createdAt: 'asc' } });
  const hasActive = credentials.some((credential) => credential.isActive);

  return (
    <div className="mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Pengaturan</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Daftar API key yang dipakai untuk menganalisis brief.</p>
        </div>
        <AddCredentialDialog />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
          <div>
            <h2 className="text-base font-medium text-gray-800 dark:text-white/90">API key</h2>
            <p className="mt-1 text-xs text-gray-400">Satu baris aktif dipakai pemroses AI. Baris lain menjadi cadangan.</p>
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-white/5 dark:text-gray-400">{credentials.length} key</span>
        </div>

        {!hasActive && (
          <div className="flex items-start gap-2.5 border-b border-error-500/20 bg-error-50 px-5 py-3 dark:border-error-500/25 dark:bg-error-500/10 sm:px-6">
            <svg className="mt-0.5 shrink-0 text-error-500" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 4.8v3.6M8 11.2h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-xs leading-relaxed text-error-700 dark:text-error-500">Tidak ada API key aktif. Brief baru akan gagal diproses sampai salah satu baris diaktifkan.</p>
          </div>
        )}

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['URL API', 'API key', 'Nama model', 'Status', ''].map((label, index) => (
                  <th key={label || index} className="px-5 py-3 text-left sm:px-6">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">{label}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {credentials.map((credential) => (
                <tr key={credential.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <td className="px-5 py-4 sm:px-6">
                    <p className="break-all font-mono text-xs text-gray-700 dark:text-gray-300">{credential.baseUrl}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400">Ditambahkan {formatDateTime(credential.createdAt)}</p>
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    <span className="whitespace-nowrap font-mono text-xs text-gray-600 dark:text-gray-300">{maskKey(credential.apiKey)}</span>
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    <span className="whitespace-nowrap rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600 dark:bg-white/5 dark:text-gray-300">{credential.model}</span>
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        credential.isActive
                          ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500'
                          : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${credential.isActive ? 'bg-success-500' : 'bg-gray-400'}`} />
                      {credential.isActive ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right sm:px-6">
                    <form action={credential.isActive ? deactivateCredential : activateCredential}>
                      <input type="hidden" name="id" value={credential.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {credential.isActive ? 'Non-aktifkan' : 'Aktifkan'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {credentials.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-gray-800 dark:text-white/90">Belum ada API key</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tambahkan minimal satu key supaya brief baru bisa dianalisis.</p>
          </div>
        )}

        <div className="flex items-start gap-2.5 border-t border-gray-100 px-5 py-3.5 dark:border-gray-800 sm:px-6">
          <svg className="mt-0.5 shrink-0 text-gray-400" width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 7.2v3.4M8 5.4h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg> 
        </div>
      </section>
    </div>
  );
}

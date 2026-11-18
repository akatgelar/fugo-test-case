import { prisma } from '@/lib/db';
import { requireAdminPage } from '@/lib/auth';
import { toggleUser } from '@/actions/users';
import AddUserDialog from '@/components/AddUserDialog';
import { formatDateTime, initials } from '@/lib/ui';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function UsersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage();
  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : '';
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });

  return (
    <div className="mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">User</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Akun yang bisa login ke dashboard. Semua akun berperan admin.</p>
        </div>
        <AddUserDialog />
      </div>

      {error === 'last_admin' && (
        <div className="mb-4 rounded-xl border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/25 dark:bg-error-500/10 dark:text-error-500">
          Tidak bisa menonaktifkan admin terakhir yang aktif.
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
          <div>
            <h2 className="text-base font-medium text-gray-800 dark:text-white/90">Daftar user</h2>
            <p className="mt-1 text-xs text-gray-400">Menonaktifkan user langsung mencabut semua sesi login-nya.</p>
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-white/5 dark:text-gray-400">{users.length} user</span>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['User', 'Status', 'Terakhir login', ''].map((label, index) => (
                  <th key={label || index} className="px-5 py-3 text-left sm:px-6">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">{label}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
                        {initials(user.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-800 text-theme-sm dark:text-white/90">{user.name}</p>
                        <p className="truncate text-gray-500 text-theme-xs dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.isActive
                          ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500'
                          : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-success-500' : 'bg-gray-400'}`} />
                      {user.isActive ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500 dark:text-gray-400 sm:px-6">
                    {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Belum pernah'}
                  </td>
                  <td className="px-5 py-4 text-right sm:px-6">
                    <form action={toggleUser}>
                      <input type="hidden" name="id" value={user.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {user.isActive ? 'Non-aktifkan' : 'Aktifkan'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

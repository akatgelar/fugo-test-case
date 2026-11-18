import AdminShell from '@/components/AdminShell';
import { requireAdminPage } from '@/lib/auth';
import { sweepStaleBriefs } from '@/lib/ai';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage();
  try {
    await sweepStaleBriefs();
  } catch {}
  return <AdminShell userName={user.name} userEmail={user.email}>{children}</AdminShell>;
}

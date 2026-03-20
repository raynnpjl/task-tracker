import { ProjectWorkspace } from '@/components/dashboard/project-workspace';
import { redirect } from 'next/navigation';
import { requireSessionUser } from '@/lib/auth/require-session-user';

export default async function DashboardPage() {
  try {
    await requireSessionUser();
  } catch {
    redirect('/login');
  }
  return <ProjectWorkspace />;
}

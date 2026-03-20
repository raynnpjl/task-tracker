import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

export async function requireSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    throw new Error('NO_SESSION');
  }

  const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

  if (!decoded.email_verified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  return decoded;
}
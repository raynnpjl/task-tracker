import { adminAuth } from '@/lib/firebase/admin';

export async function requireUser(req: Request) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('MISSING_TOKEN');
  }

  const idToken = authHeader.slice(7);
  return adminAuth.verifyIdToken(idToken);
}
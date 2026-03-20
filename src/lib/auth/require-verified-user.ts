import { adminAuth } from '@/lib/firebase/admin';

export async function requireVerifiedUser(req: Request) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing token');
  }

  const idToken = authHeader.slice(7);
  const decoded = await adminAuth.verifyIdToken(idToken);

  if (!decoded.email_verified) {
    throw new Error('Email not verified');
  }

  return decoded;
}
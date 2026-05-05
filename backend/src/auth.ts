import { SignJWT, jwtVerify } from 'jose';
import type { Request, RequestHandler } from 'express';

const JWT_ALG = 'HS256';
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'wavefront-dev-secret-change-me'
);

export async function signUserToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifyToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const sub = payload.sub;
    return typeof sub === 'string' ? sub : null;
  } catch {
    return null;
  }
}

export function authMiddleware(required = true): RequestHandler {
  return async (req, res, next) => {
    const h = req.headers.authorization;
    const token = h?.startsWith('Bearer ') ? h.slice(7) : undefined;
    const userId = await verifyToken(token);
    (req as AuthedRequest).userId = userId ?? undefined;
    if (required && !userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    next();
  };
}

export type AuthedRequest = Request & { userId?: string };

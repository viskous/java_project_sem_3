import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config';
import { JWTPayload, UserRole } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Access token is missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, CONFIG.JWT_SECRET) as JWTPayload;
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired access token' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }

    next();
  };
}

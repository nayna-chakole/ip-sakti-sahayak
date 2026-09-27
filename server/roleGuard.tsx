import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
type AccessRole = string;

export function requireRole(...allowed: AccessRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const user = req.user as typeof req.user & { accessRole: AccessRole };
    if (!allowed.includes(user.accessRole)) {
      return res.status(403).json({
        error: `This action requires ${allowed.join(' or ')} access. Your current role (${user.accessRole}) does not have permission.`
      });
    }
    next();
  };
}
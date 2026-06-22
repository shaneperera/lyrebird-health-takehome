import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/domain.js';
import { UnauthorizedError } from '../types/errors.js';

// Extend Express Request to include role
declare global {
  namespace Express {
    interface Request {
      userRole?: UserRole;
    }
  }
}

export const authenticateRole = (req: Request, res: Response, next: NextFunction) => {
  const roleHeader = req.headers['x-role'] as string;

  if (!roleHeader || !Object.values(UserRole).includes(roleHeader as UserRole)) {
    return next(new UnauthorizedError('Invalid or missing X-Role header'));
  }

  req.userRole = roleHeader as UserRole;
  next();
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return next(new UnauthorizedError('Insufficient permissions'));
    }
    next();
  };
};

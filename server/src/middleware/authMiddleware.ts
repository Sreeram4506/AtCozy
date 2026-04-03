import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: { id: string, role: string };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Lazy import to ensure DB is connected before auth module loads
    const { auth } = await import('../lib/auth.js');
    const sessionContext = await auth.api.getSession({
      headers: req.headers as any
    });

    if (!sessionContext?.session) {
      return res.status(401).json({ message: 'No session, authorization denied' });
    }

    req.user = { 
      id: sessionContext.user.id, 
      role: (sessionContext.user as any).role || 'user' 
    };
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(401).json({ message: 'Session is not valid' });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};
